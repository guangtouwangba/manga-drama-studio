from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Panel(TimestampMixin, Base):
    __tablename__ = "panels"

    id = Column(Integer, primary_key=True)
    episode_id = Column(Integer, ForeignKey("episodes.id"), nullable=False)
    panel_number = Column(Float, nullable=False)  # Float for insert shots (P5.5)
    title = Column(String(50), default="")

    # Scene reference
    scene_id = Column(Integer, ForeignKey("scenes.id"), nullable=True)
    scene_view_direction = Column(String(5), nullable=True)  # N/S/E/W

    # Shot design
    shot_type = Column(String(10), default="MS")  # ELS/LS/MS/CU/ECU
    camera_angle = Column(String(20), default="Eye")
    camera_movement = Column(String(20), default="Fix")
    camera_position_desc = Column(Text, default="")
    duration = Column(Float, default=3.0)

    # Content
    action = Column(Text, default="")
    atmosphere = Column(Text, default="")
    emotion = Column(String(30), default="")
    emotion_intensity = Column(String(10), default="→")
    dialogue = Column(Text, default="")
    narration = Column(Text, default="")

    # Acting
    acting_notes = Column(Text, default="")
    scene_type = Column(String(20), default="daily")  # daily/emotion/action/epic/suspense

    # Virtual set
    visible_set_elements = Column(JSON, default=list)
    lighting_direction = Column(String(100), default="")

    # Prompts
    image_prompt = Column(Text, default="")
    image_negative_prompt = Column(Text, default="")
    video_prompt = Column(Text, default="")  # English translated
    video_mode = Column(String(20), default="single_frame")  # single_frame/first_last/text_only
    recommended_tool = Column(String(30), default="")

    # Character & prop references
    characters = Column(JSON, default=list)  # [{character_id, appearance_id}]
    props = Column(JSON, default=list)  # [{prop_id, state_id}]

    # Media references
    selected_image_id = Column(Integer, nullable=True)
    selected_video_id = Column(Integer, nullable=True)
    lip_sync_media_id = Column(Integer, nullable=True)

    # Insert shot
    is_insert_shot = Column(Boolean, default=False)
    insert_type = Column(String(20), nullable=True)  # action/reaction/impact

    # Source & transition
    source_text = Column(Text, default="")
    bgm_prompt = Column(Text, default="")
    sound_effect = Column(Text, default="")
    transition_to_next = Column(String(20), default="cut")
    transition_notes = Column(Text, default="")

    status = Column(String(20), default="pending")

    # Relationships
    episode = relationship("Episode", back_populates="panels")
    voice_lines = relationship("VoiceLine", back_populates="panel", cascade="all, delete-orphan")
