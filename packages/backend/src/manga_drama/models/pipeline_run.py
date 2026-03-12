import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from manga_drama.models.base import Base, TimestampMixin


class PipelineRun(TimestampMixin, Base):
    __tablename__ = "pipeline_runs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    episode_id = Column(Integer, ForeignKey("episodes.id"), nullable=True)
    workflow_type = Column(String(50), nullable=False)  # full_episode/regenerate_image/...
    target_type = Column(String(20), default="episode")
    target_id = Column(Integer, nullable=True)
    status = Column(String(20), default="pending")
    input_data = Column("input", JSON, default=dict)
    output_data = Column("output", JSON, default=dict)
    total_cost = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    steps = relationship("PipelineStep", back_populates="run", cascade="all, delete-orphan")
    events = relationship("RunEvent", back_populates="run", cascade="all, delete-orphan")
