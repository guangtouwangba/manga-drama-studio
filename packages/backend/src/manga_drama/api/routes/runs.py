import asyncio
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from manga_drama.database import get_db
from manga_drama.models import PipelineRun, PipelineStep, RunEvent, StepAttempt

router = APIRouter(tags=["runs"])


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------


class RunCreate(BaseModel):
    project_id: int
    episode_id: Optional[int] = None
    workflow_type: str  # full_episode / regenerate_image / ...
    target_type: str = "episode"
    target_id: Optional[int] = None
    input_data: dict = {}


class GateDecision(BaseModel):
    decision: str  # "approve" or "reject"
    feedback: Optional[str] = None
    regeneration_targets: Optional[list] = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _attempt_to_dict(a: StepAttempt) -> dict:
    return {
        "id": a.id,
        "attempt_number": a.attempt_number,
        "status": a.status,
        "provider": a.provider,
        "model": a.model,
        "output": a.output_data,
        "error_message": a.error_message,
        "duration_ms": a.duration_ms,
        "cost": a.cost,
        "started_at": a.started_at,
        "completed_at": a.completed_at,
    }


def _step_to_dict(s: PipelineStep, include_attempts: bool = False) -> dict:
    data = {
        "id": s.id,
        "step_key": s.step_key,
        "agent_type": s.agent_type,
        "status": s.status,
        "retry_count": s.retry_count,
        "started_at": s.started_at,
        "completed_at": s.completed_at,
    }
    if include_attempts:
        data["attempts"] = [_attempt_to_dict(a) for a in s.attempts]
    return data


def _run_to_dict(r: PipelineRun, include_steps: bool = False) -> dict:
    data = {
        "id": r.id,
        "project_id": r.project_id,
        "episode_id": r.episode_id,
        "workflow_type": r.workflow_type,
        "target_type": r.target_type,
        "target_id": r.target_id,
        "status": r.status,
        "total_cost": r.total_cost,
        "started_at": r.started_at,
        "completed_at": r.completed_at,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
    }
    if include_steps:
        data["steps"] = [_step_to_dict(s, include_attempts=True) for s in r.steps]
    return data


# ---------------------------------------------------------------------------
# Run CRUD
# ---------------------------------------------------------------------------


@router.post("/runs", status_code=201)
async def create_run(body: RunCreate, db: AsyncSession = Depends(get_db)):
    run = PipelineRun(
        project_id=body.project_id,
        episode_id=body.episode_id,
        workflow_type=body.workflow_type,
        target_type=body.target_type,
        target_id=body.target_id,
        input_data=body.input_data,
        status="pending",
    )
    db.add(run)
    await db.flush()
    return {"run_id": run.id, "status": "pending"}


@router.get("/runs/{run_id}")
async def get_run(run_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineRun)
        .options(
            selectinload(PipelineRun.steps).selectinload(PipelineStep.attempts)
        )
        .where(PipelineRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(404, "Run not found")
    return _run_to_dict(run, include_steps=True)


@router.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PipelineRun).where(PipelineRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(404, "Run not found")
    if run.status in ("completed", "cancelled"):
        raise HTTPException(400, f"Cannot cancel run with status '{run.status}'")
    run.status = "cancelled"
    await db.flush()
    return {"cancelled": True}


@router.get("/projects/{project_id}/runs")
async def list_project_runs(
    project_id: int, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PipelineRun)
        .where(PipelineRun.project_id == project_id)
        .order_by(PipelineRun.created_at.desc())
    )
    return [_run_to_dict(r) for r in result.scalars()]


# ---------------------------------------------------------------------------
# Events (polling fallback)
# ---------------------------------------------------------------------------


@router.get("/runs/{run_id}/events")
async def list_run_events(
    run_id: str,
    after_seq: int = Query(0, alias="afterSeq"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RunEvent)
        .where(RunEvent.run_id == run_id, RunEvent.seq > after_seq)
        .order_by(RunEvent.seq)
    )
    return [
        {
            "seq": e.seq,
            "event_type": e.event_type,
            "payload": e.payload,
            "created_at": e.created_at,
        }
        for e in result.scalars()
    ]


# ---------------------------------------------------------------------------
# SSE stream (placeholder)
# ---------------------------------------------------------------------------


@router.get("/runs/{run_id}/stream")
async def stream_run_events(
    run_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Server-Sent Events stream for real-time pipeline updates.

    This is a placeholder implementation that sends existing events and then
    polls for new ones. A production implementation would use a pub/sub
    mechanism (Redis, PostgreSQL LISTEN/NOTIFY, etc.).
    """
    # Verify run exists
    result = await db.execute(
        select(PipelineRun).where(PipelineRun.id == run_id)
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(404, "Run not found")

    async def event_generator():
        last_seq = 0
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break

            # Fetch new events since last_seq
            from manga_drama.database import get_session_factory

            factory = get_session_factory()
            async with factory() as session:
                event_result = await session.execute(
                    select(RunEvent)
                    .where(RunEvent.run_id == run_id, RunEvent.seq > last_seq)
                    .order_by(RunEvent.seq)
                )
                events = event_result.scalars().all()
                for event in events:
                    data = json.dumps(
                        {
                            "seq": event.seq,
                            "event_type": event.event_type,
                            "payload": event.payload,
                        }
                    )
                    yield f"data: {data}\n\n"
                    last_seq = event.seq

                # Check if run is finished
                run_result = await session.execute(
                    select(PipelineRun.status).where(PipelineRun.id == run_id)
                )
                current_status = run_result.scalar_one_or_none()
                if current_status in ("completed", "failed", "cancelled"):
                    yield f"data: {json.dumps({'seq': -1, 'event_type': 'run_ended', 'payload': {'status': current_status}})}\n\n"
                    break

            await asyncio.sleep(1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Gate decisions
# ---------------------------------------------------------------------------


@router.post("/gates/{gate_id}/decision")
async def gate_decision(
    gate_id: str,
    body: GateDecision,
    db: AsyncSession = Depends(get_db),
):
    """Submit a human decision for a pipeline gate step.

    The gate_id corresponds to a PipelineStep id that acts as a gate checkpoint.
    """
    result = await db.execute(
        select(PipelineStep).where(PipelineStep.id == gate_id)
    )
    step = result.scalar_one_or_none()
    if not step:
        raise HTTPException(404, "Gate step not found")
    if step.status not in ("pending", "waiting_for_gate"):
        raise HTTPException(400, f"Gate step is not awaiting a decision (status: {step.status})")

    if body.decision == "approve":
        step.status = "completed"
    elif body.decision == "reject":
        step.status = "rejected"
    else:
        raise HTTPException(400, "Decision must be 'approve' or 'reject'")

    # Store feedback in the step output
    step.output_data = {
        "decision": body.decision,
        "feedback": body.feedback,
        "regeneration_targets": body.regeneration_targets,
    }

    await db.flush()

    # Return run_id so the frontend can continue tracking
    return {"accepted": True, "run_id": step.run_id}
