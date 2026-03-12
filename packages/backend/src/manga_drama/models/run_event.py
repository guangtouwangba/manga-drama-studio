import uuid

from sqlalchemy import Column, ForeignKey, Index, Integer, JSON, String
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class RunEvent(TimestampMixin, Base):
    __tablename__ = "run_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("pipeline_runs.id"), nullable=False)
    seq = Column(Integer, nullable=False)
    event_type = Column(String(30), nullable=False)
    payload = Column(JSON, default=dict)

    run = relationship("PipelineRun", back_populates="events")

    __table_args__ = (
        Index("ix_run_events_run_seq", "run_id", "seq"),
    )
