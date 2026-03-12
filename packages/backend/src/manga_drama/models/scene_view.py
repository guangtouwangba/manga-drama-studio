from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class SceneView(TimestampMixin, Base):
    __tablename__ = "scene_views"

    id = Column(Integer, primary_key=True)
    scene_id = Column(Integer, ForeignKey("scenes.id"), nullable=False)
    direction = Column(String(5), nullable=False)  # N / S / E / W
    description = Column(Text, default="")
    selected_image_id = Column(Integer, nullable=True)

    scene = relationship("Scene", back_populates="views")
