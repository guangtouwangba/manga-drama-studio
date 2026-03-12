from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from manga_drama.database import get_db
from manga_drama.models import Episode

router = APIRouter(tags=["episodes"])


class EpisodeCreate(BaseModel):
    episode_number: int
    title: str = ""
    script_content: str = ""


@router.post("/projects/{project_id}/episodes")
async def create_episode(
    project_id: int, body: EpisodeCreate, db: AsyncSession = Depends(get_db)
):
    ep = Episode(project_id=project_id, **body.model_dump())
    db.add(ep)
    await db.flush()
    return {"id": ep.id, "episode_number": ep.episode_number}


@router.get("/projects/{project_id}/episodes")
async def list_episodes(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Episode)
        .where(Episode.project_id == project_id)
        .order_by(Episode.episode_number)
    )
    return [
        {
            "id": e.id,
            "episode_number": e.episode_number,
            "title": e.title,
            "status": e.status,
        }
        for e in result.scalars()
    ]


@router.get("/episodes/{episode_id}")
async def get_episode(episode_id: int, db: AsyncSession = Depends(get_db)):
    ep = await db.get(Episode, episode_id)
    if not ep:
        raise HTTPException(404)
    return {
        "id": ep.id,
        "episode_number": ep.episode_number,
        "title": ep.title,
        "script_content": ep.script_content,
        "status": ep.status,
    }


@router.put("/episodes/{episode_id}")
async def update_episode(
    episode_id: int, body: dict, db: AsyncSession = Depends(get_db)
):
    ep = await db.get(Episode, episode_id)
    if not ep:
        raise HTTPException(404)
    for k, v in body.items():
        if hasattr(ep, k):
            setattr(ep, k, v)
    return {"id": ep.id}
