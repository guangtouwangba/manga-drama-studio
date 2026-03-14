import client from './client';
import { connectSSE } from './sse';
import type { PipelineRun, PipelineStep, RunEvent, GateDecision } from './types';

// POST /runs — start a pipeline run
export function startRun(projectId: number, params?: { workflow_type?: string; episode_id?: number }) {
  return client.post<{ run_id: string; status: string }>('/runs', {
    project_id: projectId,
    workflow_type: params?.workflow_type ?? 'full_episode',
    ...params,
  });
}

// GET /runs/{runId} — get run with steps
export function getRun(runId: string) {
  return client.get<PipelineRun & { steps: PipelineStep[] }>(`/runs/${runId}`);
}

// GET /projects/{projectId}/runs — list runs for a project
export function listProjectRuns(projectId: number) {
  return client.get<PipelineRun[]>(`/projects/${projectId}/runs`);
}

// POST /runs/{runId}/cancel — cancel a run
export function cancelRun(runId: string) {
  return client.post<{ cancelled: boolean }>(`/runs/${runId}/cancel`);
}

// GET /runs/{runId}/stream — SSE event stream
// Connects to the SSE stream and calls onEvent for each event.
// Returns a cleanup function to close the connection.
export function streamRunEvents(runId: string, onEvent: (event: RunEvent) => void): () => void {
  const source = connectSSE(runId, ({ type, data }) => {
    if (type === 'error' || !data) return;
    onEvent(data as RunEvent);
  });

  return () => source.close();
}

// POST /gates/{gateStepId}/decision — approve or reject a gate
export function submitGateDecision(gateStepId: string, decision: GateDecision) {
  return client.post<{ accepted: boolean; run_id: string }>(`/gates/${gateStepId}/decision`, decision);
}
