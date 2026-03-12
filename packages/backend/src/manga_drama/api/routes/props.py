from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from manga_drama.database import get_db
from manga_drama.models import Prop, PropState

router = APIRouter(tags=["props"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class PropCreate(BaseModel):
    name: str
    name_en: str = ""
    category: str = "other"
    prop_level: str = "C"
    description: str = ""
    size_reference: str = ""
    owner_character_id: Optional[int] = None
    visual_keywords: list = []


class PropUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    category: Optional[str] = None
    prop_level: Optional[str] = None
    description: Optional[str] = None
    size_reference: Optional[str] = None
    owner_character_id: Optional[int] = None
    visual_keywords: Optional[list] = None


class PropStateCreate(BaseModel):
    label: str
    description: str = ""
    sort_order: int = 0


class PropStateUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    selected_image_id: Optional[int] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _state_to_dict(s: PropState) -> dict:
    return {
        "id": s.id,
        "prop_id": s.prop_id,
        "label": s.label,
        "description": s.description,
        "selected_image_id": s.selected_image_id,
        "sort_order": s.sort_order,
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }


def _prop_to_dict(p: Prop, include_states: bool = False) -> dict:
    data = {
        "id": p.id,
        "project_id": p.project_id,
        "name": p.name,
        "name_en": p.name_en,
        "category": p.category,
        "prop_level": p.prop_level,
        "description": p.description,
        "size_reference": p.size_reference,
        "owner_character_id": p.owner_character_id,
        "visual_keywords": p.visual_keywords,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
    }
    if include_states:
        data["states"] = [_state_to_dict(s) for s in p.states]
    return data


# ---------------------------------------------------------------------------
# Prop endpoints
# ---------------------------------------------------------------------------


@router.post("/projects/{project_id}/props", status_code=201)
async def create_prop(
    project_id: int, body: PropCreate, db: AsyncSession = Depends(get_db)
):
    prop = Prop(project_id=project_id, **body.model_dump())
    db.add(prop)
    await db.flush()
    return _prop_to_dict(prop)


@router.get("/projects/{project_id}/props")
async def list_props(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Prop)
        .options(selectinload(Prop.states))
        .where(Prop.project_id == project_id)
        .order_by(Prop.id)
    )
    return [_prop_to_dict(p, include_states=True) for p in result.scalars()]


@router.get("/props/{prop_id}")
async def get_prop(prop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Prop)
        .options(selectinload(Prop.states))
        .where(Prop.id == prop_id)
    )
    prop = result.scalar_one_or_none()
    if not prop:
        raise HTTPException(404, "Prop not found")
    return _prop_to_dict(prop, include_states=True)


@router.put("/props/{prop_id}")
async def update_prop(
    prop_id: int, body: PropUpdate, db: AsyncSession = Depends(get_db)
):
    prop = await db.get(Prop, prop_id)
    if not prop:
        raise HTTPException(404, "Prop not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(prop, key, value)
    await db.flush()
    return _prop_to_dict(prop)


@router.delete("/props/{prop_id}", status_code=204)
async def delete_prop(prop_id: int, db: AsyncSession = Depends(get_db)):
    prop = await db.get(Prop, prop_id)
    if not prop:
        raise HTTPException(404, "Prop not found")
    await db.delete(prop)


# ---------------------------------------------------------------------------
# Prop State endpoints
# ---------------------------------------------------------------------------


@router.post("/props/{prop_id}/states", status_code=201)
async def create_prop_state(
    prop_id: int, body: PropStateCreate, db: AsyncSession = Depends(get_db)
):
    prop = await db.get(Prop, prop_id)
    if not prop:
        raise HTTPException(404, "Prop not found")
    state = PropState(prop_id=prop_id, **body.model_dump())
    db.add(state)
    await db.flush()
    return _state_to_dict(state)


@router.get("/props/{prop_id}/states")
async def list_prop_states(prop_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PropState)
        .where(PropState.prop_id == prop_id)
        .order_by(PropState.sort_order)
    )
    return [_state_to_dict(s) for s in result.scalars()]


@router.put("/props/{prop_id}/states/{state_id}")
async def update_prop_state(
    prop_id: int,
    state_id: int,
    body: PropStateUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PropState).where(
            PropState.id == state_id,
            PropState.prop_id == prop_id,
        )
    )
    state = result.scalar_one_or_none()
    if not state:
        raise HTTPException(404, "Prop state not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(state, key, value)
    await db.flush()
    return _state_to_dict(state)


@router.delete("/props/{prop_id}/states/{state_id}", status_code=204)
async def delete_prop_state(
    prop_id: int, state_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PropState).where(
            PropState.id == state_id,
            PropState.prop_id == prop_id,
        )
    )
    state = result.scalar_one_or_none()
    if not state:
        raise HTTPException(404, "Prop state not found")
    await db.delete(state)
