from sqlalchemy import Column, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Character(TimestampMixin, Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100), default="")
    gender = Column(String(10), default="")
    age_group = Column(String(20), default="")
    role_level = Column(String(5), default="C")  # S/A/B/C/D
    archetype = Column(String(50), default="")
    personality = Column(Text, default="")
    base_appearance = Column(Text, default="")
    costume_tier = Column(Integer, default=3)  # 1-5
    visual_keywords = Column(JSON, default=list)
    image_prompt = Column(Text, default="")
    reference_image = Column(String(500), default="")
    lora_model_path = Column(String(500), default="")
    face_embedding_path = Column(String(500), default="")
    voice_preset_id = Column(String(100), default="")
    seed_value = Column(Integer, nullable=True)

    project = relationship("Project", back_populates="characters")
    appearances = relationship(
        "CharacterAppearance", back_populates="character", cascade="all, delete-orphan"
    )
