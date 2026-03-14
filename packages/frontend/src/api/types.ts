export interface Project {
  id: number;
  title: string;
  description: string;
  genre: string;
  visual_style: string;
  status: string;
  creative_brief?: Record<string, unknown>;
  global_style?: string;
  global_prefix?: string;
  output_width?: number;
  output_height?: number;
  default_panel_count?: number;
  budget_limit?: number;
  analysis_model?: string;
  image_model?: string;
  video_model?: string;
  character_model?: string;
  storyboard_model?: string;
  voice_model?: string;
  created_at?: string;
  updated_at?: string;
  // List view fields
  episode_count?: number;
  panel_count?: number;
  // Detail view fields
  episodes?: Episode[];
  character_count?: number;
  scene_count?: number;
  prop_count?: number;
  // Frontend-only derived fields
  cover_image_url?: string;
  progress?: number;
  latest_run_status?: string;
  current_phase?: string;
  current_stage?: string;
  budget_used?: number;
}

export interface Character {
  id: number;
  project_id: number;
  name: string;
  name_en?: string;
  gender?: string;
  age_group?: string;
  role_level: string;
  archetype?: string;
  personality?: string;
  base_appearance?: string;
  costume_tier?: number;
  visual_keywords?: string[];
  image_prompt?: string;
  reference_image?: string;
  lora_model_path?: string;
  face_embedding_path?: string;
  voice_preset_id?: string;
  seed_value?: number | null;
  appearances?: CharacterAppearance[];
  created_at?: string;
  updated_at?: string;
}

export interface CharacterAppearance {
  id: number;
  character_id: number;
  label: string;
  description?: string;
  prompt_modifier?: string;
  selected_image_id?: number | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Scene {
  id: number;
  project_id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  floor_plan_ascii?: string;
  lighting_preset?: Record<string, unknown>;
  color_palette?: string[];
  spatial_structure?: Record<string, unknown>;
  view_grade: string;
  views?: SceneView[];
  created_at?: string;
  updated_at?: string;
}

export interface SceneView {
  id: number;
  scene_id: number;
  direction: string;
  description?: string;
  selected_image_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Episode {
  id: number;
  project_id: number;
  episode_number: number;
  title: string;
  script_content?: string;
  status: string;
  word_count?: number;
  estimated_duration_s?: number;
  panel_count?: number;
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

export interface PipelineRun {
  id: string; // UUID
  project_id: number;
  workflow_type: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  current_step?: string | null; // derived on frontend from steps
  episode_id?: number | null;
  target_type?: string;
  target_id?: number | null;
  input?: Record<string, unknown> | null;
  output?: Record<string, unknown> | null;
  total_cost: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface PipelineStep {
  id: string; // UUID
  run_id: string; // UUID
  step_key: string;
  agent_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting_for_gate';
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  retry_count?: number;
  attempts?: StepAttempt[];
  started_at: string | null;
  completed_at: string | null;
}

export interface StepAttempt {
  id: string;
  step_id: string;
  attempt_number: number;
  status: string;
  provider: string;
  model: string;
  output: Record<string, unknown> | null;
  error_message: string | null;
  duration_ms: number;
  cost: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface RunEvent {
  id: string; // UUID
  run_id: string; // UUID
  seq: number;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface GateDecision {
  decision: 'approve' | 'reject';
  feedback?: string;
  regeneration_targets?: string[];
}

export interface ProviderConfig {
  name: string;
  provider_type: string;
  base_url?: string;
  default_model?: string;
  is_enabled: boolean;
  has_api_key?: boolean;
}
