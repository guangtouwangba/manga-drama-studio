from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from manga_drama.database import get_db
from manga_drama.models import Episode, Panel

router = APIRouter(tags=["episodes"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class EpisodeCreate(BaseModel):
    episode_number: int
    title: str = ""
    script_content: str = ""


class EpisodeUpdate(BaseModel):
    title: Optional[str] = None
    script_content: Optional[str] = None
    status: Optional[str] = None
    episode_number: Optional[int] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _episode_to_dict(ep: Episode, panel_count: int = 0) -> dict:
    word_count = len(ep.script_content.split()) if ep.script_content else 0
    # Rough estimate: ~150 words per minute for narrated content
    estimated_duration_s = (word_count / 150.0) * 60.0 if word_count else 0.0

    return {
        "id": ep.id,
        "project_id": ep.project_id,
        "episode_number": ep.episode_number,
        "title": ep.title,
        "script_content": ep.script_content,
        "status": ep.status,
        "word_count": word_count,
        "estimated_duration_s": round(estimated_duration_s, 1),
        "panel_count": panel_count,
        "created_at": ep.created_at,
        "updated_at": ep.updated_at,
    }


def _episode_summary(ep: Episode, panel_count: int = 0) -> dict:
    return {
        "id": ep.id,
        "project_id": ep.project_id,
        "episode_number": ep.episode_number,
        "title": ep.title,
        "status": ep.status,
        "panel_count": panel_count,
        "created_at": ep.created_at,
        "updated_at": ep.updated_at,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/projects/{project_id}/episodes", status_code=201)
async def create_episode(
    project_id: int, body: EpisodeCreate, db: AsyncSession = Depends(get_db)
):
    ep = Episode(project_id=project_id, **body.model_dump())
    db.add(ep)
    await db.flush()
    return _episode_to_dict(ep)


@router.get("/projects/{project_id}/episodes")
async def list_episodes(project_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Episode, func.count(Panel.id).label("panel_count"))
        .outerjoin(Panel, Panel.episode_id == Episode.id)
        .where(Episode.project_id == project_id)
        .group_by(Episode.id)
        .order_by(Episode.episode_number)
    )
    result = await db.execute(stmt)
    return [_episode_summary(ep, pc) for ep, pc in result.all()]


@router.get("/episodes/{episode_id}")
async def get_episode(episode_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Episode, func.count(Panel.id).label("panel_count"))
        .outerjoin(Panel, Panel.episode_id == Episode.id)
        .where(Episode.id == episode_id)
        .group_by(Episode.id)
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if not row:
        raise HTTPException(404, "Episode not found")
    ep, panel_count = row
    return _episode_to_dict(ep, panel_count)


@router.put("/episodes/{episode_id}")
async def update_episode(
    episode_id: int, body: EpisodeUpdate, db: AsyncSession = Depends(get_db)
):
    ep = await db.get(Episode, episode_id)
    if not ep:
        raise HTTPException(404, "Episode not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(ep, key, value)
    await db.flush()

    # Get panel count for response
    pc_result = await db.execute(
        select(func.count(Panel.id)).where(Panel.episode_id == episode_id)
    )
    panel_count = pc_result.scalar() or 0

    return _episode_to_dict(ep, panel_count)


@router.delete("/episodes/{episode_id}", status_code=204)
async def delete_episode(episode_id: int, db: AsyncSession = Depends(get_db)):
    ep = await db.get(Episode, episode_id)
    if not ep:
        raise HTTPException(404, "Episode not found")
    await db.delete(ep)
