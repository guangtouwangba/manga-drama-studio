from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from manga_drama.database import get_db
from manga_drama.models import Character, CharacterAppearance

router = APIRouter(tags=["characters"])


class CharacterCreate(BaseModel):
    name: str
    name_en: str = ""
    gender: str = ""
    age_group: str = ""
    role_level: str = "C"
    personality: str = ""
    base_appearance: str = ""


class AppearanceCreate(BaseModel):
    label: str
    description: str = ""
    prompt_modifier: str = ""


@router.post("/projects/{project_id}/characters")
async def create_character(
    project_id: int, body: CharacterCreate, db: AsyncSession = Depends(get_db)
):
    char = Character(project_id=project_id, **body.model_dump())
    db.add(char)
    await db.flush()
    return {"id": char.id, "name": char.name}


@router.get("/projects/{project_id}/characters")
async def list_characters(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Character).where(Character.project_id == project_id)
    )
    return [
        {"id": c.id, "name": c.name, "role_level": c.role_level, "gender": c.gender}
        for c in result.scalars()
    ]


@router.put("/characters/{char_id}")
async def update_character(
    char_id: int, body: dict, db: AsyncSession = Depends(get_db)
):
    char = await db.get(Character, char_id)
    if not char:
        raise HTTPException(404)
    for k, v in body.items():
        if hasattr(char, k):
            setattr(char, k, v)
    return {"id": char.id, "name": char.name}


@router.post("/characters/{char_id}/appearances")
async def add_appearance(
    char_id: int, body: AppearanceCreate, db: AsyncSession = Depends(get_db)
):
    appearance = CharacterAppearance(character_id=char_id, **body.model_dump())
    db.add(appearance)
    await db.flush()
    return {"id": appearance.id, "label": appearance.label}


@router.get("/characters/{char_id}/appearances")
async def list_appearances(char_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CharacterAppearance)
        .where(CharacterAppearance.character_id == char_id)
        .order_by(CharacterAppearance.sort_order)
    )
    return [
        {"id": a.id, "label": a.label, "description": a.description}
        for a in result.scalars()
    ]
