from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from manga_drama.database import get_db
from manga_drama.models import Scene, SceneView

router = APIRouter(tags=["scenes"])


class SceneCreate(BaseModel):
    name: str
    name_en: str = ""
    description: str = ""


class SceneViewCreate(BaseModel):
    direction: str  # N/S/E/W
    description: str = ""


@router.post("/projects/{project_id}/scenes")
async def create_scene(
    project_id: int, body: SceneCreate, db: AsyncSession = Depends(get_db)
):
    scene = Scene(project_id=project_id, **body.model_dump())
    db.add(scene)
    await db.flush()
    return {"id": scene.id, "name": scene.name}


@router.get("/projects/{project_id}/scenes")
async def list_scenes(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scene).where(Scene.project_id == project_id))
    return [
        {"id": s.id, "name": s.name, "view_grade": s.view_grade}
        for s in result.scalars()
    ]


@router.post("/scenes/{scene_id}/views")
async def add_scene_view(
    scene_id: int, body: SceneViewCreate, db: AsyncSession = Depends(get_db)
):
    view = SceneView(scene_id=scene_id, **body.model_dump())
    db.add(view)
    await db.flush()
    return {"id": view.id, "direction": view.direction}


@router.get("/scenes/{scene_id}/views")
async def list_scene_views(scene_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SceneView).where(SceneView.scene_id == scene_id)
    )
    return [
        {"id": v.id, "direction": v.direction, "description": v.description}
        for v in result.scalars()
    ]
