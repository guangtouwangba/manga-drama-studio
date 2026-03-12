from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from manga_drama.database import get_db
from manga_drama.models import Project

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    title: str
    description: str = ""
    genre: str = ""
    visual_style: str = ""
    global_style: str = ""


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    genre: str | None = None
    visual_style: str | None = None
    global_style: str | None = None
    analysis_model: str | None = None
    image_model: str | None = None
    video_model: str | None = None
    character_model: str | None = None
    storyboard_model: str | None = None
    voice_model: str | None = None


@router.post("")
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(**body.model_dump())
    db.add(project)
    await db.flush()
    return {"id": project.id, "title": project.title}


@router.get("")
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    projects = result.scalars().all()
    return [
        {"id": p.id, "title": p.title, "status": p.status, "genre": p.genre}
        for p in projects
    ]


@router.get("/{project_id}")
async def get_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
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
        "analysis_model": project.analysis_model,
        "image_model": project.image_model,
        "video_model": project.video_model,
    }


@router.put("/{project_id}")
async def update_project(
    project_id: int, body: ProjectUpdate, db: AsyncSession = Depends(get_db)
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    return {"id": project.id, "title": project.title}


@router.delete("/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(404, "Project not found")
    await db.delete(project)
    return {"deleted": True}
