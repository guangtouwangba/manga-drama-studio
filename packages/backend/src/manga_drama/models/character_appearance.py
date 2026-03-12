from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class CharacterAppearance(TimestampMixin, Base):
    __tablename__ = "character_appearances"

    id = Column(Integer, primary_key=True)
    character_id = Column(Integer, ForeignKey("characters.id"), nullable=False)
    label = Column(String(50), nullable=False)  # "日常", "战斗装", "觉醒"
    description = Column(Text, default="")
    prompt_modifier = Column(Text, default="")
    selected_image_id = Column(Integer, nullable=True)
    sort_order = Column(Integer, default=0)

    character = relationship("Character", back_populates="appearances")
