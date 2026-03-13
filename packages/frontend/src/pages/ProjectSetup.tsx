/**
 * ProjectSetup.tsx
 *
 * Project settings/configuration page for the AI manga production platform.
 *
 * Usage:
 *   <Route path="/projects/:id/setup" element={<ProjectSetup />} />
 *
 * Renders standalone with mock data when the API is unreachable.
 */

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { ProjectSettings } from '../api/types';
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
  Save,
  X,
  Pen,
  Video,
  User,
  Monitor,
  AlignLeft,
  Wand2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LocalForm extends ProjectSettings {
  visual_style: string;
  global_prompt: string;
}

// ---------------------------------------------------------------------------
// Mock data – used when the API is unavailable or for standalone rendering
// ---------------------------------------------------------------------------

const MOCK_PROJECT = {
  id: 1,
  title: '仙玄纪元',
};

const MOCK_SETTINGS: LocalForm = {
  title: '仙玄纪元',
  genre: '仙侠',
  description: '一个修仙世界的宏大冒险故事，融合了传统武侠与现代漫画叙事风格，探索人性与命运的永恒主题。',
  resolution: '1080x1920',
  default_panel_count: 20,
  style_prefix: 'anime, high quality, ultra-detailed, cinematic lighting',
  global_prompt: 'xianxia cultivation world, ancient chinese architecture, dramatic clouds, mist, spiritual energy particles',
  visual_style: 'anime',
  writer_model: 'gpt-4o',
  artist_model: 'flux-pro',
  video_model: 'kling-v2',
  consistency_model: 'pulid-v1',
  budget_limit: 200,
  budget_used: 124,
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
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-8 h-8 rounded-lg bg-accent-light border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-txt-primary text-base">{title}</h3>
        {description && (
          <p className="text-xs text-txt-muted mt-0.5">{description}</p>
        )}
      </div>
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
// Main component
// ---------------------------------------------------------------------------

export default function ProjectSetup() {
  const { id } = useParams();

  const [form, setForm] = useState<LocalForm>(MOCK_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);

  const project = { ...MOCK_PROJECT, id: id ? Number(id) : MOCK_PROJECT.id };

  function update<K extends keyof LocalForm>(key: K, value: LocalForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }

  function handleCancel() {
    setForm(MOCK_SETTINGS);
    setIsDirty(false);
  }

  function handleSave() {
    // TODO: wire to API — PATCH /api/projects/:id/settings
    setIsDirty(false);
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

  return (
    <AppLayout layout="header-only">
      {/* Scrollable content area — leaves room for sticky footer */}
      <div className="flex-1 overflow-y-auto pb-28">
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
              to={`/projects/${project.id}`}
              className="hover:text-accent transition-colors"
            >
              {project.title}
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
              Section 1 — 基本信息
          ---------------------------------------------------------------- */}
          <Card variant="form">
            <SectionHeader
              icon={<Info className="w-4 h-4 text-accent" />}
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
              <FormField label="项目描述" icon={<AlignLeft className="w-3.5 h-3.5" />}>
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
                    <option value="1080x1920">1080 × 1920 — 竖版 (手机短视频)</option>
                    <option value="1920x1080">1920 × 1080 — 横版 (宽屏)</option>
                    <option value="1080x1080">1080 × 1080 — 正方形</option>
                    <option value="2048x2048">2048 × 2048 — 高精度正方形</option>
                    <option value="2560x1440">2560 × 1440 — 2K 横版</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>
          </Card>

          {/* ----------------------------------------------------------------
              Section 2 — 风格配置
          ---------------------------------------------------------------- */}
          <Card variant="form">
            <SectionHeader
              icon={<Palette className="w-4 h-4 text-accent" />}
              title="风格配置"
              description="定义画面视觉风格与全局提示词"
            />

            <div className="mb-5">
              <FormField label="视觉风格">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'anime', label: '日系动漫', badge: 'ANIME' },
                    { value: 'realistic', label: '写实风格', badge: 'REAL' },
                    { value: 'ink', label: '水墨国风', badge: 'INK' },
                    { value: 'cyberpunk', label: '赛博朋克', badge: 'CYBER' },
                  ].map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => update('visual_style', style.value)}
                      className={`relative flex flex-col items-center justify-center gap-2 h-20 rounded-xl border-2 transition-all text-sm font-medium ${
                        form.visual_style === style.value
                          ? 'border-accent bg-accent text-white'
                          : 'border-transparent bg-surface-subtle text-txt-secondary hover:bg-bdr'
                      }`}
                      aria-pressed={form.visual_style === style.value}
                      aria-label={`选择 ${style.label} 风格`}
                    >
                      <span className="text-xs font-extrabold tracking-wide opacity-60">
                        {style.badge}
                      </span>
                      <span>{style.label}</span>
                      {form.visual_style === style.value && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/80" />
                      )}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div className="space-y-5">
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
                  onChange={(e) => update('style_prefix', e.target.value)}
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
                  onChange={(e) => update('global_prompt', e.target.value)}
                  aria-label="全局提示词"
                />
              </FormField>
            </div>
          </Card>

          {/* ----------------------------------------------------------------
              Section 3 — AI 模型配置
          ---------------------------------------------------------------- */}
          <Card variant="form">
            <SectionHeader
              icon={<Cpu className="w-4 h-4 text-accent" />}
              title="AI 模型配置"
              description="为不同生产阶段指定专用模型"
            />

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
                    <optgroup label="OpenAI">
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o mini</option>
                    </optgroup>
                    <optgroup label="Anthropic">
                      <option value="claude-sonnet">Claude 3.7 Sonnet</option>
                      <option value="claude-haiku">Claude 3.5 Haiku</option>
                    </optgroup>
                    <optgroup label="国产">
                      <option value="deepseek-v3">DeepSeek V3</option>
                      <option value="qwen-max">通义千问 Max</option>
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
                    <option value="flux-pro">Flux Pro 1.1</option>
                    <option value="flux-dev">Flux Dev</option>
                    <option value="midjourney-v6">Midjourney V6</option>
                    <option value="sd-xl">Stable Diffusion XL</option>
                    <option value="dalle-3">DALL·E 3</option>
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
                    <option value="kling-v2">Kling V2</option>
                    <option value="kling-v1.5">Kling V1.5</option>
                    <option value="runway-gen3">Runway Gen-3 Alpha</option>
                    <option value="pika-v2">Pika V2</option>
                    <option value="sora">Sora</option>
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
                    <option value="pulid-v1">PuLID V1</option>
                    <option value="ip-adapter">IP-Adapter Plus</option>
                    <option value="photomaker">PhotoMaker V2</option>
                    <option value="instantid">InstantID</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>
          </Card>

          {/* ----------------------------------------------------------------
              Section 4 — 预算管理
          ---------------------------------------------------------------- */}
          <Card variant="form">
            <SectionHeader
              icon={<DollarSign className="w-4 h-4 text-accent" />}
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

      {/* ----------------------------------------------------------------
          Sticky bottom action bar
      ---------------------------------------------------------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-white border-t border-bdr" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
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
              disabled={!isDirty}
              aria-label="取消更改"
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              aria-label="保存设置"
            >
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
