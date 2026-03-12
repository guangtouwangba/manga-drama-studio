export interface Project {
  id: number;
  title: string;
  description: string;
  genre: string;
  visual_style: string;
  status: string;
  global_style: string;
}

export interface Character {
  id: number;
  name: string;
  name_en: string;
  role_level: string;
  gender: string;
  base_appearance: string;
}

export interface Scene {
  id: number;
  name: string;
  view_grade: string;
}

export interface Episode {
  id: number;
  episode_number: number;
  title: string;
  status: string;
}

export interface Panel {
  id: number;
  panel_number: number;
  title: string;
  shot_type: string;
  duration: number;
  status: string;
}

export interface PipelineRun {
  id: string;
  status: string;
  workflow_type: string;
  total_cost: number;
}

export interface RunEvent {
  seq: number;
  event_type: string;
  payload: Record<string, unknown>;
}
