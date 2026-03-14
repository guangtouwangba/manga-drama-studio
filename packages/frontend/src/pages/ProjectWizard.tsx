/**
 * ProjectWizard.tsx
 *
 * Multi-step project creation wizard for Manga Drama Studio.
 * Route: /projects/new
 *
 * Steps:
 *   0 — 你的故事   (Story Input — Template Gallery + Guided Questions or Free Mode)
 *   1 — 视觉风格   (Visual Style & Model Config)
 *   2 — 确认启动   (Review & Launch)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import StoryInput from '../components/StoryInput';
import { createProject } from '../api/projects';
import { startRun } from '../api/runs';
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENRES = ['仙侠', '都市', '科幻', '悬疑', '校园', '其他'];

const STEPS = ['你的故事', '视觉风格', '确认启动'];

const VISUAL_STYLES = [
  { id: 'anime', label: '日系动漫', icon: '🎨' },
  { id: 'realistic', label: '写实风格', icon: '📷' },
  { id: 'ink_wash', label: '水墨国风', icon: '🖌️' },
];

const RESOLUTIONS = [
  { value: '1080x1920', label: '1080\u00d71920 竖版 (手机短视频)' },
  { value: '1920x1080', label: '1920\u00d71080 横版 (标准视频)' },
  { value: '1080x1080', label: '1080\u00d71080 方形 (社交媒体)' },
];

// Shared input / select class — matches SettingsPage pattern
const inputClass =
  'w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none';

const selectClass = inputClass + ' appearance-none cursor-pointer';

// ---------------------------------------------------------------------------
// Story Templates
// ---------------------------------------------------------------------------

interface StoryTemplate {
  id: string;
  label: string;
  emoji: string;
  description: string;
  genre: string;
  suggestedTitle: string;
  protagonistOptions: string[];
  conflictOptions: string[];
}

const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'tuihun',
    label: '退婚逆袭',
    emoji: '💰',
    description: '废物赘婿被退婚后觉醒翻盘',
    genre: '仙侠',
    suggestedTitle: '万古第一废体',
    protagonistOptions: ['废物少爷', '上门女婿', '落魄公子', '隐世高手'],
    conflictOptions: ['当众退婚', '家族危机', '比武招亲', '势力入侵'],
  },
  {
    id: 'chongsheng',
    label: '重生复仇',
    emoji: '⚔️',
    description: '带着前世记忆重回过去',
    genre: '都市',
    suggestedTitle: '重生之都市修仙',
    protagonistOptions: ['商界精英', '落魄学生', '退役军人', '普通白领'],
    conflictOptions: ['商业阴谋', '家族仇恨', '身份揭秘', '权力斗争'],
  },
  {
    id: 'xiaoyuan',
    label: '校园恋爱',
    emoji: '🏫',
    description: '转学生与校花的青春故事',
    genre: '校园',
    suggestedTitle: '那年夏天的约定',
    protagonistOptions: ['转学生', '学霸少年', '运动健将', '文艺少女'],
    conflictOptions: ['误解与和解', '校际竞赛', '暗恋告白', '毕业离别'],
  },
  {
    id: 'dushi',
    label: '都市修仙',
    emoji: '🌃',
    description: '上班族意外获得修仙传承',
    genre: '都市',
    suggestedTitle: '都市之最强修仙',
    protagonistOptions: ['996程序员', '外卖骑手', '公司实习生', '保安大叔'],
    conflictOptions: ['修仙秘境', '都市妖兽', '暗夜组织', '灵气复苏'],
  },
  {
    id: 'mohuan',
    label: '异世冒险',
    emoji: '🐉',
    description: '穿越到魔法世界的冒险之旅',
    genre: '科幻',
    suggestedTitle: '异界之龙语者',
    protagonistOptions: ['召唤师', '剑术天才', '魔法学徒', '流浪佣兵'],
    conflictOptions: ['魔王降临', '种族战争', '禁忌之塔', '远古预言'],
  },
  {
    id: 'xuanyi',
    label: '悬疑推理',
    emoji: '🔍',
    description: '一桩离奇案件的层层揭秘',
    genre: '悬疑',
    suggestedTitle: '第七封遗书',
    protagonistOptions: ['天才侦探', '实习法医', '退休刑警', '心理师'],
    conflictOptions: ['密室杀人', '连环失踪', '遗产争夺', '身份伪装'],
  },
  {
    id: 'guwu',
    label: '古武觉醒',
    emoji: '🥋',
    description: '现代少年觉醒古武血脉',
    genre: '仙侠',
    suggestedTitle: '武道至尊',
    protagonistOptions: ['普通高中生', '武馆传人', '孤儿少年', '格斗天才'],
    conflictOptions: ['血脉觉醒', '武道大赛', '古武家族', '暗杀组织'],
  },
  {
    id: 'mori',
    label: '末世求生',
    emoji: '☠️',
    description: '灾变后的生存与人性考验',
    genre: '科幻',
    suggestedTitle: '末日余晖',
    protagonistOptions: ['科学家', '退伍军人', '大学生', '医护人员'],
    conflictOptions: ['丧尸围城', '资源争夺', '变异进化', '人性抉择'],
  },
];

const TONE_OPTIONS = [
  '🔥 热血燃系',
  '😂 轻松搞笑',
  '💀 暗黑虐心',
  '💕 甜宠治愈',
  '😈 腹黑爽文',
];

const EPISODE_COUNT_OPTIONS = [
  '5集 (短篇)',
  '10集 (中篇)',
  '20集 (长篇)',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type InputMode = 'template' | 'free';

interface TemplateSelections {
  selectedTemplate: string | null;
  protagonist: string;
  conflict: string;
  tone: string;
  episodeCount: string;
}

interface ModelConfig {
  analysis_model: string;
  image_model: string;
  video_model: string;
  character_model: string;
  storyboard_model: string;
  voice_model: string;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

const defaultModelConfig: ModelConfig = {
  analysis_model: 'google/gemini-2.5-flash',
  image_model: 'flux-pro-1.1',
  video_model: 'kling-3.0',
  character_model: 'flux-lora',
  storyboard_model: 'flux-pro-1.1',
  voice_model: 'fish-speech-1.5',
};

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="向导步骤" className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  done
                    ? 'bg-accent text-white'
                    : active
                    ? 'bg-txt-primary text-white'
                    : 'bg-surface-subtle text-txt-muted border border-bdr'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  active
                    ? 'text-txt-primary font-medium'
                    : done
                    ? 'text-accent'
                    : 'text-txt-muted'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-colors ${
                  done ? 'bg-accent' : 'bg-bdr'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// FormField helper
// ---------------------------------------------------------------------------

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-txt-secondary">{label}</label>
      {children}
      {hint && <p className="text-xs text-txt-muted">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pill selector helper
// ---------------------------------------------------------------------------

function PillSelector({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-txt-secondary">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            aria-pressed={value === opt}
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              value === opt
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-txt-secondary border-bdr hover:border-accent/50 hover:text-txt-primary'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mode toggle (underline tabs)
// ---------------------------------------------------------------------------

function ModeToggle({
  mode,
  onChangeMode,
}: {
  mode: InputMode;
  onChangeMode: (m: InputMode) => void;
}) {
  const tabs: { key: InputMode; label: string }[] = [
    { key: 'template', label: '模板创作' },
    { key: 'free', label: '自由创作' },
  ];

  return (
    <div className="flex gap-6 border-b border-bdr" role="tablist" aria-label="创作模式">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={mode === tab.key}
          onClick={() => onChangeMode(tab.key)}
          className={`relative pb-3 text-sm font-medium transition-colors ${
            mode === tab.key
              ? 'text-accent'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
        >
          {tab.label}
          {mode === tab.key && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  selected,
  onClick,
}: {
  template: StoryTemplate;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col items-start gap-2 px-4 py-4 rounded-xl border-2 text-left transition-all w-full ${
        selected
          ? 'border-accent bg-accent/8 shadow-sm'
          : 'border-bdr bg-white hover:border-accent/40 hover:shadow-sm'
      }`}
    >
      <span className="text-3xl leading-none" aria-hidden="true">
        {template.emoji}
      </span>
      <span
        className={`text-sm font-bold ${
          selected ? 'text-accent' : 'text-txt-primary'
        }`}
      >
        {template.label}
      </span>
      <span className="text-xs text-txt-muted leading-snug">
        {template.description}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — 你的故事 (Redesigned)
// ---------------------------------------------------------------------------

interface Step1Props {
  title: string;
  setTitle: (v: string) => void;
  genre: string;
  setGenre: (v: string) => void;
  story: string;
  setStory: (v: string) => void;
  inputMode: InputMode;
  setInputMode: (m: InputMode) => void;
  templateSelections: TemplateSelections;
  setTemplateSelections: (s: TemplateSelections) => void;
  onNext: () => void;
}

function StoryStep({
  title,
  setTitle,
  genre,
  setGenre,
  story,
  setStory,
  inputMode,
  setInputMode,
  templateSelections,
  setTemplateSelections,
  onNext,
}: Step1Props) {
  const { selectedTemplate, protagonist, conflict, tone, episodeCount } =
    templateSelections;

  const activeTemplate = STORY_TEMPLATES.find(
    (t) => t.id === selectedTemplate,
  );

  // Determine if the user can proceed
  const canProceedTemplate =
    selectedTemplate !== null &&
    protagonist !== '' &&
    conflict !== '' &&
    title.trim().length > 0;

  const canProceedFree =
    title.trim().length > 0 && story.trim().length > 0;

  const canProceed =
    inputMode === 'template' ? canProceedTemplate : canProceedFree;

  function handleSelectTemplate(templateId: string) {
    const tpl = STORY_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    const isSame = selectedTemplate === templateId;

    setTemplateSelections({
      selectedTemplate: isSame ? null : templateId,
      protagonist: isSame ? '' : '',
      conflict: isSame ? '' : '',
      tone: isSame ? '' : templateSelections.tone,
      episodeCount: isSame ? '' : templateSelections.episodeCount,
    });

    if (!isSame) {
      // Auto-set genre from template
      setGenre(tpl.genre);
      // Auto-suggest title
      setTitle(tpl.suggestedTitle);
    }
  }

  function updateSelection(field: keyof TemplateSelections, value: string) {
    setTemplateSelections({
      ...templateSelections,
      [field]: templateSelections[field] === value ? '' : value,
    });
  }

  return (
    <Card variant="form" className="space-y-6">
      <div>
        <h2 className="text-heading text-txt-primary font-semibold">
          你的故事
        </h2>
        <p className="text-sm text-txt-secondary mt-1">
          选择模板快速开始，或自由输入你的原创故事
        </p>
      </div>

      {/* Mode toggle */}
      <ModeToggle mode={inputMode} onChangeMode={setInputMode} />

      {/* ---- Template Mode ---- */}
      {inputMode === 'template' && (
        <div className="space-y-6">
          {/* Template gallery */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-txt-secondary">
              选择故事模板
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STORY_TEMPLATES.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  template={tpl}
                  selected={selectedTemplate === tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                />
              ))}
            </div>
          </div>

          {/* Guided questions — appear after template is selected */}
          {activeTemplate && (
            <div className="space-y-5 pt-2">
              <PillSelector
                label="主角身份？"
                options={activeTemplate.protagonistOptions}
                value={protagonist}
                onChange={(v) => updateSelection('protagonist', v)}
              />

              <PillSelector
                label="核心冲突？"
                options={activeTemplate.conflictOptions}
                value={conflict}
                onChange={(v) => updateSelection('conflict', v)}
              />

              <PillSelector
                label="故事基调？"
                options={TONE_OPTIONS}
                value={tone}
                onChange={(v) => updateSelection('tone', v)}
              />

              <PillSelector
                label="目标集数？"
                options={EPISODE_COUNT_OPTIONS}
                value={episodeCount}
                onChange={(v) => updateSelection('episodeCount', v)}
              />
            </div>
          )}

          {/* Genre pills — auto-set from template but editable */}
          <FormField label="题材类型">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="题材选择"
            >
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={genre === g}
                  onClick={() => setGenre(genre === g ? '' : g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    genre === g
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-txt-secondary border-bdr hover:border-accent/50 hover:text-txt-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </FormField>

          {/* Title input with auto-suggestion */}
          <FormField label="项目标题">
            <input
              type="text"
              className={inputClass}
              value={title}
              placeholder="例如：星河传说"
              aria-label="项目标题"
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-txt-muted mt-1.5">
              AI 将根据你的选择自动生成标题，你也可以自定义
            </p>
          </FormField>
        </div>
      )}

      {/* ---- Free Mode ---- */}
      {inputMode === 'free' && (
        <div className="space-y-6">
          {/* Title */}
          <FormField label="项目标题" hint="给你的漫剧项目起一个名字">
            <input
              type="text"
              className={inputClass}
              value={title}
              placeholder="例如：星河传说"
              aria-label="项目标题"
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>

          {/* Genre pills */}
          <FormField label="题材类型">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="题材选择"
            >
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={genre === g}
                  onClick={() => setGenre(genre === g ? '' : g)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    genre === g
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-txt-secondary border-bdr hover:border-accent/50 hover:text-txt-primary'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </FormField>

          {/* Story input with file upload */}
          <FormField
            label="故事大纲"
            hint="可输入故事梗概、人物设定或完整剧本，也可上传文件"
          >
            <StoryInput value={story} onChange={setStory} maxLength={5000} />
          </FormField>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="md"
          iconRight={<ChevronRight className="w-4 h-4" />}
          onClick={onNext}
          disabled={!canProceed}
          aria-label="下一步：视觉风格"
        >
          下一步
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — 视觉风格
// ---------------------------------------------------------------------------

interface Step2Props {
  visualStyle: string;
  setVisualStyle: (v: string) => void;
  resolution: string;
  setResolution: (v: string) => void;
  modelConfig: ModelConfig;
  setModelConfig: (cfg: ModelConfig) => void;
  onBack: () => void;
  onNext: () => void;
}

const modelFields: { key: keyof ModelConfig; label: string; description: string }[] = [
  { key: 'analysis_model', label: '编剧模型', description: '用于故事分析、剧本编写与情节扩写' },
  { key: 'image_model', label: '画师模型', description: '用于分镜与角色图像生成' },
  { key: 'video_model', label: '视频模型', description: '用于动态面板与短剧视频生成' },
  { key: 'character_model', label: '角色一致性', description: '保持角色外观在多帧间的连贯性' },
  { key: 'storyboard_model', label: '分镜模型', description: '用于分镜排版与面板合成' },
  { key: 'voice_model', label: '语音模型', description: '用于角色语音与旁白合成' },
];

const modelOptions: Record<keyof ModelConfig, ModelOption[]> = {
  analysis_model: [
    { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'Google' },
    { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'Google' },
    { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', provider: 'Google' },
    { value: 'anthropic/claude-sonnet-4.6', label: 'Claude Sonnet 4.6', provider: 'Anthropic' },
    { value: 'anthropic/claude-opus-4.6', label: 'Claude Opus 4.6', provider: 'Anthropic' },
    { value: 'openai/gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
    { value: 'deepseek/deepseek-r1', label: 'DeepSeek R1', provider: 'DeepSeek' },
    { value: 'qwen/qwen3-235b-a22b', label: 'Qwen3 235B', provider: 'Alibaba' },
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', provider: 'Meta' },
    { value: 'mistralai/mistral-large-2512', label: 'Mistral Large 3', provider: 'Mistral' },
  ],
  image_model: [
    { value: 'flux-pro-1.1', label: 'FLUX Pro 1.1', provider: 'Black Forest Labs' },
    { value: 'flux-2', label: 'FLUX.2', provider: 'Black Forest Labs' },
    { value: 'seedream-5.0-lite', label: 'Seedream 5.0 Lite', provider: 'ByteDance' },
    { value: 'ideogram-v3', label: 'Ideogram V3', provider: 'Ideogram' },
    { value: 'stable-diffusion-3.5', label: 'Stable Diffusion 3.5', provider: 'Stability AI' },
    { value: 'imagen-4', label: 'Imagen 4', provider: 'Google' },
    { value: 'kolors', label: 'Kolors', provider: 'Kuaishou' },
    { value: 'gpt-image-1', label: 'GPT Image 1', provider: 'OpenAI' },
    { value: 'recraft-v4', label: 'Recraft V4', provider: 'Recraft' },
  ],
  video_model: [
    { value: 'kling-3.0', label: 'Kling 3.0', provider: 'Kuaishou' },
    { value: 'runway-gen4-turbo', label: 'Gen-4 Turbo', provider: 'Runway' },
    { value: 'hailuo-2.3', label: 'Hailuo 2.3', provider: 'MiniMax' },
    { value: 'vidu-q3', label: 'Vidu Q3', provider: '生数科技' },
    { value: 'seedance-2.0', label: 'Seedance 2.0', provider: 'ByteDance' },
    { value: 'pika-2.5', label: 'Pika 2.5', provider: 'Pika' },
    { value: 'luma-dream-machine', label: 'Dream Machine', provider: 'Luma' },
    { value: 'cogvideox', label: 'CogVideoX', provider: '智谱 AI' },
    { value: 'sora-2-pro', label: 'Sora 2 Pro', provider: 'OpenAI' },
    { value: 'wan-2.6', label: 'Wan 2.6', provider: 'Alibaba' },
    { value: 'veo-3.1', label: 'Veo 3.1', provider: 'Google' },
  ],
  character_model: [
    { value: 'flux-lora', label: 'FLUX LoRA 角色训练', provider: 'fal.ai' },
    { value: 'instantid', label: 'InstantID', provider: 'Replicate' },
    { value: 'kling-character-ref', label: 'Kling 角色参考', provider: 'Kuaishou' },
    { value: 'wan-r2v', label: 'Wan R2V 角色保持', provider: 'Alibaba' },
    { value: 'pulid-v1', label: 'PuLID V1', provider: '自部署' },
  ],
  storyboard_model: [
    { value: 'flux-pro-1.1', label: 'FLUX Pro 1.1', provider: 'Black Forest Labs' },
    { value: 'flux-2', label: 'FLUX.2', provider: 'Black Forest Labs' },
    { value: 'seedream-5.0-lite', label: 'Seedream 5.0 Lite', provider: 'ByteDance' },
    { value: 'stable-diffusion-3.5', label: 'Stable Diffusion 3.5', provider: 'Stability AI' },
    { value: 'imagen-4', label: 'Imagen 4', provider: 'Google' },
    { value: 'ideogram-v3', label: 'Ideogram V3', provider: 'Ideogram' },
  ],
  voice_model: [
    { value: 'fish-speech-1.5', label: 'Fish Speech 1.5', provider: 'Fish Audio' },
    { value: 'cosyvoice-2', label: 'CosyVoice 2', provider: 'Alibaba' },
    { value: 'f5-tts', label: 'F5-TTS', provider: '开源' },
  ],
};

/** Look up display label for a model value */
function getModelLabel(key: keyof ModelConfig, value: string): string {
  const opt = modelOptions[key].find((o) => o.value === value);
  return opt ? opt.label : value;
}

function ModelStep({
  visualStyle,
  setVisualStyle,
  resolution,
  setResolution,
  modelConfig,
  setModelConfig,
  onBack,
  onNext,
}: Step2Props) {
  const [expanded, setExpanded] = useState(false);

  function updateModel(key: keyof ModelConfig, value: string) {
    setModelConfig({ ...modelConfig, [key]: value });
  }

  return (
    <Card variant="form" className="space-y-6">
      <div>
        <h2 className="text-heading text-txt-primary font-semibold">视觉风格</h2>
        <p className="text-sm text-txt-secondary mt-1">
          选择画面风格和输出分辨率，或展开高级设置自定义模型
        </p>
      </div>

      {/* Visual style cards */}
      <FormField label="画面风格">
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="视觉风格选择">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={visualStyle === style.id}
              onClick={() => setVisualStyle(style.id)}
              className={`flex flex-col items-center gap-2 px-4 py-5 rounded-xl border-2 transition-all ${
                visualStyle === style.id
                  ? 'border-accent bg-accent-light/40 shadow-sm'
                  : 'border-bdr bg-white hover:border-accent/40 hover:bg-surface-subtle'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{style.icon}</span>
              <span
                className={`text-sm font-medium ${
                  visualStyle === style.id ? 'text-accent' : 'text-txt-secondary'
                }`}
              >
                {style.label}
              </span>
            </button>
          ))}
        </div>
      </FormField>

      {/* Resolution selector */}
      <FormField label="输出分辨率" hint="选择适合目标平台的画面比例">
        <div className="relative">
          <select
            className={selectClass}
            value={resolution}
            aria-label="输出分辨率"
            onChange={(e) => setResolution(e.target.value)}
          >
            {RESOLUTIONS.map((res) => (
              <option key={res.value} value={res.value}>
                {res.label}
              </option>
            ))}
          </select>
          <ChevronRight
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </FormField>

      {/* Default config notice */}
      <div className="flex items-start gap-3 p-4 bg-accent-light/60 border border-accent/20 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-txt-primary">已使用推荐默认配置</p>
          <p className="text-xs text-txt-secondary mt-0.5">
            系统将使用经过验证的默认模型组合。如需自定义，展开下方高级设置。
          </p>
        </div>
      </div>

      {/* Collapsible advanced settings */}
      <div className="border border-bdr rounded-xl overflow-hidden">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-subtle transition-colors"
        >
          <span className="text-sm font-medium text-txt-primary">高级设置</span>
          <ChevronRight
            className={`w-4 h-4 text-txt-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
            aria-hidden="true"
          />
        </button>

        {expanded && (
          <div className="px-5 pb-5 border-t border-bdr space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modelFields.map(({ key, label, description }) => (
                <FormField key={key} label={label} hint={description}>
                  <div className="relative">
                    <select
                      className={selectClass}
                      value={modelConfig[key]}
                      aria-label={label}
                      onChange={(e) => updateModel(key, e.target.value)}
                    >
                      {modelOptions[key].map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} — {opt.provider}
                        </option>
                      ))}
                    </select>
                    <ChevronRight
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </FormField>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="md"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={onBack}
          aria-label="上一步：你的故事"
        >
          上一步
        </Button>
        <Button
          variant="primary"
          size="md"
          iconRight={<ChevronRight className="w-4 h-4" />}
          onClick={onNext}
          aria-label="下一步：确认启动"
        >
          下一步
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — 确认启动
// ---------------------------------------------------------------------------

interface Step3Props {
  title: string;
  genre: string;
  story: string;
  inputMode: InputMode;
  templateSelections: TemplateSelections;
  visualStyle: string;
  resolution: string;
  modelConfig: ModelConfig;
  autoStart: boolean;
  setAutoStart: (v: boolean) => void;
  loading: boolean;
  onBack: () => void;
  onLaunch: () => void;
}

function ReviewStep({
  title,
  genre,
  story,
  inputMode,
  templateSelections,
  visualStyle,
  resolution,
  modelConfig,
  autoStart,
  setAutoStart,
  loading,
  onBack,
  onLaunch,
}: Step3Props) {
  const styleLabel = VISUAL_STYLES.find((s) => s.id === visualStyle)?.label ?? visualStyle;
  const resolutionLabel = RESOLUTIONS.find((r) => r.value === resolution)?.label ?? resolution;

  const activeTemplate = STORY_TEMPLATES.find(
    (t) => t.id === templateSelections.selectedTemplate,
  );

  // Build the story outline display for template mode
  const isTemplateMode = inputMode === 'template';

  const storyOutline = isTemplateMode
    ? buildStoryOutline(templateSelections)
    : story;

  const storyPreview =
    storyOutline.length > 200
      ? storyOutline.slice(0, 200) + '...'
      : storyOutline;

  return (
    <Card variant="form" className="space-y-6">
      <div>
        <h2 className="text-heading text-txt-primary font-semibold">确认启动</h2>
        <p className="text-sm text-txt-secondary mt-1">确认以下信息无误后，点击开始生成</p>
      </div>

      {/* Project summary */}
      <div className="border border-bdr rounded-xl overflow-hidden divide-y divide-bdr">
        <div className="px-5 py-4">
          <p className="text-xs text-txt-muted mb-1">项目标题</p>
          <p className="text-[15px] font-medium text-txt-primary">{title || '—'}</p>
        </div>

        {genre && (
          <div className="px-5 py-4">
            <p className="text-xs text-txt-muted mb-1">题材类型</p>
            <span className="inline-block bg-accent text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
              {genre}
            </span>
          </div>
        )}

        <div className="px-5 py-4">
          <p className="text-xs text-txt-muted mb-1">
            创作模式
          </p>
          <span className="text-[15px] font-medium text-txt-primary">
            {isTemplateMode ? '模板创作' : '自由创作'}
          </span>
        </div>

        {/* Template-mode selections */}
        {isTemplateMode && activeTemplate && (
          <div className="px-5 py-4">
            <p className="text-xs text-txt-muted mb-2">故事配置</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary">
                模板: <span className="text-txt-primary font-medium">{activeTemplate.emoji} {activeTemplate.label}</span>
              </span>
              {templateSelections.protagonist && (
                <span className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary">
                  主角: <span className="text-txt-primary font-medium">{templateSelections.protagonist}</span>
                </span>
              )}
              {templateSelections.conflict && (
                <span className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary">
                  冲突: <span className="text-txt-primary font-medium">{templateSelections.conflict}</span>
                </span>
              )}
              {templateSelections.tone && (
                <span className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary">
                  基调: <span className="text-txt-primary font-medium">{templateSelections.tone}</span>
                </span>
              )}
              {templateSelections.episodeCount && (
                <span className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary">
                  集数: <span className="text-txt-primary font-medium">{templateSelections.episodeCount}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Free-mode story preview */}
        {!isTemplateMode && (
          <div className="px-5 py-4">
            <p className="text-xs text-txt-muted mb-2">故事大纲预览</p>
            <p className="text-sm text-txt-secondary leading-relaxed whitespace-pre-line">
              {storyPreview || '（未填写）'}
            </p>
          </div>
        )}

        <div className="px-5 py-4">
          <p className="text-xs text-txt-muted mb-1">视觉风格</p>
          <p className="text-[15px] font-medium text-txt-primary">{styleLabel}</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-txt-muted mb-1">输出分辨率</p>
          <p className="text-[15px] font-medium text-txt-primary">{resolutionLabel}</p>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-txt-muted mb-2">模型配置</p>
          <div className="flex flex-wrap gap-2">
            {modelFields.map(({ key, label }) => (
              <span
                key={key}
                className="text-xs bg-surface-subtle border border-bdr rounded-full px-3 py-1 text-txt-secondary"
              >
                {label}: <span className="text-txt-primary font-medium">{getModelLabel(key, modelConfig[key])}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="p-4 bg-surface-subtle border border-bdr rounded-xl">
        <p className="text-sm text-txt-secondary leading-relaxed">
          AI 将自动完成 <span className="font-medium text-txt-primary">16 个阶段</span>的生成流程，
          包含 <span className="font-medium text-txt-primary">4 个人工审核节点</span>。
          整个流程预计需要数分钟至数十分钟，取决于故事复杂程度。
        </p>
      </div>

      {/* Auto-start checkbox */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked)}
          className="w-4 h-4 rounded border-bdr text-accent focus:ring-accent/30"
        />
        <span className="text-sm text-txt-primary">创建后自动开始AI生成</span>
      </label>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="md"
          icon={<ChevronLeft className="w-4 h-4" />}
          onClick={onBack}
          disabled={loading}
          aria-label="上一步：视觉风格"
        >
          上一步
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onLaunch}
          disabled={loading}
          aria-label="开始 AI 生成流程"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
              正在创建...
            </>
          ) : (
            '开始生成'
          )}
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helper: compose story outline from template selections
// ---------------------------------------------------------------------------

function buildStoryOutline(selections: TemplateSelections): string {
  const template = STORY_TEMPLATES.find(
    (t) => t.id === selections.selectedTemplate,
  );
  if (!template) return '';

  const parts: string[] = [
    `模板：${template.label}`,
    selections.protagonist ? `主角：${selections.protagonist}` : '',
    selections.conflict ? `冲突：${selections.conflict}` : '',
    selections.tone ? `基调：${selections.tone}` : '',
    selections.episodeCount ? `集数：${selections.episodeCount}` : '',
  ];

  return parts.filter(Boolean).join(' | ');
}

// ---------------------------------------------------------------------------
// Main wizard component
// ---------------------------------------------------------------------------

export default function ProjectWizard() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [story, setStory] = useState('');
  const [visualStyle, setVisualStyle] = useState('anime');
  const [resolution, setResolution] = useState('1080x1920');
  const [modelConfig, setModelConfig] = useState<ModelConfig>(defaultModelConfig);
  const [autoStart, setAutoStart] = useState(true);
  const [loading, setLoading] = useState(false);

  // New template-mode state
  const [inputMode, setInputMode] = useState<InputMode>('template');
  const [templateSelections, setTemplateSelections] = useState<TemplateSelections>({
    selectedTemplate: null,
    protagonist: '',
    conflict: '',
    tone: '',
    episodeCount: '',
  });

  // Resolve the description that gets sent to the API
  function resolveStoryDescription(): string {
    if (inputMode === 'template') {
      return buildStoryOutline(templateSelections);
    }
    return story;
  }

  async function handleLaunch() {
    setLoading(true);
    try {
      const storyDescription = resolveStoryDescription();

      const projectRes = await createProject({
        title,
        genre,
        description: storyDescription,
        creative_brief: JSON.stringify({
          story: storyDescription,
          input_mode: inputMode,
          template_selections:
            inputMode === 'template' ? templateSelections : undefined,
          visual_style: visualStyle,
          resolution,
          models: modelConfig,
        }),
      } as Parameters<typeof createProject>[0]);

      const projectId = (projectRes.data as { id: number }).id;

      // Fire off pipeline run only if auto-start is enabled
      if (autoStart) {
        try {
          await startRun(projectId);
        } catch {
          // Run start failure is non-fatal — navigate anyway
        }
      }

      navigate(`/projects/${projectId}`);
    } catch {
      // API unavailable — stay on review step, let user retry
      setLoading(false);
    }
  }

  return (
    <AppLayout layout="header-only">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">

          {/* Page header */}
          <div>
            <nav
              className="flex items-center gap-1.5 text-sm text-txt-muted mb-3"
              aria-label="面包屑导航"
            >
              <button
                onClick={() => navigate('/projects')}
                className="hover:text-accent transition-colors"
              >
                项目
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
              <span className="text-txt-primary font-medium">新建项目</span>
            </nav>

            <h1 className="text-display-lg text-txt-primary font-display">创建新项目</h1>
            <p className="text-txt-secondary text-sm mt-1">
              选择模板快速创建，或输入故事大纲，AI 将自动完成完整的漫剧生成流程
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center">
            <StepIndicator current={currentStep} />
          </div>

          {/* Step content */}
          {currentStep === 0 && (
            <StoryStep
              title={title}
              setTitle={setTitle}
              genre={genre}
              setGenre={setGenre}
              story={story}
              setStory={setStory}
              inputMode={inputMode}
              setInputMode={setInputMode}
              templateSelections={templateSelections}
              setTemplateSelections={setTemplateSelections}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 1 && (
            <ModelStep
              visualStyle={visualStyle}
              setVisualStyle={setVisualStyle}
              resolution={resolution}
              setResolution={setResolution}
              modelConfig={modelConfig}
              setModelConfig={setModelConfig}
              onBack={() => setCurrentStep(0)}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <ReviewStep
              title={title}
              genre={genre}
              story={story}
              inputMode={inputMode}
              templateSelections={templateSelections}
              visualStyle={visualStyle}
              resolution={resolution}
              modelConfig={modelConfig}
              autoStart={autoStart}
              setAutoStart={setAutoStart}
              loading={loading}
              onBack={() => setCurrentStep(1)}
              onLaunch={handleLaunch}
            />
          )}

        </div>
      </div>
    </AppLayout>
  );
}
