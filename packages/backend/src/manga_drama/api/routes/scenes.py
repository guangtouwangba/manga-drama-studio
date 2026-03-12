from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from manga_drama.database import get_db
from manga_drama.models import Scene, SceneView

router = APIRouter(tags=["scenes"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class SceneCreate(BaseModel):
    name: str
    name_en: str = ""
    description: str = ""
    description_en: str = ""
    floor_plan_ascii: str = ""
    lighting_preset: dict = {}
    color_palette: list = []
    spatial_structure: dict = {}
    view_grade: str = "1-view"


class SceneUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    description: Optional[str] = None
    description_en: Optional[str] = None
    floor_plan_ascii: Optional[str] = None
    lighting_preset: Optional[dict] = None
    color_palette: Optional[list] = None
    spatial_structure: Optional[dict] = None
    view_grade: Optional[str] = None


class SceneViewCreate(BaseModel):
    direction: str  # N/S/E/W
    description: str = ""
    selected_image_id: Optional[int] = None


class SceneViewUpdate(BaseModel):
    direction: Optional[str] = None
    description: Optional[str] = None
    selected_image_id: Optional[int] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _view_to_dict(v: SceneView) -> dict:
    return {
        "id": v.id,
        "scene_id": v.scene_id,
        "direction": v.direction,
        "description": v.description,
        "selected_image_id": v.selected_image_id,
        "created_at": v.created_at,
        "updated_at": v.updated_at,
    }


def _scene_to_dict(s: Scene, include_views: bool = False) -> dict:
    data = {
        "id": s.id,
        "project_id": s.project_id,
        "name": s.name,
        "name_en": s.name_en,
        "description": s.description,
        "description_en": s.description_en,
        "floor_plan_ascii": s.floor_plan_ascii,
        "lighting_preset": s.lighting_preset,
        "color_palette": s.color_palette,
        "spatial_structure": s.spatial_structure,
        "view_grade": s.view_grade,
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }
    if include_views:
        data["views"] = [_view_to_dict(v) for v in s.views]
    return data


# ---------------------------------------------------------------------------
# Scene endpoints
# ---------------------------------------------------------------------------


@router.post("/projects/{project_id}/scenes", status_code=201)
async def create_scene(
    project_id: int, body: SceneCreate, db: AsyncSession = Depends(get_db)
):
    scene = Scene(project_id=project_id, **body.model_dump())
    db.add(scene)
    await db.flush()
    return _scene_to_dict(scene)


@router.get("/projects/{project_id}/scenes")
async def list_scenes(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scene)
        .options(selectinload(Scene.views))
        .where(Scene.project_id == project_id)
        .order_by(Scene.id)
    )
    return [_scene_to_dict(s, include_views=True) for s in result.scalars()]


@router.get("/scenes/{scene_id}")
async def get_scene(scene_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Scene)
        .options(selectinload(Scene.views))
        .where(Scene.id == scene_id)
    )
    scene = result.scalar_one_or_none()
    if not scene:
        raise HTTPException(404, "Scene not found")
    return _scene_to_dict(scene, include_views=True)


@router.put("/scenes/{scene_id}")
async def update_scene(
    scene_id: int, body: SceneUpdate, db: AsyncSession = Depends(get_db)
):
    scene = await db.get(Scene, scene_id)
    if not scene:
        raise HTTPException(404, "Scene not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(scene, key, value)
    await db.flush()
    return _scene_to_dict(scene)


@router.delete("/scenes/{scene_id}", status_code=204)
async def delete_scene(scene_id: int, db: AsyncSession = Depends(get_db)):
    scene = await db.get(Scene, scene_id)
    if not scene:
        raise HTTPException(404, "Scene not found")
    await db.delete(scene)


# ---------------------------------------------------------------------------
# Scene View endpoints
# ---------------------------------------------------------------------------


@router.post("/scenes/{scene_id}/views", status_code=201)
async def add_scene_view(
    scene_id: int, body: SceneViewCreate, db: AsyncSession = Depends(get_db)
):
    scene = await db.get(Scene, scene_id)
    if not scene:
        raise HTTPException(404, "Scene not found")
    view = SceneView(scene_id=scene_id, **body.model_dump())
    db.add(view)
    await db.flush()
    return _view_to_dict(view)


@router.get("/scenes/{scene_id}/views")
async def list_scene_views(scene_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SceneView).where(SceneView.scene_id == scene_id)
    )
    return [_view_to_dict(v) for v in result.scalars()]


@router.put("/scenes/{scene_id}/views/{view_id}")
async def update_scene_view(
    scene_id: int,
    view_id: int,
    body: SceneViewUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SceneView).where(
            SceneView.id == view_id,
            SceneView.scene_id == scene_id,
        )
    )
    view = result.scalar_one_or_none()
    if not view:
        raise HTTPException(404, "Scene view not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(view, key, value)
    await db.flush()
    return _view_to_dict(view)


@router.delete("/scenes/{scene_id}/views/{view_id}", status_code=204)
async def delete_scene_view(
    scene_id: int, view_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SceneView).where(
            SceneView.id == view_id,
            SceneView.scene_id == scene_id,
        )
    )
    view = result.scalar_one_or_none()
    if not view:
        raise HTTPException(404, "Scene view not found")
    await db.delete(view)
