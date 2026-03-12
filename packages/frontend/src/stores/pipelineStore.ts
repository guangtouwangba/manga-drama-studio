import { create } from 'zustand';

interface PipelineStore {
  runId: string | null;
  status: string;
  currentStage: string;
  progress: number;
  events: Array<{ seq: number; type: string; data: unknown }>;
  setRunId: (id: string | null) => void;
  setStatus: (status: string) => void;
  setCurrentStage: (stage: string) => void;
  setProgress: (progress: number) => void;
  addEvent: (event: { seq: number; type: string; data: unknown }) => void;
  reset: () => void;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  runId: null,
  status: 'idle',
  currentStage: '',
  progress: 0,
  events: [],
  setRunId: (id) => set({ runId: id }),
  setStatus: (status) => set({ status }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setProgress: (progress) => set({ progress }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  reset: () => set({ runId: null, status: 'idle', currentStage: '', progress: 0, events: [] }),
}));
