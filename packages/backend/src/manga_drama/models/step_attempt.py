import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base


class StepAttempt(Base):
    __tablename__ = "step_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    step_id = Column(String(36), ForeignKey("pipeline_steps.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    status = Column(String(20), default="pending")
    provider = Column(String(50), default="")
    model = Column(String(100), default="")
    output_data = Column("output", JSON, default=dict)
    error_message = Column(Text, default="")
    duration_ms = Column(Integer, default=0)
    cost = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    step = relationship("PipelineStep", back_populates="attempts")
