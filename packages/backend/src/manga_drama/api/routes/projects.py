from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from manga_drama.database import get_db
from manga_drama.models import Episode, Panel, Project

router = APIRouter(prefix="/projects", tags=["projects"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class ProjectCreate(BaseModel):
    title: str
    description: str = ""
    genre: str = ""
    visual_style: str = ""
    global_style: str = ""


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    visual_style: Optional[str] = None
    global_style: Optional[str] = None
    analysis_model: Optional[str] = None
    image_model: Optional[str] = None
    video_model: Optional[str] = None
    character_model: Optional[str] = None
    storyboard_model: Optional[str] = None
    voice_model: Optional[str] = None
    budget_limit: Optional[float] = None
    default_panel_count: Optional[int] = None
    output_width: Optional[int] = None
    output_height: Optional[int] = None
    global_prefix: Optional[str] = None
    status: Optional[str] = None


class EpisodeSummary(BaseModel):
    id: int
    episode_number: int
    title: str
    status: str
    panel_count: int

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    id: int
    title: str
    description: str
    genre: str
    visual_style: str
    status: str
    budget_limit: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    episode_count: int = 0
    panel_count: int = 0

    class Config:
        from_attributes = True


class ProjectDetail(BaseModel):
    id: int
    title: str
    description: str
    genre: str
    visual_style: str
    status: str
    creative_brief: dict | None = None
    global_style: str
    global_prefix: str
    output_width: int
    output_height: int
    default_panel_count: int
    budget_limit: float
    analysis_model: str
    image_model: str
    video_model: str
    character_model: str
    storyboard_model: str
    voice_model: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    episodes: list[EpisodeSummary] = []
    character_count: int = 0
    scene_count: int = 0
    prop_count: int = 0

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _project_to_detail(project: Project, episodes_with_counts: list, counts: dict) -> dict:
    """Build the full ProjectDetail dict from a Project ORM object."""
    eps = []
    for ep, pc in episodes_with_counts:
        eps.append(
            EpisodeSummary(
                id=ep.id,
                episode_number=ep.episode_number,
                title=ep.title,
                status=ep.status,
                panel_count=pc,
            )
        )

    return ProjectDetail(
        id=project.id,
        title=project.title,
        description=project.description,
        genre=project.genre,
        visual_style=project.visual_style,
        status=project.status,
        creative_brief=project.creative_brief,
        global_style=project.global_style,
        global_prefix=project.global_prefix,
        output_width=project.output_width,
        output_height=project.output_height,
        default_panel_count=project.default_panel_count,
        budget_limit=project.budget_limit,
        analysis_model=project.analysis_model,
        image_model=project.image_model,
        video_model=project.video_model,
        character_model=project.character_model,
        storyboard_model=project.storyboard_model,
        voice_model=project.voice_model,
        created_at=project.created_at,
        updated_at=project.updated_at,
        episodes=eps,
        character_count=counts.get("characters", 0),
        scene_count=counts.get("scenes", 0),
        prop_count=counts.get("props", 0),
    ).model_dump()


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("", status_code=201)
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(**body.model_dump())
    db.add(project)
    await db.flush()
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "genre": project.genre,
        "visual_style": project.visual_style,
        "status": project.status,
        "budget_limit": project.budget_limit,
        "output_width": project.output_width,
        "output_height": project.output_height,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


@router.get("")
async def list_projects(
    limit: int = 50, offset: int = 0, db: AsyncSession = Depends(get_db)
):
    # Sub-query: episode count per project
    episode_count_sq = (
        select(
            Episode.project_id,
            func.count(Episode.id).label("episode_count"),
        )
        .group_by(Episode.project_id)
        .subquery()
    )

    # Sub-query: panel count per project (via episodes)
    panel_count_sq = (
        select(
            Episode.project_id,
            func.count(Panel.id).label("panel_count"),
        )
        .outerjoin(Panel, Panel.episode_id == Episode.id)
        .group_by(Episode.project_id)
        .subquery()
    )

    stmt = (
        select(
            Project,
            func.coalesce(episode_count_sq.c.episode_count, 0).label("episode_count"),
            func.coalesce(panel_count_sq.c.panel_count, 0).label("panel_count"),
        )
        .outerjoin(episode_count_sq, Project.id == episode_count_sq.c.project_id)
        .outerjoin(panel_count_sq, Project.id == panel_count_sq.c.project_id)
        .order_by(Project.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items = []
    for project, ep_count, pn_count in rows:
        items.append(
            ProjectListItem(
                id=project.id,
                title=project.title,
                description=project.description,
                genre=project.genre,
                visual_style=project.visual_style,
                status=project.status,
                budget_limit=project.budget_limit,
                created_at=project.created_at,
                updated_at=project.updated_at,
                episode_count=ep_count,
                panel_count=pn_count,
            ).model_dump()
        )
    return items


@router.get("/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    # Fetch episodes with panel counts
    ep_stmt = (
        select(Episode, func.count(Panel.id).label("panel_count"))
        .outerjoin(Panel, Panel.episode_id == Episode.id)
        .where(Episode.project_id == project_id)
        .group_by(Episode.id)
        .order_by(Episode.episode_number)
    )
    ep_result = await db.execute(ep_stmt)
    episodes_with_counts = ep_result.all()

    # Counts for characters, scenes, props
    from manga_drama.models import Character, Prop, Scene

    char_count_result = await db.execute(
        select(func.count(Character.id)).where(Character.project_id == project_id)
    )
    scene_count_result = await db.execute(
        select(func.count(Scene.id)).where(Scene.project_id == project_id)
    )
    prop_count_result = await db.execute(
        select(func.count(Prop.id)).where(Prop.project_id == project_id)
    )

    counts = {
        "characters": char_count_result.scalar() or 0,
        "scenes": scene_count_result.scalar() or 0,
        "props": prop_count_result.scalar() or 0,
    }

    return _project_to_detail(project, episodes_with_counts, counts)


@router.put("/{project_id}")
async def update_project(
    project_id: int, body: ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    await db.flush()

    # Return the full object after update
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "genre": project.genre,
        "visual_style": project.visual_style,
        "status": project.status,
        "global_style": project.global_style,
        "global_prefix": project.global_prefix,
        "output_width": project.output_width,
        "output_height": project.output_height,
        "default_panel_count": project.default_panel_count,
        "budget_limit": project.budget_limit,
        "analysis_model": project.analysis_model,
        "image_model": project.image_model,
        "video_model": project.video_model,
        "character_model": project.character_model,
        "storyboard_model": project.storyboard_model,
        "voice_model": project.voice_model,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    await db.delete(project)


@router.get("/{project_id}/entity-map")
async def get_entity_map(project_id: int, db: AsyncSession = Depends(get_db)):
    """Return lightweight lookup arrays for the Script Editor entity highlighting."""
    from manga_drama.models import Character, Prop, Scene

    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")

    chars_result = await db.execute(
        select(Character.id, Character.name, Character.name_en).where(
            Character.project_id == project_id
        )
    )
    scenes_result = await db.execute(
        select(Scene.id, Scene.name, Scene.name_en).where(
            Scene.project_id == project_id
        )
    )
    props_result = await db.execute(
        select(Prop.id, Prop.name, Prop.name_en).where(
            Prop.project_id == project_id
        )
    )

    return {
        "characters": [
            {"id": c.id, "name": c.name, "name_en": c.name_en}
            for c in chars_result.all()
        ],
        "scenes": [
            {"id": s.id, "name": s.name, "name_en": s.name_en}
            for s in scenes_result.all()
        ],
        "props": [
            {"id": p.id, "name": p.name, "name_en": p.name_en}
            for p in props_result.all()
        ],
    }
