/**
 * ProjectSetup.tsx
 *
 * Project settings/configuration page for the AI manga production platform.
 *
 * Usage:
 *   <Route path="/projects/:id/setup" element={<ProjectSetup />} />
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject, updateProject } from '../api/projects';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import {
  Info,
  Palette,
  Cpu,
  DollarSign,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Pen,
  Video,
  User,
  Monitor,
  AlignLeft,
  Wand2,
  Loader2,
  Check,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectSettings {
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

interface LocalForm extends ProjectSettings {
  visual_style: string;
  global_prompt: string;
}

// ---------------------------------------------------------------------------
// Style presets
// ---------------------------------------------------------------------------

interface StylePreset {
  id: string;
  label: string;
  emoji: string;
  description: string;
  stylePrefix: string;
  globalPrompt: string;
  colorHint: string;
}

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'anime',
    label: '日系动漫',
    emoji: '🎨',
    description: '精致的日本动画风格，明快色彩',
    stylePrefix: 'anime style, cel shading, vibrant colors, detailed character design, clean lines',
    globalPrompt: '日本动画风格，色彩鲜明，线条流畅，注重角色表情和动态姿势。背景精致，光影效果突出。',
    colorHint: 'bg-gradient-to-br from-pink-100 to-blue-100',
  },
  {
    id: 'realistic',
    label: '写实风格',
    emoji: '📷',
    description: '接近真实的画面表现力',
    stylePrefix: 'photorealistic, highly detailed, cinematic lighting, 8k quality, dramatic',
    globalPrompt: '写实风格，注重光影层次和材质质感。人物造型贴近现实，环境渲染逼真，具有电影感的画面构图。',
    colorHint: 'bg-gradient-to-br from-gray-100 to-amber-50',
  },
  {
    id: 'ink',
    label: '水墨国风',
    emoji: '🖌️',
    description: '中国传统水墨画韵味',
    stylePrefix: 'chinese ink wash painting, sumi-e style, traditional, elegant, flowing brushstrokes',
    globalPrompt: '中国传统水墨风格，笔墨写意，留白讲究。人物造型参考古典工笔画，场景融入山水意境。',
    colorHint: 'bg-gradient-to-br from-gray-50 to-emerald-50',
  },
  {
    id: 'cyberpunk',
    label: '赛博朋克',
    emoji: '🌆',
    description: '霓虹灯光下的未来都市',
    stylePrefix: 'cyberpunk, neon lights, futuristic, dark atmosphere, rain, holographic, sci-fi',
    globalPrompt: '赛博朋克风格，霓虹灯映照的未来都市。高科技与低生活的对比，充满赛博格元素和全息投影。',
    colorHint: 'bg-gradient-to-br from-purple-100 to-cyan-100',
  },
  {
    id: 'watercolor',
    label: '梦幻水彩',
    emoji: '🌈',
    description: '柔和的水彩画质感',
    stylePrefix: 'watercolor illustration, soft colors, dreamy, pastel, delicate, artistic',
    globalPrompt: '水彩画风格，色彩柔和朦胧，具有梦幻般的质感。人物线条柔美，背景如水彩晕染般自然过渡。',
    colorHint: 'bg-gradient-to-br from-rose-50 to-sky-50',
  },
  {
    id: 'comic',
    label: '美漫风格',
    emoji: '💥',
    description: 'Marvel/DC 式漫画风格',
    stylePrefix: 'american comic style, bold outlines, dynamic poses, halftone dots, dramatic shadows',
    globalPrompt: '美式漫画风格，线条粗犷有力，色彩浓烈饱和。动作场面夸张有冲击力，阴影对比强烈。',
    colorHint: 'bg-gradient-to-br from-red-100 to-yellow-50',
  },
];

// ---------------------------------------------------------------------------
// Empty form defaults — used as initial state while data is loading
// ---------------------------------------------------------------------------

const emptyForm: LocalForm = {
  title: '',
  genre: '',
  description: '',
  resolution: '1080x1920',
  default_panel_count: 20,
  style_prefix: '',
  global_prompt: '',
  visual_style: 'anime',
  writer_model: 'google/gemini-2.5-flash',
  artist_model: 'flux-pro-1.1',
  video_model: 'kling-3.0',
  consistency_model: 'flux-lora',
  budget_limit: 200,
  budget_used: 0,
};

// ---------------------------------------------------------------------------
// Shared input class (light theme)
// ---------------------------------------------------------------------------

const inputClass =
  'w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none';

const selectClass =
  'w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none cursor-pointer';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-txt-primary text-base flex items-center gap-2">
        {icon}
        {title}
        {badge}
      </h3>
      {description && (
        <p className="text-xs text-txt-muted mt-0.5">{description}</p>
      )}
    </div>
  );
}

function FormField({
  label,
  hint,
  icon,
  children,
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-txt-secondary flex items-center gap-1.5">
        {icon && <span className="text-txt-muted">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-txt-muted">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find a preset by id, or return null. */
function findPreset(id: string | null): StylePreset | null {
  if (!id) return null;
  return STYLE_PRESETS.find((p) => p.id === id) ?? null;
}

/** Check whether current form values still match a given preset. */
function formMatchesPreset(form: LocalForm, preset: StylePreset): boolean {
  return (
    form.style_prefix === preset.stylePrefix &&
    form.global_prompt === preset.globalPrompt
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProjectSetup() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<LocalForm>(emptyForm);
  const [originalForm, setOriginalForm] = useState<LocalForm | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [projectTitle, setProjectTitle] = useState('');

  // Preset & expert-toggle state
  const [selectedPreset, setSelectedPreset] = useState<string | null>('anime');
  const [isCustomized, setIsCustomized] = useState(false);
  const [expertOpen, setExpertOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then((res) => {
        const p = res.data;
        setProjectTitle(p.title);
        const loaded: LocalForm = {
          title: p.title,
          genre: p.genre || '',
          description: p.description || '',
          resolution: `${(p as any).output_width ?? 1080}x${(p as any).output_height ?? 1920}`,
          default_panel_count: (p as any).default_panel_count ?? 20,
          style_prefix: (p as any).global_style || '',
          global_prompt: (p as any).global_prefix || '',
          visual_style: p.visual_style || 'anime',
          writer_model: (p as any).analysis_model || 'google/gemini-2.5-flash',
          artist_model: (p as any).image_model || 'flux-pro-1.1',
          video_model: (p as any).video_model || 'kling-3.0',
          consistency_model: (p as any).character_model || 'flux-lora',
          budget_limit: p.budget_limit ?? 200,
          budget_used: 0, // no budget tracking yet
        };
        setForm(loaded);
        setOriginalForm(loaded);

        // Try to match loaded data against a preset
        const matched = STYLE_PRESETS.find(
          (preset) =>
            preset.id === p.visual_style &&
            loaded.style_prefix === preset.stylePrefix &&
            loaded.global_prompt === preset.globalPrompt,
        );
        if (matched) {
          setSelectedPreset(matched.id);
          setIsCustomized(false);
        } else {
          // Check if visual_style matches a preset id but prompts were edited
          const partialMatch = STYLE_PRESETS.find((preset) => preset.id === p.visual_style);
          if (partialMatch) {
            setSelectedPreset(partialMatch.id);
            // If the prompts are non-empty and differ from the preset, mark as customized
            if (
              loaded.style_prefix &&
              loaded.global_prompt &&
              !formMatchesPreset(loaded, partialMatch)
            ) {
              setIsCustomized(true);
            }
          } else {
            setSelectedPreset(null);
            if (loaded.style_prefix || loaded.global_prompt) {
              setIsCustomized(true);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof LocalForm>(key: K, value: LocalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function selectPreset(presetId: string) {
    const preset = findPreset(presetId);
    if (!preset) return;

    // If user has customized text and picks a different preset, confirm override
    if (isCustomized && selectedPreset !== presetId) {
      const confirmed = window.confirm(
        '切换风格预设将覆盖你自定义的风格参数，是否继续？',
      );
      if (!confirmed) return;
    }

    setSelectedPreset(presetId);
    setIsCustomized(false);
    setForm((prev) => ({
      ...prev,
      visual_style: presetId,
      style_prefix: preset.stylePrefix,
      global_prompt: preset.globalPrompt,
    }));
    setIsDirty(true);
  }

  function handleExpertEdit(field: 'style_prefix' | 'global_prompt', value: string) {
    update(field, value);
    // Mark as customized if the value no longer matches the active preset
    const preset = findPreset(selectedPreset);
    if (preset) {
      const nextForm = { ...form, [field]: value };
      if (!formMatchesPreset(nextForm, preset)) {
        setIsCustomized(true);
      } else {
        setIsCustomized(false);
      }
    } else {
      setIsCustomized(true);
    }
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm('有未保存的更改，确定要放弃吗？');
      if (!confirmed) return;
    }
    navigate(`/projects/${id}`);
  }

  function showToast(type: 'success' | 'error', message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSaveToast({ type, message });
    toastTimerRef.current = setTimeout(() => setSaveToast(null), 3000);
  }

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    try {
      const [w, h] = form.resolution.split('x').map(Number);
      await updateProject(Number(id), {
        title: form.title,
        genre: form.genre,
        description: form.description,
        visual_style: form.visual_style,
        global_style: form.style_prefix,
        ...({
          global_prefix: form.global_prompt,
          output_width: w,
          output_height: h,
          default_panel_count: form.default_panel_count,
          analysis_model: form.writer_model,
          image_model: form.artist_model,
          video_model: form.video_model,
          character_model: form.consistency_model,
          budget_limit: form.budget_limit,
        } as any),
      });
      setOriginalForm(form);
      setIsDirty(false);
      showToast('success', '设置已保存');
    } catch {
      showToast('error', '保存失败，请检查网络后重试');
    } finally {
      setSaving(false);
    }
  }

  const budgetPercent = form.budget_limit > 0
    ? Math.min(100, Math.round((form.budget_used / form.budget_limit) * 100))
    : 0;

  const budgetColor =
    budgetPercent >= 90
      ? 'text-status-failed'
      : budgetPercent >= 75
      ? 'text-status-waiting'
      : 'text-accent';

  if (loading) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" aria-label="加载中" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-txt-muted" aria-label="Breadcrumb">
            <Link
              to="/projects"
              className="hover:text-accent transition-colors"
            >
              项目
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
            <Link
              to={`/projects/${id}`}
              className="hover:text-accent transition-colors"
            >
              {projectTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
            <span className="text-txt-primary font-medium">设置</span>
          </nav>

          {/* Page title */}
          <div>
            <h1 className="text-display-lg text-txt-primary">项目设置</h1>
            <p className="text-txt-secondary text-sm mt-1">
              配置项目的基本属性、风格偏好与 AI 模型参数
            </p>
          </div>

          {/* ----------------------------------------------------------------
              Single form card with all sections separated by dividers
          ---------------------------------------------------------------- */}
          <Card variant="form">

            {/* Section 1 — 基本信息 */}
            <SectionHeader
              icon={<Info className="w-4 h-4 text-txt-muted" />}
              title="基本信息"
              description="项目名称、类型与简介"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="项目名称">
                <input
                  type="text"
                  className={inputClass}
                  value={form.title}
                  placeholder="输入项目名称"
                  onChange={(e) => update('title', e.target.value)}
                  aria-label="项目名称"
                />
              </FormField>

              <FormField label="类型">
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.genre}
                    onChange={(e) => update('genre', e.target.value)}
                    aria-label="类型"
                  >
                    <option value="仙侠">仙侠</option>
                    <option value="武侠">武侠</option>
                    <option value="都市">都市</option>
                    <option value="科幻">科幻</option>
                    <option value="奇幻">奇幻</option>
                    <option value="恐怖">恐怖</option>
                    <option value="爱情">爱情</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>

            <div className="mt-5">
              <FormField
                label="项目描述（可选）"
                icon={<AlignLeft className="w-3.5 h-3.5" />}
                hint="AI 会从你的故事中自动提取世界观设定，这里可以补充额外说明"
              >
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={form.description}
                  placeholder="简要描述项目的世界观、故事背景与核心主题…"
                  onChange={(e) => update('description', e.target.value)}
                  aria-label="项目描述"
                />
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="输出分辨率" icon={<Monitor className="w-3.5 h-3.5" />}>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.resolution}
                    onChange={(e) => update('resolution', e.target.value)}
                    aria-label="输出分辨率"
                  >
                    <option value="1080x1920">1080 x 1920 — 竖版 (手机短视频)</option>
                    <option value="1920x1080">1920 x 1080 — 横版 (宽屏)</option>
                    <option value="1080x1080">1080 x 1080 — 正方形</option>
                    <option value="2048x2048">2048 x 2048 — 高精度正方形</option>
                    <option value="2560x1440">2560 x 1440 — 2K 横版</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 2 — 风格配置 (Preset System) */}
            <SectionHeader
              icon={<Palette className="w-4 h-4 text-txt-muted" />}
              title="风格配置"
              description="选择一种画面风格预设，AI 将自动配置最优参数"
              badge={
                selectedPreset && !isCustomized ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent-light px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    已自动配置
                  </span>
                ) : isCustomized ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-txt-secondary bg-surface-subtle px-2 py-0.5 rounded-full">
                    <Wand2 className="w-3 h-3" />
                    已自定义
                  </span>
                ) : null
              }
            />

            {/* Preset grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {STYLE_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectPreset(preset.id)}
                    className={[
                      'relative flex flex-col items-center justify-center gap-2 h-[150px] rounded-xl border-2 transition-all text-left px-4',
                      isSelected
                        ? `border-accent ${preset.colorHint} shadow-[0_2px_12px_rgba(13,148,136,0.12)]`
                        : 'border-bdr bg-white hover:border-accent/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
                    ].join(' ')}
                    aria-pressed={isSelected}
                    aria-label={`选择 ${preset.label} 风格`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <span className="text-3xl leading-none">{preset.emoji}</span>
                    <span className="text-sm font-semibold text-txt-primary">{preset.label}</span>
                    <span className="text-xs text-txt-muted text-center leading-snug">{preset.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Expert fields toggle */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setExpertOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-txt-secondary hover:text-txt-primary transition-colors"
                aria-expanded={expertOpen}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${expertOpen ? '' : '-rotate-90'}`}
                  aria-hidden="true"
                />
                自定义风格参数
              </button>

              {expertOpen && (
                <div className="mt-4 space-y-5 animate-fade-in-up">
                  <FormField
                    label="风格前缀"
                    icon={<Wand2 className="w-3.5 h-3.5" />}
                    hint="附加到每张图像提示词开头，用于统一画面风格"
                  >
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={2}
                      value={form.style_prefix}
                      placeholder="e.g. anime, high quality, detailed, cinematic…"
                      onChange={(e) => handleExpertEdit('style_prefix', e.target.value)}
                      aria-label="风格前缀"
                    />
                  </FormField>

                  <FormField
                    label="全局提示词"
                    icon={<AlignLeft className="w-3.5 h-3.5" />}
                    hint="应用于整个项目的世界观描述，所有面板生成时都会继承"
                  >
                    <textarea
                      className={`${inputClass} resize-none`}
                      rows={3}
                      value={form.global_prompt}
                      placeholder="描述世界观背景、环境氛围、视觉元素…"
                      onChange={(e) => handleExpertEdit('global_prompt', e.target.value)}
                      aria-label="全局提示词"
                    />
                  </FormField>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 3 — AI 模型配置 */}
            <SectionHeader
              icon={<Cpu className="w-4 h-4 text-txt-muted" />}
              title="AI 模型配置"
              description="已根据风格预设推荐最佳模型组合，通常无需修改"
            />

            {/* API key reminder */}
            <Link
              to={`/projects/${id}/settings`}
              className="flex items-center gap-3 p-4 mb-5 bg-accent-light/60 border border-accent/20 rounded-xl hover:bg-accent-light transition-colors group"
            >
              <Cpu className="w-5 h-5 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-txt-primary">配置 API 密钥</p>
                <p className="text-xs text-txt-secondary mt-0.5">
                  使用以下模型前，需在全局设置中配置对应服务商的 API 密钥
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-txt-muted group-hover:text-accent transition-colors shrink-0" />
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                label="编剧模型"
                icon={<Pen className="w-3.5 h-3.5" />}
                hint="用于剧本生成与情节扩写"
              >
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.writer_model}
                    onChange={(e) => update('writer_model', e.target.value)}
                    aria-label="编剧模型"
                  >
                    <optgroup label="Google">
                      <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                    </optgroup>
                    <optgroup label="Anthropic">
                      <option value="anthropic/claude-sonnet-4.6">Claude Sonnet 4.6</option>
                      <option value="anthropic/claude-opus-4.6">Claude Opus 4.6</option>
                    </optgroup>
                    <optgroup label="OpenAI">
                      <option value="openai/gpt-4o">GPT-4o</option>
                    </optgroup>
                    <optgroup label="国产">
                      <option value="deepseek/deepseek-r1">DeepSeek R1</option>
                      <option value="qwen/qwen3-235b-a22b">Qwen3 235B</option>
                    </optgroup>
                    <optgroup label="开源">
                      <option value="meta-llama/llama-3.3-70b-instruct">Llama 3.3 70B</option>
                      <option value="mistralai/mistral-large-2512">Mistral Large 3</option>
                    </optgroup>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              <FormField
                label="画师模型"
                icon={<Palette className="w-3.5 h-3.5" />}
                hint="用于分镜与角色图像生成"
              >
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.artist_model}
                    onChange={(e) => update('artist_model', e.target.value)}
                    aria-label="画师模型"
                  >
                    <optgroup label="Black Forest Labs">
                      <option value="flux-pro-1.1">FLUX Pro 1.1</option>
                      <option value="flux-2">FLUX.2</option>
                    </optgroup>
                    <optgroup label="其他">
                      <option value="seedream-5.0-lite">Seedream 5.0 Lite (ByteDance)</option>
                      <option value="ideogram-v3">Ideogram V3</option>
                      <option value="stable-diffusion-3.5">Stable Diffusion 3.5</option>
                      <option value="imagen-4">Imagen 4 (Google)</option>
                      <option value="kolors">Kolors (Kuaishou)</option>
                      <option value="gpt-image-1">GPT Image 1 (OpenAI)</option>
                      <option value="recraft-v4">Recraft V4</option>
                    </optgroup>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              <FormField
                label="视频模型"
                icon={<Video className="w-3.5 h-3.5" />}
                hint="用于动态面板与短剧视频生成"
              >
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.video_model}
                    onChange={(e) => update('video_model', e.target.value)}
                    aria-label="视频模型"
                  >
                    <optgroup label="国内">
                      <option value="kling-3.0">Kling 3.0 (快手)</option>
                      <option value="hailuo-2.3">Hailuo 2.3 (MiniMax)</option>
                      <option value="vidu-q3">Vidu Q3 (生数科技)</option>
                      <option value="cogvideox">CogVideoX (智谱)</option>
                      <option value="wan-2.6">Wan 2.6 (阿里)</option>
                      <option value="seedance-2.0">Seedance 2.0 (ByteDance)</option>
                    </optgroup>
                    <optgroup label="海外">
                      <option value="runway-gen4-turbo">Gen-4 Turbo (Runway)</option>
                      <option value="pika-2.5">Pika 2.5</option>
                      <option value="luma-dream-machine">Dream Machine (Luma)</option>
                      <option value="sora-2-pro">Sora 2 Pro (OpenAI)</option>
                      <option value="veo-3.1">Veo 3.1 (Google)</option>
                    </optgroup>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              <FormField
                label="角色一致性模型"
                icon={<User className="w-3.5 h-3.5" />}
                hint="保持角色外观在多帧间的连贯性"
              >
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.consistency_model}
                    onChange={(e) => update('consistency_model', e.target.value)}
                    aria-label="角色一致性模型"
                  >
                    <optgroup label="云端 API">
                      <option value="flux-lora">FLUX LoRA 角色训练 (fal.ai)</option>
                      <option value="instantid">InstantID (Replicate)</option>
                      <option value="kling-character-ref">Kling 角色参考 (快手)</option>
                      <option value="wan-r2v">Wan R2V 角色保持 (阿里)</option>
                    </optgroup>
                    <optgroup label="自部署">
                      <option value="pulid-v1">PuLID V1</option>
                    </optgroup>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 4 — 预算管理 */}
            <SectionHeader
              icon={<DollarSign className="w-4 h-4 text-txt-muted" />}
              title="预算管理"
              description="设置 API 调用费用上限与消耗监控"
            />

            {/* Live indicator */}
            <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl bg-surface-subtle border border-bdr">
              <div className="flex items-center gap-2 text-sm text-txt-secondary">
                <span className="w-2 h-2 rounded-full bg-status-completed animate-pulse" />
                实时同步中
              </div>
              <span className="text-xs text-txt-muted">每次生成任务完成后自动更新</span>
            </div>

            {/* Budget limit input */}
            <FormField
              label="预算上限 (USD)"
              hint="超过设定值后，新的生成任务将自动暂停"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm font-medium pointer-events-none">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  step={10}
                  className={`${inputClass} pl-8`}
                  value={form.budget_limit}
                  onChange={(e) => update('budget_limit', Number(e.target.value))}
                  aria-label="预算上限"
                />
              </div>
            </FormField>

            {/* Budget usage bar */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-txt-secondary">
                  已使用{' '}
                  <span className="text-txt-primary font-semibold">${form.budget_used.toFixed(2)}</span>
                  {' '}/ ${form.budget_limit.toFixed(2)}
                </span>
                <span className={`font-extrabold text-base ${budgetColor}`}>
                  {budgetPercent}%
                </span>
              </div>

              <ProgressBar
                percent={budgetPercent}
                size="lg"
                glow={budgetPercent < 80}
              />

              <div className="flex items-center justify-between text-xs text-txt-muted">
                <span>
                  剩余{' '}
                  <span className="text-txt-secondary font-medium">
                    ${Math.max(0, form.budget_limit - form.budget_used).toFixed(2)}
                  </span>
                </span>
                {budgetPercent >= 75 && (
                  <span className={budgetPercent >= 90 ? 'text-status-failed' : 'text-status-waiting'}>
                    {budgetPercent >= 90
                      ? '预算接近耗尽，请及时充值'
                      : '已使用超过 75%，请关注预算'}
                  </span>
                )}
                {budgetPercent < 75 && (
                  <span>超过 80% 时将发送预警通知</span>
                )}
              </div>

              {/* Threshold indicator ticks */}
              <div className="relative h-4">
                <div
                  className="absolute top-0 h-full border-l border-dashed border-status-waiting/50"
                  style={{ left: '75%' }}
                  title="预警线 75%"
                />
                <div
                  className="absolute top-0 h-full border-l border-dashed border-status-failed/50"
                  style={{ left: '90%' }}
                  title="危险线 90%"
                />
                <span
                  className="absolute text-[11px] text-status-waiting/70 -translate-x-1/2"
                  style={{ left: '75%', top: '2px' }}
                >
                  75%
                </span>
                <span
                  className="absolute text-[11px] text-status-failed/70 -translate-x-1/2"
                  style={{ left: '90%', top: '2px' }}
                >
                  90%
                </span>
              </div>
            </div>

          </Card>

        </div>
      </div>

      {/* Toast notification */}
      {saveToast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-fade-in-up ${
            saveToast.type === 'success'
              ? 'bg-accent text-white'
              : 'bg-status-failed text-white'
          }`}
          role="alert"
        >
          {saveToast.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
          {saveToast.message}
        </div>
      )}

      {/* ----------------------------------------------------------------
          Sticky bottom action bar
      ---------------------------------------------------------------- */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-bdr">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-txt-muted hidden sm:block">
            {isDirty ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                有未保存的更改
              </span>
            ) : (
              '所有设置已保存'
            )}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="secondary"
              size="md"
              icon={<X className="w-4 h-4" />}
              onClick={handleCancel}
              aria-label="取消"
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={!isDirty || saving}
              aria-label="保存设置"
            >
              {saving ? '保存中...' : '保存设置'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
