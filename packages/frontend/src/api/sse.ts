export function connectSSE(runId: string, onEvent: (event: { type: string; data: unknown }) => void) {
  const source = new EventSource(`/api/v1/runs/${runId}/stream`);

  source.onmessage = (e) => {
    const data = JSON.parse(e.data);
    onEvent({ type: 'message', data });
  };

  source.addEventListener('step_started', (e) => {
    onEvent({ type: 'step_started', data: JSON.parse((e as MessageEvent).data) });
  });

  source.addEventListener('step_completed', (e) => {
    onEvent({ type: 'step_completed', data: JSON.parse((e as MessageEvent).data) });
  });

  source.addEventListener('gate_waiting', (e) => {
    onEvent({ type: 'gate_waiting', data: JSON.parse((e as MessageEvent).data) });
  });

  source.addEventListener('error', () => {
    onEvent({ type: 'error', data: null });
  });

  return source;
}
