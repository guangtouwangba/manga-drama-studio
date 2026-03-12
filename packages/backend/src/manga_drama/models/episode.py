from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Episode(TimestampMixin, Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(200), default="")
    script_content = Column(Text, default="")
    status = Column(String(20), default="draft")

    project = relationship("Project", back_populates="episodes")
    panels = relationship("Panel", back_populates="episode", cascade="all, delete-orphan")
