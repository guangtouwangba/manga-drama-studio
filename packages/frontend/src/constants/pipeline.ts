export interface PipelinePhase {
  id: string;
  label: string;
  stages: string[];
}

export interface PipelineStageInfo {
  label: string;
  agent?: string;
  gate?: boolean;
  icon: string;
}

export const PIPELINE_PHASES: PipelinePhase[] = [
  { id: 'pre_production', label: '前期策划', stages: ['story_analysis', 'world_building', 'character_design', 'scene_design'] },
  { id: 'creative_development', label: '创意开发', stages: ['script_writing', 'storyboard_layout', 'gate_creative'] },
  { id: 'asset_production', label: '资产制作', stages: ['character_illustration', 'scene_illustration', 'gate_storyboard'] },
  { id: 'production', label: '生产制作', stages: ['panel_composition', 'video_generation', 'voice_generation', 'bgm_generation', 'gate_production'] },
  { id: 'post_production', label: '后期制作', stages: ['final_compositing', 'gate_final'] },
];

export const PIPELINE_STAGES: Record<string, PipelineStageInfo> = {
  story_analysis: { label: '故事分析', agent: 'writer', icon: 'BookOpen' },
  world_building: { label: '世界观构建', agent: 'writer', icon: 'Globe' },
  character_design: { label: '角色设计', agent: 'director', icon: 'Users' },
  scene_design: { label: '场景设计', agent: 'director', icon: 'Map' },
  script_writing: { label: '剧本编写', agent: 'writer', icon: 'FileText' },
  storyboard_layout: { label: '分镜布局', agent: 'director', icon: 'Layout' },
  gate_creative: { label: '创意审核', gate: true, icon: 'ShieldCheck' },
  character_illustration: { label: '角色绘制', agent: 'artist', icon: 'Paintbrush' },
  scene_illustration: { label: '场景绘制', agent: 'artist', icon: 'Image' },
  gate_storyboard: { label: '分镜审核', gate: true, icon: 'ShieldCheck' },
  panel_composition: { label: '面板合成', agent: 'artist', icon: 'Layers' },
  video_generation: { label: '视频生成', agent: 'video', icon: 'Film' },
  voice_generation: { label: '语音生成', agent: 'audio', icon: 'Mic' },
  bgm_generation: { label: '背景音乐', agent: 'audio', icon: 'Music' },
  gate_production: { label: '生产审核', gate: true, icon: 'ShieldCheck' },
  final_compositing: { label: '最终合成', agent: 'qa', icon: 'Package' },
  gate_final: { label: '终审', gate: true, icon: 'ShieldCheck' },
};

export const AGENT_TYPES: Record<string, { label: string; color: string }> = {
  writer: { label: '编剧Agent', color: '#0D9488' },
  director: { label: '导演Agent', color: '#6366F1' },
  artist: { label: '画师Agent', color: '#EC4899' },
  video: { label: '视频Agent', color: '#F59E0B' },
  audio: { label: '音频Agent', color: '#8B5CF6' },
  qa: { label: '质检Agent', color: '#10B981' },
};

export const TOTAL_STAGES = Object.keys(PIPELINE_STAGES).length;
export const GATE_STAGES = Object.entries(PIPELINE_STAGES).filter(([, s]) => s.gate).map(([key]) => key);
