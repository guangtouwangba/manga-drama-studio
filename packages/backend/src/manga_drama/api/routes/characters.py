from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from manga_drama.database import get_db
from manga_drama.models import Character, CharacterAppearance

router = APIRouter(tags=["characters"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class CharacterCreate(BaseModel):
    name: str
    name_en: str = ""
    gender: str = ""
    age_group: str = ""
    role_level: str = "C"
    archetype: str = ""
    personality: str = ""
    base_appearance: str = ""
    costume_tier: int = 3
    visual_keywords: list = []
    image_prompt: str = ""
    voice_preset_id: str = ""
    seed_value: Optional[int] = None


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    name_en: Optional[str] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    role_level: Optional[str] = None
    archetype: Optional[str] = None
    personality: Optional[str] = None
    base_appearance: Optional[str] = None
    costume_tier: Optional[int] = None
    visual_keywords: Optional[list] = None
    image_prompt: Optional[str] = None
    reference_image: Optional[str] = None
    lora_model_path: Optional[str] = None
    face_embedding_path: Optional[str] = None
    voice_preset_id: Optional[str] = None
    seed_value: Optional[int] = None


class AppearanceCreate(BaseModel):
    label: str
    description: str = ""
    prompt_modifier: str = ""
    sort_order: int = 0


class AppearanceUpdate(BaseModel):
    label: Optional[str] = None
    description: Optional[str] = None
    prompt_modifier: Optional[str] = None
    sort_order: Optional[int] = None
    selected_image_id: Optional[int] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _appearance_to_dict(a: CharacterAppearance) -> dict:
    return {
        "id": a.id,
        "character_id": a.character_id,
        "label": a.label,
        "description": a.description,
        "prompt_modifier": a.prompt_modifier,
        "selected_image_id": a.selected_image_id,
        "sort_order": a.sort_order,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
    }


def _character_to_dict(c: Character, include_appearances: bool = False) -> dict:
    data = {
        "id": c.id,
        "project_id": c.project_id,
        "name": c.name,
        "name_en": c.name_en,
        "gender": c.gender,
        "age_group": c.age_group,
        "role_level": c.role_level,
        "archetype": c.archetype,
        "personality": c.personality,
        "base_appearance": c.base_appearance,
        "costume_tier": c.costume_tier,
        "visual_keywords": c.visual_keywords,
        "image_prompt": c.image_prompt,
        "reference_image": c.reference_image,
        "lora_model_path": c.lora_model_path,
        "face_embedding_path": c.face_embedding_path,
        "voice_preset_id": c.voice_preset_id,
        "seed_value": c.seed_value,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }
    if include_appearances:
        data["appearances"] = [_appearance_to_dict(a) for a in c.appearances]
    return data


# ---------------------------------------------------------------------------
# Character endpoints
# ---------------------------------------------------------------------------


@router.post("/projects/{project_id}/characters", status_code=201)
async def create_character(
    project_id: int, body: CharacterCreate, db: AsyncSession = Depends(get_db)
):
    char = Character(project_id=project_id, **body.model_dump())
    db.add(char)
    await db.flush()
    return _character_to_dict(char)


@router.get("/projects/{project_id}/characters")
async def list_characters(project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Character)
        .options(selectinload(Character.appearances))
        .where(Character.project_id == project_id)
        .order_by(Character.id)
    )
    return [_character_to_dict(c, include_appearances=True) for c in result.scalars()]


@router.get("/characters/{char_id}")
async def get_character(char_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Character)
        .options(selectinload(Character.appearances))
        .where(Character.id == char_id)
    )
    char = result.scalar_one_or_none()
    if not char:
        raise HTTPException(404, "Character not found")
    return _character_to_dict(char, include_appearances=True)


@router.put("/characters/{char_id}")
async def update_character(
    char_id: int, body: CharacterUpdate, db: AsyncSession = Depends(get_db)
):
    char = await db.get(Character, char_id)
    if not char:
        raise HTTPException(404, "Character not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(char, key, value)
    await db.flush()
    return _character_to_dict(char)


@router.delete("/characters/{char_id}", status_code=204)
async def delete_character(char_id: int, db: AsyncSession = Depends(get_db)):
    char = await db.get(Character, char_id)
    if not char:
        raise HTTPException(404, "Character not found")
    await db.delete(char)


# ---------------------------------------------------------------------------
# Appearance endpoints
# ---------------------------------------------------------------------------


@router.post("/characters/{char_id}/appearances", status_code=201)
async def add_appearance(
    char_id: int, body: AppearanceCreate, db: AsyncSession = Depends(get_db)
):
    char = await db.get(Character, char_id)
    if not char:
        raise HTTPException(404, "Character not found")
    appearance = CharacterAppearance(character_id=char_id, **body.model_dump())
    db.add(appearance)
    await db.flush()
    return _appearance_to_dict(appearance)


@router.get("/characters/{char_id}/appearances")
async def list_appearances(char_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CharacterAppearance)
        .where(CharacterAppearance.character_id == char_id)
        .order_by(CharacterAppearance.sort_order)
    )
    return [_appearance_to_dict(a) for a in result.scalars()]


@router.put("/characters/{char_id}/appearances/{app_id}")
async def update_appearance(
    char_id: int,
    app_id: int,
    body: AppearanceUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CharacterAppearance).where(
            CharacterAppearance.id == app_id,
            CharacterAppearance.character_id == char_id,
        )
    )
    appearance = result.scalar_one_or_none()
    if not appearance:
        raise HTTPException(404, "Appearance not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(appearance, key, value)
    await db.flush()
    return _appearance_to_dict(appearance)


@router.delete("/characters/{char_id}/appearances/{app_id}", status_code=204)
async def delete_appearance(
    char_id: int, app_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CharacterAppearance).where(
            CharacterAppearance.id == app_id,
            CharacterAppearance.character_id == char_id,
        )
    )
    appearance = result.scalar_one_or_none()
    if not appearance:
        raise HTTPException(404, "Appearance not found")
    await db.delete(appearance)
