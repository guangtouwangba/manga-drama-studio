import { create } from 'zustand';
import type { PipelineRun, PipelineStep, RunEvent } from '../api/types';
import { getRun, startRun, streamRunEvents, submitGateDecision } from '../api/runs';

interface PipelineStore {
  currentRun: PipelineRun | null;
  steps: PipelineStep[];
  events: RunEvent[];
  gatesPending: string[];
  loading: boolean;
  error: string | null;
  _sseCleanup: (() => void) | null;

  fetchRun: (runId: string) => Promise<void>;
  startPipeline: (projectId: number) => Promise<void>;
  connectSSE: (runId: string) => void;
  disconnectSSE: () => void;
  approveGate: (gateStepId: string, feedback?: string) => Promise<void>;
  rejectGate: (gateStepId: string, feedback?: string) => Promise<void>;
  reset: () => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  currentRun: null,
  steps: [],
  events: [],
  gatesPending: [],
  loading: false,
  error: null,
  _sseCleanup: null,

  fetchRun: async (runId: string) => {
    set({ loading: true, error: null });
    try {
      const res = await getRun(runId);
      const { steps, ...run } = res.data;
      set({ currentRun: run, steps, loading: false });
    } catch {
      set({ error: '加载流水线失败', loading: false });
    }
  },

  startPipeline: async (projectId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await startRun(projectId);
      const runId = res.data.run_id;
      // Fetch the full run with steps
      const runRes = await getRun(runId);
      const { steps, ...run } = runRes.data;
      set({ currentRun: run, steps, events: [], gatesPending: [], loading: false });
      get().connectSSE(runId);
    } catch {
      set({ error: '启动流水线失败', loading: false });
    }
  },

  connectSSE: (runId: string) => {
    // Clean up any existing SSE connection first
    get().disconnectSSE();

    const cleanup = streamRunEvents(runId, (event: RunEvent) => {
      set((state) => {
        const newEvents = [...state.events, event];

        if (event.event_type === 'step_started' || event.event_type === 'step_completed') {
          const stepData = event.payload as Partial<PipelineStep>;
          const existingIdx = state.steps.findIndex((s) => s.id === stepData.id);
          const newSteps =
            existingIdx >= 0
              ? state.steps.map((s, i) => (i === existingIdx ? { ...s, ...stepData } : s))
              : [...state.steps, stepData as PipelineStep];

          // Update current_step on the run when a step starts
          const runPatch =
            event.event_type === 'step_started' && stepData.step_key
              ? { currentRun: state.currentRun ? { ...state.currentRun, current_step: stepData.step_key } : state.currentRun }
              : {};

          return { events: newEvents, steps: newSteps, ...runPatch };
        }

        if (event.event_type === 'gate_waiting') {
          const gate = (event.payload.gate as string) ?? '';
          if (gate && !state.gatesPending.includes(gate)) {
            return { events: newEvents, gatesPending: [...state.gatesPending, gate] };
          }
        }

        if (event.event_type === 'run_completed' || event.event_type === 'run_failed') {
          const status = event.event_type === 'run_completed' ? 'completed' : 'failed';
          return {
            events: newEvents,
            currentRun: state.currentRun ? { ...state.currentRun, status } : state.currentRun,
          };
        }

        return { events: newEvents };
      });
    });

    set({ _sseCleanup: cleanup });
  },

  disconnectSSE: () => {
    const { _sseCleanup } = get();
    if (_sseCleanup) {
      _sseCleanup();
      set({ _sseCleanup: null });
    }
  },

  approveGate: async (gateStepId: string, feedback?: string) => {
    await submitGateDecision(gateStepId, { decision: 'approve', feedback });
    const step = get().steps.find((s) => s.id === gateStepId);
    if (step) {
      set((state) => ({ gatesPending: state.gatesPending.filter((g) => g !== step.step_key) }));
    }
  },

  rejectGate: async (gateStepId: string, feedback?: string) => {
    await submitGateDecision(gateStepId, { decision: 'reject', feedback });
    const step = get().steps.find((s) => s.id === gateStepId);
    if (step) {
      set((state) => ({ gatesPending: state.gatesPending.filter((g) => g !== step.step_key) }));
    }
  },

  reset: () => {
    get().disconnectSSE();
    set({
      currentRun: null,
      steps: [],
      events: [],
      gatesPending: [],
      loading: false,
      error: null,
      _sseCleanup: null,
    });
  },
}));
