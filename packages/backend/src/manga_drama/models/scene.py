from sqlalchemy import Column, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Scene(TimestampMixin, Base):
    __tablename__ = "scenes"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(200), nullable=False)
    name_en = Column(String(200), default="")
    description = Column(Text, default="")
    description_en = Column(Text, default="")
    floor_plan_ascii = Column(Text, default="")
    lighting_preset = Column(JSON, default=dict)
    color_palette = Column(JSON, default=list)
    spatial_structure = Column(JSON, default=dict)
    view_grade = Column(String(10), default="1-view")  # 4-view / 2-view / 1-view

    project = relationship("Project", back_populates="scenes")
    views = relationship("SceneView", back_populates="scene", cascade="all, delete-orphan")
