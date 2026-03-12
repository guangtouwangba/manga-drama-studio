from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, JSON, String, Text

from manga_drama.models.base import Base, TimestampMixin


class MediaObject(TimestampMixin, Base):
    __tablename__ = "media_objects"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    media_type = Column(String(10), nullable=False)  # image/video/audio
    purpose = Column(String(30), default="")
    # character_ref/scene_view/prop_state/panel_frame/panel_lastframe/panel_video/voice_clip/lipsync/final_video
    provider = Column(String(50), default="")
    model = Column(String(100), default="")
    prompt = Column(Text, default="")
    file_path = Column(String(500), default="")
    file_url = Column(String(500), default="")
    seed = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    cost = Column(Float, default=0.0)
    metadata_json = Column("metadata", JSON, default=dict)
    status = Column(String(20), default="pending")  # pending/processing/completed/failed
    task_id_external = Column(String(200), default="")

    # Version tracking
    parent_id = Column(Integer, ForeignKey("media_objects.id"), nullable=True)
    version = Column(Integer, default=1)
    is_selected = Column(Boolean, default=False)
