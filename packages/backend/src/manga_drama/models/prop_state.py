from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class PropState(TimestampMixin, Base):
    __tablename__ = "prop_states"

    id = Column(Integer, primary_key=True)
    prop_id = Column(Integer, ForeignKey("props.id"), nullable=False)
    label = Column(String(50), nullable=False)  # "卷起", "展开", "激活"
    description = Column(Text, default="")
    selected_image_id = Column(Integer, nullable=True)
    sort_order = Column(Integer, default=0)

    prop = relationship("Prop", back_populates="states")
