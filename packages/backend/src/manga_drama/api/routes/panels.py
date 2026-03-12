import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from manga_drama.database import get_db
from manga_drama.models import Episode, MediaObject, Panel, VoiceLine

router = APIRouter(tags=["panels"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class PanelCreate(BaseModel):
    panel_number: float
    title: str = ""
    scene_id: Optional[int] = None
    scene_view_direction: Optional[str] = None
    shot_type: str = "MS"
    camera_angle: str = "Eye"
    camera_movement: str = "Fix"
    camera_position_desc: str = ""
    duration: float = 3.0
    action: str = ""
    atmosphere: str = ""
    emotion: str = ""
    emotion_intensity: str = "→"
    dialogue: str = ""
    narration: str = ""
    acting_notes: str = ""
    scene_type: str = "daily"
    visible_set_elements: list = []
    lighting_direction: str = ""
    image_prompt: str = ""
    image_negative_prompt: str = ""
    video_prompt: str = ""
    video_mode: str = "single_frame"
    recommended_tool: str = ""
    characters: list = []
    props: list = []
    is_insert_shot: bool = False
    insert_type: Optional[str] = None
    source_text: str = ""
    bgm_prompt: str = ""
    sound_effect: str = ""
    transition_to_next: str = "cut"
    transition_notes: str = ""


class PanelUpdate(BaseModel):
    panel_number: Optional[float] = None
    title: Optional[str] = None
    scene_id: Optional[int] = None
    scene_view_direction: Optional[str] = None
    shot_type: Optional[str] = None
    camera_angle: Optional[str] = None
    camera_movement: Optional[str] = None
    camera_position_desc: Optional[str] = None
    duration: Optional[float] = None
    action: Optional[str] = None
    atmosphere: Optional[str] = None
    emotion: Optional[str] = None
    emotion_intensity: Optional[str] = None
    dialogue: Optional[str] = None
    narration: Optional[str] = None
    acting_notes: Optional[str] = None
    scene_type: Optional[str] = None
    visible_set_elements: Optional[list] = None
    lighting_direction: Optional[str] = None
    image_prompt: Optional[str] = None
    image_negative_prompt: Optional[str] = None
    video_prompt: Optional[str] = None
    video_mode: Optional[str] = None
    recommended_tool: Optional[str] = None
    characters: Optional[list] = None
    props: Optional[list] = None
    selected_image_id: Optional[int] = None
    selected_video_id: Optional[int] = None
    lip_sync_media_id: Optional[int] = None
    is_insert_shot: Optional[bool] = None
    insert_type: Optional[str] = None
    source_text: Optional[str] = None
    bgm_prompt: Optional[str] = None
    sound_effect: Optional[str] = None
    transition_to_next: Optional[str] = None
    transition_notes: Optional[str] = None
    status: Optional[str] = None


class VoiceLineCreate(BaseModel):
    character_id: Optional[int] = None
    speaker_name: str = ""
    dialogue: str
    emotion: str = "neutral"
    emotion_strength: float = 0.2
    voice_preset_id: str = ""
    sort_order: int = 0


class VoiceLineUpdate(BaseModel):
    character_id: Optional[int] = None
    speaker_name: Optional[str] = None
    dialogue: Optional[str] = None
    emotion: Optional[str] = None
    emotion_strength: Optional[float] = None
    voice_preset_id: Optional[str] = None
    sort_order: Optional[int] = None


class GenerateRequest(BaseModel):
    model_override: Optional[str] = None


class GenerateVideoRequest(BaseModel):
    model_override: Optional[str] = None
    tool_override: Optional[str] = None


class GenerateVoiceRequest(BaseModel):
    voice_line_id: int


class GenerateLipsyncRequest(BaseModel):
    video_media_id: int
    audio_media_id: int


class UndoRegenerateRequest(BaseModel):
    media_type: str  # "image" or "video"


class SelectCandidateRequest(BaseModel):
    media_object_id: int
    media_type: str  # "image" or "video"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _voice_line_to_dict(vl: VoiceLine) -> dict:
    return {
        "id": vl.id,
        "panel_id": vl.panel_id,
        "character_id": vl.character_id,
        "speaker_name": vl.speaker_name,
        "dialogue": vl.dialogue,
        "emotion": vl.emotion,
        "emotion_strength": vl.emotion_strength,
        "voice_preset_id": vl.voice_preset_id,
        "selected_media_id": vl.selected_media_id,
        "sort_order": vl.sort_order,
        "created_at": vl.created_at,
        "updated_at": vl.updated_at,
    }


def _panel_to_dict(p: Panel, include_voice_lines: bool = False) -> dict:
    data = {
        "id": p.id,
        "episode_id": p.episode_id,
        "panel_number": p.panel_number,
        "title": p.title,
        "scene_id": p.scene_id,
        "scene_view_direction": p.scene_view_direction,
        "shot_type": p.shot_type,
        "camera_angle": p.camera_angle,
        "camera_movement": p.camera_movement,
        "camera_position_desc": p.camera_position_desc,
        "duration": p.duration,
        "action": p.action,
        "atmosphere": p.atmosphere,
        "emotion": p.emotion,
        "emotion_intensity": p.emotion_intensity,
        "dialogue": p.dialogue,
        "narration": p.narration,
        "acting_notes": p.acting_notes,
        "scene_type": p.scene_type,
        "visible_set_elements": p.visible_set_elements,
        "lighting_direction": p.lighting_direction,
        "image_prompt": p.image_prompt,
        "image_negative_prompt": p.image_negative_prompt,
        "video_prompt": p.video_prompt,
        "video_mode": p.video_mode,
        "recommended_tool": p.recommended_tool,
        "characters": p.characters,
        "props": p.props,
        "selected_image_id": p.selected_image_id,
        "selected_video_id": p.selected_video_id,
        "lip_sync_media_id": p.lip_sync_media_id,
        "is_insert_shot": p.is_insert_shot,
        "insert_type": p.insert_type,
        "source_text": p.source_text,
        "bgm_prompt": p.bgm_prompt,
        "sound_effect": p.sound_effect,
        "transition_to_next": p.transition_to_next,
        "transition_notes": p.transition_notes,
        "status": p.status,
        "created_at": p.created_at,
        "updated_at": p.updated_at,
    }
    if include_voice_lines:
        data["voice_lines"] = [_voice_line_to_dict(vl) for vl in p.voice_lines]
    return data


# ---------------------------------------------------------------------------
# Panel CRUD
# ---------------------------------------------------------------------------


@router.post("/episodes/{episode_id}/panels", status_code=201)
async def create_panel(
    episode_id: int, body: PanelCreate, db: AsyncSession = Depends(get_db)
):
    ep = await db.get(Episode, episode_id)
    if not ep:
        raise HTTPException(404, "Episode not found")
    panel = Panel(episode_id=episode_id, **body.model_dump())
    db.add(panel)
    await db.flush()
    return _panel_to_dict(panel)


@router.get("/episodes/{episode_id}/panels")
async def list_panels(
    episode_id: int,
    limit: int = 200,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Panel)
        .where(Panel.episode_id == episode_id)
        .order_by(Panel.panel_number)
        .limit(limit)
        .offset(offset)
    )
    return [_panel_to_dict(p) for p in result.scalars()]


@router.get("/panels/{panel_id}")
async def get_panel(panel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Panel)
        .options(selectinload(Panel.voice_lines))
        .where(Panel.id == panel_id)
    )
    panel = result.scalar_one_or_none()
    if not panel:
        raise HTTPException(404, "Panel not found")
    return _panel_to_dict(panel, include_voice_lines=True)


@router.put("/panels/{panel_id}")
async def update_panel(
    panel_id: int, body: PanelUpdate, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(panel, key, value)
    await db.flush()
    return _panel_to_dict(panel)


@router.delete("/panels/{panel_id}", status_code=204)
async def delete_panel(panel_id: int, db: AsyncSession = Depends(get_db)):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    await db.delete(panel)


# ---------------------------------------------------------------------------
# Insert-after (fractional numbering)
# ---------------------------------------------------------------------------


@router.post("/panels/{panel_id}/insert-after", status_code=201)
async def insert_panel_after(
    panel_id: int, body: PanelCreate, db: AsyncSession = Depends(get_db)
):
    """Insert a new panel after the given panel using fractional numbering.

    The new panel_number is computed as the midpoint between the current panel
    and the next panel.  If there is no next panel, current + 1.0 is used.
    The ``panel_number`` field in the request body is ignored.
    """
    current = await db.get(Panel, panel_id)
    if not current:
        raise HTTPException(404, "Panel not found")

    # Find the next panel in the same episode
    next_stmt = (
        select(Panel)
        .where(
            Panel.episode_id == current.episode_id,
            Panel.panel_number > current.panel_number,
        )
        .order_by(Panel.panel_number)
        .limit(1)
    )
    next_result = await db.execute(next_stmt)
    next_panel = next_result.scalar_one_or_none()

    if next_panel:
        new_number = (current.panel_number + next_panel.panel_number) / 2.0
    else:
        new_number = math.floor(current.panel_number) + 1.0

    data = body.model_dump()
    data["panel_number"] = new_number
    panel = Panel(episode_id=current.episode_id, **data)
    db.add(panel)
    await db.flush()
    return _panel_to_dict(panel)


# ---------------------------------------------------------------------------
# Voice Line CRUD
# ---------------------------------------------------------------------------


@router.post("/panels/{panel_id}/voice-lines", status_code=201)
async def create_voice_line(
    panel_id: int, body: VoiceLineCreate, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    vl = VoiceLine(panel_id=panel_id, **body.model_dump())
    db.add(vl)
    await db.flush()
    return _voice_line_to_dict(vl)


@router.get("/panels/{panel_id}/voice-lines")
async def list_voice_lines(panel_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(VoiceLine)
        .where(VoiceLine.panel_id == panel_id)
        .order_by(VoiceLine.sort_order)
    )
    return [_voice_line_to_dict(vl) for vl in result.scalars()]


@router.put("/panels/{panel_id}/voice-lines/{vl_id}")
async def update_voice_line(
    panel_id: int,
    vl_id: int,
    body: VoiceLineUpdate,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(VoiceLine).where(
            VoiceLine.id == vl_id,
            VoiceLine.panel_id == panel_id,
        )
    )
    vl = result.scalar_one_or_none()
    if not vl:
        raise HTTPException(404, "Voice line not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(vl, key, value)
    await db.flush()
    return _voice_line_to_dict(vl)


@router.delete("/panels/{panel_id}/voice-lines/{vl_id}", status_code=204)
async def delete_voice_line(
    panel_id: int, vl_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(VoiceLine).where(
            VoiceLine.id == vl_id,
            VoiceLine.panel_id == panel_id,
        )
    )
    vl = result.scalar_one_or_none()
    if not vl:
        raise HTTPException(404, "Voice line not found")
    await db.delete(vl)


# ---------------------------------------------------------------------------
# Generation stubs (actual generation is a no-op; returns queued status)
# ---------------------------------------------------------------------------


@router.post("/panels/{panel_id}/generate-image", status_code=202)
async def generate_image(
    panel_id: int, body: GenerateRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="image",
        purpose="panel_frame",
        prompt=panel.image_prompt,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/regenerate-image", status_code=202)
async def regenerate_image(
    panel_id: int, body: GenerateRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="image",
        purpose="panel_frame",
        prompt=panel.image_prompt,
        parent_id=panel.selected_image_id,
        version=(panel.selected_image_id or 0) + 1,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/generate-lastframe", status_code=202)
async def generate_lastframe(
    panel_id: int, body: GenerateRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="image",
        purpose="panel_lastframe",
        prompt=panel.image_prompt,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/generate-video", status_code=202)
async def generate_video(
    panel_id: int, body: GenerateVideoRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="video",
        purpose="panel_video",
        prompt=panel.video_prompt,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/regenerate-video", status_code=202)
async def regenerate_video(
    panel_id: int, body: GenerateRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="video",
        purpose="panel_video",
        prompt=panel.video_prompt,
        parent_id=panel.selected_video_id,
        version=(panel.selected_video_id or 0) + 1,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/generate-voice", status_code=202)
async def generate_voice(
    panel_id: int, body: GenerateVoiceRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    vl = await db.get(VoiceLine, body.voice_line_id)
    if not vl or vl.panel_id != panel_id:
        raise HTTPException(404, "Voice line not found for this panel")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="audio",
        purpose="voice_clip",
        prompt=vl.dialogue,
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


@router.post("/panels/{panel_id}/generate-lipsync", status_code=202)
async def generate_lipsync(
    panel_id: int, body: GenerateLipsyncRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")
    media = MediaObject(
        project_id=(await db.get(Episode, panel.episode_id)).project_id,
        media_type="video",
        purpose="lipsync",
        status="queued",
    )
    db.add(media)
    await db.flush()
    return {"media_object_id": media.id, "status": "queued"}


# ---------------------------------------------------------------------------
# Candidate management
# ---------------------------------------------------------------------------


@router.get("/panels/{panel_id}/candidates")
async def list_candidates(
    panel_id: int,
    media_type: str = Query(..., description="image or video"),
    db: AsyncSession = Depends(get_db),
):
    """Return all media candidates for a panel, filtered by media_type."""
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")

    ep = await db.get(Episode, panel.episode_id)
    purpose_map = {
        "image": ["panel_frame", "panel_lastframe"],
        "video": ["panel_video", "lipsync"],
    }
    purposes = purpose_map.get(media_type, [media_type])

    result = await db.execute(
        select(MediaObject)
        .where(
            MediaObject.project_id == ep.project_id,
            MediaObject.purpose.in_(purposes),
        )
        .order_by(MediaObject.version.desc())
    )
    return [
        {
            "media_object_id": m.id,
            "url": m.file_url,
            "is_selected": m.is_selected,
            "version": m.version,
            "status": m.status,
            "created_at": m.created_at,
        }
        for m in result.scalars()
    ]


@router.post("/panels/{panel_id}/select-candidate")
async def select_candidate(
    panel_id: int, body: SelectCandidateRequest, db: AsyncSession = Depends(get_db)
):
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")

    media = await db.get(MediaObject, body.media_object_id)
    if not media:
        raise HTTPException(404, "Media object not found")

    if body.media_type == "image":
        panel.selected_image_id = body.media_object_id
    elif body.media_type == "video":
        panel.selected_video_id = body.media_object_id
    else:
        raise HTTPException(400, "media_type must be 'image' or 'video'")

    media.is_selected = True
    await db.flush()
    return {"selected": True}


@router.post("/panels/{panel_id}/undo-regenerate")
async def undo_regenerate(
    panel_id: int, body: UndoRegenerateRequest, db: AsyncSession = Depends(get_db)
):
    """Undo the last regeneration by reverting to the parent media object."""
    panel = await db.get(Panel, panel_id)
    if not panel:
        raise HTTPException(404, "Panel not found")

    if body.media_type == "image":
        current_id = panel.selected_image_id
    elif body.media_type == "video":
        current_id = panel.selected_video_id
    else:
        raise HTTPException(400, "media_type must be 'image' or 'video'")

    if not current_id:
        raise HTTPException(400, "No current media to undo")

    current_media = await db.get(MediaObject, current_id)
    if not current_media or not current_media.parent_id:
        raise HTTPException(400, "No previous version to restore")

    parent_media = await db.get(MediaObject, current_media.parent_id)
    if not parent_media:
        raise HTTPException(400, "Parent media not found")

    # Restore the parent as the selected media
    if body.media_type == "image":
        panel.selected_image_id = parent_media.id
    else:
        panel.selected_video_id = parent_media.id

    current_media.is_selected = False
    parent_media.is_selected = True
    await db.flush()

    return {"restored_media_object_id": parent_media.id}
