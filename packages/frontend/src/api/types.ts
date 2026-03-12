export interface Project {
  id: number;
  title: string;
  description: string;
  genre: string;
  visual_style: string;
  status: string;
  global_style: string;
  cover_image_url?: string;
  progress?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Character {
  id: number;
  project_id: number;
  name: string;
  name_en: string;
  role_level: string;
  gender: string;
  age?: number;
  height?: string;
  base_appearance: string;
  bio?: string;
  profile_image_url?: string;
  thumbnail_url?: string;
  appearances?: number;
  updated_at?: string;
}

export interface AppearanceState {
  id: number;
  character_id: number;
  name: string;
  description: string;
  reference_images?: { url: string; label: string }[];
  prompt_settings?: {
    anchor_prompt: string;
    lora_weight: number;
    negative_prompt_preset: string;
  };
}

export interface Scene {
  id: number;
  project_id: number;
  name: string;
  view_grade: string;
  description?: string;
  thumbnail_url?: string;
}

export interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  status: string;
  panel_count?: number;
  synopsis?: string;
  script_content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Panel {
  id: number;
  episode_id: number;
  panel_number: number;
  title: string;
  shot_type: string;
  camera_angle?: string;
  camera_movement?: string;
  duration: number;
  status: string;
  image_url?: string;
  video_url?: string;
  current_version?: number;
  action_description?: string;
  dialogue?: string;
  mood?: string;
  emotion?: string;
  narration?: string;
  image_prompt?: string;
  video_prompt?: string;
  associations?: PanelAssociation[];
}

export interface PanelAssociation {
  type: 'character' | 'prop' | 'location';
  name: string;
  id: number;
}

export interface PanelVersion {
  id: number;
  panel_id: number;
  version_number: number;
  label: string;
  image_url: string;
  prompt: string;
  model_used: string;
  inference_time: number;
  created_at: string;
  is_latest: boolean;
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

export interface ActivityEvent {
  id: string;
  type: 'pipeline' | 'approval' | 'upload' | 'warning';
  title: string;
  description: string;
  timestamp: string;
}

export interface ProjectSettings {
  title: string;
  genre: string;
  description: string;
  resolution: string;
  default_panel_count: number;
  style_prefix: string;
  writer_model: string;
  artist_model: string;
  video_model: string;
  consistency_model: string;
  budget_limit: number;
  budget_used: number;
}
