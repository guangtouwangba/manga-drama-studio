from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class VoiceLine(TimestampMixin, Base):
    __tablename__ = "voice_lines"

    id = Column(Integer, primary_key=True)
    panel_id = Column(Integer, ForeignKey("panels.id"), nullable=False)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=True)
    speaker_name = Column(String(100), default="")
    dialogue = Column(Text, nullable=False)
    emotion = Column(String(30), default="neutral")
    emotion_strength = Column(Float, default=0.2)  # 0.1 - 0.5
    voice_preset_id = Column(String(100), default="")
    selected_media_id = Column(Integer, nullable=True)
    sort_order = Column(Integer, default=0)

    panel = relationship("Panel", back_populates="voice_lines")
