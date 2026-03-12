from sqlalchemy import Column, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class Prop(TimestampMixin, Base):
    __tablename__ = "props"

    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100), default="")
    category = Column(String(30), default="other")  # weapon/document/artifact/container/token/tool
    prop_level = Column(String(5), default="C")  # S/A/B/C
    description = Column(Text, default="")
    size_reference = Column(String(200), default="")
    owner_character_id = Column(Integer, ForeignKey("characters.id"), nullable=True)
    visual_keywords = Column(JSON, default=list)

    project = relationship("Project", back_populates="props")
    states = relationship("PropState", back_populates="prop", cascade="all, delete-orphan")
