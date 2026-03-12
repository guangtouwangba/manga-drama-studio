from sqlalchemy import Column, Float, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    genre = Column(String(50), default="")
    visual_style = Column(String(50), default="")
    status = Column(String(20), default="init")
    creative_brief = Column(JSON, default=dict)

    # Per-step model selection
    analysis_model = Column(String(100), default="")
    image_model = Column(String(100), default="")
    video_model = Column(String(100), default="")
    character_model = Column(String(100), default="")
    storyboard_model = Column(String(100), default="")
    voice_model = Column(String(100), default="")

    # Output config
    output_width = Column(Integer, default=1080)
    output_height = Column(Integer, default=1920)
    default_panel_count = Column(Integer, default=20)
    global_style = Column(Text, default="")
    global_prefix = Column(Text, default="")

    budget_limit = Column(Float, default=100.0)

    # Relationships
    episodes = relationship("Episode", back_populates="project", cascade="all, delete-orphan")
    characters = relationship("Character", back_populates="project", cascade="all, delete-orphan")
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    props = relationship("Prop", back_populates="project", cascade="all, delete-orphan")
