import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class PipelineStep(TimestampMixin, Base):
    __tablename__ = "pipeline_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String(36), ForeignKey("pipeline_runs.id"), nullable=False)
    step_key = Column(String(50), nullable=False)
    agent_type = Column(String(20), default="")
    status = Column(String(20), default="pending")
    input_data = Column("input", JSON, default=dict)
    output_data = Column("output", JSON, default=dict)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    run = relationship("PipelineRun", back_populates="steps")
    attempts = relationship("StepAttempt", back_populates="step", cascade="all, delete-orphan")
