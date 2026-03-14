import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { getRun, listProjectRuns, submitGateDecision } from '../api/runs';
import { PIPELINE_STAGES, PIPELINE_PHASES, AGENT_TYPES } from '../constants/pipeline';
import type { PipelineRun, PipelineStep } from '../api/types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  Globe,
  Users,
  Map as MapIcon,
  FileText,
  Layout,
  Paintbrush,
  Image,
  Layers,
  Film,
  Mic,
  Music,
  Package,
  Eye,
  Wrench,
  Play,
  Volume2,
  BarChart3,
  Clock,
  DollarSign,
  LayoutGrid,
  CheckCheck,
  RotateCcw,
  Video,
  SlidersHorizontal,
  AlertTriangle,
  Check,
  ArrowRight,
} from 'lucide-react';

// Icon map matching StageCard pattern
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Globe,
  Users,
  Map: MapIcon,
  FileText,
  Layout,
  ShieldCheck,
  Paintbrush,
  Image,
  Layers,
  Film,
  Mic,
  Music,
  Package,
};

// Determine which stages precede a gate by scanning phases in order
function getStagesBeforeGate(gateKey: string): string[] {
  const result: string[] = [];
  for (const phase of PIPELINE_PHASES) {
    for (const stageKey of phase.stages) {
      if (stageKey === gateKey) {
        return result;
      }
      // Only include non-gate stages
      if (!PIPELINE_STAGES[stageKey]?.gate) {
        result.push(stageKey);
      }
    }
  }
  return result;
}


// Format a step output value into a readable text string
function formatOutputPreview(snapshot: Record<string, unknown> | null): string | null {
  if (!snapshot) return null;
  // Try common content keys
  const value =
    snapshot.content ??
    snapshot.summary ??
    snapshot.text ??
    snapshot.result ??
    snapshot.output ??
    Object.values(snapshot)[0];
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return null;
}

// Gate labels for the info banner
const GATE_DESCRIPTIONS: Record<string, string> = {
  gate_creative: '涵盖故事分析、世界观构建、角色设计、场景设计、剧本编写及分镜布局共六个阶段的 AI 输出成果。',
  gate_storyboard: '涵盖角色绘制与场景绘制两个阶段的 AI 视觉资产成果。',
  gate_production: '涵盖面板合成、视频生成、语音合成及背景音乐生成四个阶段的制作成果。',
  gate_final: '对最终合成阶段的全量成果进行终审，确认可发布。',
};

/* ------------------------------------------------------------------ */
/* Structured rejection reasons per gate                              */
/* ------------------------------------------------------------------ */

const REJECTION_REASONS: Record<string, { id: string; label: string }[]> = {
  gate_creative: [
    { id: 'character_mismatch', label: '角色外观与描述不符' },
    { id: 'scene_style', label: '场景风格不统一' },
    { id: 'prop_design', label: '道具设计需要调整' },
    { id: 'worldbuilding', label: '世界观设定需要修改' },
    { id: 'script_pacing', label: '剧本节奏有问题' },
    { id: 'storyboard_layout', label: '分镜布局需要调整' },
  ],
  gate_storyboard: [
    { id: 'character_ref', label: '角色参考图不满意' },
    { id: 'scene_view', label: '场景视图不满意' },
    { id: 'consistency', label: '角色一致性有问题' },
    { id: 'visual_style', label: '视觉风格不统一' },
  ],
  gate_production: [
    { id: 'image_quality', label: '画面质量不达标' },
    { id: 'video_artifact', label: '视频生成有瑕疵' },
    { id: 'voice_quality', label: '配音效果不满意' },
    { id: 'lipsync', label: '口型同步有问题' },
    { id: 'transition', label: '镜头衔接不流畅' },
  ],
  gate_final: [
    { id: 'overall_quality', label: '整体质量需要提升' },
    { id: 'av_sync', label: '音画不同步' },
    { id: 'subtitle_error', label: '字幕有误' },
    { id: 'color_grading', label: '调色不统一' },
    { id: 'bgm_mismatch', label: 'BGM 与画面不搭配' },
  ],
};

/* ------------------------------------------------------------------ */
/* Gate-specific content preview components                           */
/* ------------------------------------------------------------------ */

function PreviewPlaceholder({
  icon: Icon,
  label,
  className = '',
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-surface-subtle rounded-lg border border-bdr ${className}`}
    >
      <span
        className="w-10 h-10 rounded-xl bg-canvas flex items-center justify-center mb-2"
        aria-hidden="true"
      >
        <Icon className="w-5 h-5 text-txt-muted" strokeWidth={1.5} />
      </span>
      <p className="text-xs text-txt-muted">{label}</p>
    </div>
  );
}

function CreativeGatePreview({ projectId }: { projectId: string }) {
  const items = [
    { icon: Users, label: '角色', count: 6, unit: '个' },
    { icon: MapIcon, label: '场景', count: 8, unit: '个' },
    { icon: Package, label: '道具', count: 12, unit: '件' },
    { icon: FileText, label: '剧本', count: 1, unit: '份' },
    { icon: Layout, label: '分镜', count: 24, unit: '面板' },
  ];

  return (
    <section aria-label="创意审核内容概览">
      <h2 className="text-heading text-txt-primary mb-4">内容概览</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} variant="default" className="!p-4 text-center space-y-3">
              <span
                className="inline-flex w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mx-auto"
                aria-hidden="true"
              >
                <Icon className="w-5 h-5 text-accent" strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-2xl font-semibold text-txt-primary leading-none">{item.count}</p>
                <p className="text-xs text-txt-muted mt-1">
                  {item.label}（{item.unit}）
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-accent font-medium hover:text-accent-dark transition-colors"
              >
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                预览
              </button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function StoryboardGatePreview({ projectId }: { projectId: string }) {
  const assets = [
    { icon: Paintbrush, label: '角色参考图', count: 6, status: '一致性通过' },
    { icon: Image, label: '场景视图', count: 8, status: '一致性通过' },
  ];

  return (
    <section aria-label="分镜审核内容概览">
      <h2 className="text-heading text-txt-primary mb-4">视觉资产概览</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <Card key={asset.label} variant="default" className="!p-0 overflow-hidden">
              {/* Placeholder image area */}
              <div className="aspect-[16/9] bg-surface-subtle flex flex-col items-center justify-center border-b border-bdr">
                <span
                  className="w-12 h-12 rounded-xl bg-canvas flex items-center justify-center mb-2"
                  aria-hidden="true"
                >
                  <Icon className="w-6 h-6 text-txt-muted" strokeWidth={1.5} />
                </span>
                <p className="text-sm text-txt-muted">{asset.count} 张资产</p>
              </div>
              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-txt-primary">{asset.label}</p>
                  <p className="text-xs text-txt-muted mt-0.5">{asset.count} 项</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-status-completed/10 text-status-completed">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
                  {asset.status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ProductionGatePreview({ projectId }: { projectId: string }) {
  const panels = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    label: `面板 ${String(i + 1).padStart(2, '0')}`,
    approved: null as boolean | null,
  }));

  const [panelStates, setPanelStates] = useState<Record<number, 'approved' | 'rejected' | null>>(
    () => Object.fromEntries(panels.map((p) => [p.id, null]))
  );

  const handlePanelDecision = (panelId: number, decision: 'approved' | 'rejected') => {
    setPanelStates((prev) => ({ ...prev, [panelId]: decision }));
  };

  return (
    <section aria-label="生产审核内容概览">
      <h2 className="text-heading text-txt-primary mb-4">面板逐一审核</h2>
      <div className="space-y-3">
        {panels.map((panel) => {
          const state = panelStates[panel.id];
          return (
            <Card key={panel.id} variant="default" className="!p-0 overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Image preview */}
                <div className="sm:w-40 h-28 sm:h-auto bg-surface-subtle flex items-center justify-center border-b sm:border-b-0 sm:border-r border-bdr flex-shrink-0">
                  <div className="text-center">
                    <Image className="w-5 h-5 text-txt-muted mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-[10px] text-txt-muted">图片</p>
                  </div>
                </div>
                {/* Video preview */}
                <div className="sm:w-40 h-28 sm:h-auto bg-surface-subtle flex items-center justify-center border-b sm:border-b-0 sm:border-r border-bdr flex-shrink-0">
                  <div className="text-center">
                    <Video className="w-5 h-5 text-txt-muted mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-[10px] text-txt-muted">视频</p>
                  </div>
                </div>
                {/* Audio preview */}
                <div className="sm:w-40 h-28 sm:h-auto bg-surface-subtle flex items-center justify-center border-b sm:border-b-0 sm:border-r border-bdr flex-shrink-0">
                  <div className="text-center">
                    <Volume2 className="w-5 h-5 text-txt-muted mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-[10px] text-txt-muted">音频</p>
                  </div>
                </div>
                {/* Panel info and actions */}
                <div className="flex-1 flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-txt-primary">{panel.label}</p>
                    <p className="text-xs text-txt-muted mt-0.5">图片 + 视频 + 语音 + BGM</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handlePanelDecision(panel.id, 'approved')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        state === 'approved'
                          ? 'bg-status-completed/15 text-status-completed border border-status-completed/30'
                          : 'text-txt-muted border border-bdr hover:border-status-completed/40 hover:text-status-completed'
                      }`}
                      aria-label={`通过 ${panel.label}`}
                    >
                      <CheckCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      通过
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePanelDecision(panel.id, 'rejected')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        state === 'rejected'
                          ? 'bg-status-failed/10 text-status-failed border border-status-failed/30'
                          : 'text-txt-muted border border-bdr hover:border-status-failed/40 hover:text-status-failed'
                      }`}
                      aria-label={`重做 ${panel.label}`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                      重做
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function FinalGatePreview({ projectId }: { projectId: string }) {
  const qaReports = [
    { label: '技术检查', score: 96, color: 'text-status-completed' },
    { label: '视觉一致性', score: 91, color: 'text-status-completed' },
    { label: '叙事连贯', score: 88, color: 'text-status-waiting' },
  ];

  const stats = [
    { icon: Clock, label: '总用时', value: '4h 32m' },
    { icon: DollarSign, label: '总成本', value: '$12.40' },
    { icon: LayoutGrid, label: '面板数', value: '24' },
  ];

  return (
    <section aria-label="终审内容概览" className="space-y-6">
      {/* Video player placeholder */}
      <div>
        <h2 className="text-heading text-txt-primary mb-4">成片预览</h2>
        <Card variant="default" className="!p-0 overflow-hidden">
          <div className="aspect-video bg-surface-subtle flex flex-col items-center justify-center">
            <span
              className="w-16 h-16 rounded-2xl bg-canvas flex items-center justify-center mb-3 shadow-sm"
              aria-hidden="true"
            >
              <Play className="w-8 h-8 text-txt-muted ml-1" strokeWidth={1.5} />
            </span>
            <p className="text-sm text-txt-muted">点击播放成片预览</p>
            <p className="text-xs text-txt-muted mt-1">24 面板 / 约 3 分 20 秒</p>
          </div>
        </Card>
      </div>

      {/* QA report cards */}
      <div>
        <h2 className="text-heading text-txt-primary mb-4">QA 报告</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {qaReports.map((report) => (
            <Card key={report.label} variant="default" className="!p-4 text-center space-y-2">
              <p className="text-sm font-medium text-txt-secondary">{report.label}</p>
              <p className={`text-3xl font-bold ${report.color}`}>{report.score}</p>
              <div className="w-full bg-surface-subtle rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    report.score >= 90 ? 'bg-status-completed' : 'bg-status-waiting'
                  }`}
                  style={{ width: `${report.score}%` }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Production stats */}
      <div>
        <h2 className="text-heading text-txt-primary mb-4">生产统计</h2>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} variant="default" className="!p-4 text-center space-y-2">
                <span
                  className="inline-flex w-9 h-9 rounded-lg bg-accent/10 items-center justify-center mx-auto"
                  aria-hidden="true"
                >
                  <Icon className="w-4.5 h-4.5 text-accent" strokeWidth={1.8} />
                </span>
                <p className="text-lg font-semibold text-txt-primary">{stat.value}</p>
                <p className="text-xs text-txt-muted">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Micro-tune navigation buttons per gate type                        */
/* ------------------------------------------------------------------ */

function MicroTuneButtons({ gateKey, projectId }: { gateKey: string; projectId: string }) {
  const buttonConfigs: Record<string, { to: string; label: string; icon: React.ElementType }[]> = {
    gate_creative: [
      { to: `/projects/${projectId}/assets`, label: '微调资产', icon: Package },
      { to: `/projects/${projectId}/episodes/1/script`, label: '微调剧本', icon: FileText },
      { to: `/projects/${projectId}/episodes/1/storyboard`, label: '微调分镜', icon: Layout },
    ],
    gate_storyboard: [
      { to: `/projects/${projectId}/assets`, label: '微调资产', icon: Paintbrush },
    ],
    gate_production: [
      { to: `/projects/${projectId}/episodes/1/storyboard`, label: '微调分镜', icon: Layout },
    ],
  };

  const buttons = buttonConfigs[gateKey];
  if (!buttons || buttons.length === 0) return null;

  return (
    <div className="pt-4 border-t border-bdr">
      <p className="text-xs text-txt-muted mb-3 flex items-center gap-1.5">
        <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={2} />
        需要微调？直接进入编辑器精修
      </p>
      <div className="flex flex-wrap gap-3">
        {buttons.map((btn) => {
          const Icon = btn.icon;
          return (
            <Link
              key={btn.to}
              to={btn.to}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-accent border border-accent/30 hover:bg-accent-light transition-all"
            >
              <Icon className="w-4 h-4" strokeWidth={1.8} />
              {btn.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                     */
/* ------------------------------------------------------------------ */

export default function GateReview() {
  const { id, gate } = useParams<{ id: string; gate: string }>();
  const navigate = useNavigate();

  const [run, setRun] = useState<(PipelineRun & { steps: PipelineStep[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rejectionMode, setRejectionMode] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const gateKey = gate ?? '';
  const gateInfo = PIPELINE_STAGES[gateKey];
  const priorStageKeys = getStagesBeforeGate(gateKey);

  // Fetch the most recent run for this project
  useEffect(() => {
    if (!id) return;
    listProjectRuns(Number(id))
      .then((res) => {
        const runs = res.data;
        const latestRun = runs.length > 0 ? runs[0] : null;
        if (latestRun) {
          getRun(latestRun.id)
            .then((fullRes) => setRun(fullRes.data))
            .catch(() => {
              setRun(null);
            });
        } else {
          setRun(null);
        }
      })
      .catch(() => {
        setRun(null);
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build the list of completed prior stage steps to display
  const displaySteps: PipelineStep[] = (() => {
    if (!run) return [];
    const stepsMap = new Map(run.steps.map((s) => [s.step_key, s]));
    return priorStageKeys
      .map((key) => stepsMap.get(key) ?? null)
      .filter((s): s is PipelineStep => s !== null && s.status === 'completed');
  })();

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!run) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const gateStep = run.steps.find((s) => s.step_key === gateKey);
      if (gateStep) {
        // Compose feedback from structured reasons + optional free text for rejections
        let composedFeedback: string | undefined;
        if (decision === 'reject' && selectedReasons.length > 0) {
          const reasons = REJECTION_REASONS[gateKey] ?? [];
          const selectedLabels = selectedReasons
            .map((rid) => reasons.find((r) => r.id === rid)?.label)
            .filter(Boolean);
          composedFeedback = `退回原因：${selectedLabels.join('、')}`;
          if (feedback.trim()) {
            composedFeedback += `。补充：${feedback.trim()}`;
          }
        } else {
          composedFeedback = feedback || undefined;
        }
        await submitGateDecision(gateStep.id, { decision, feedback: composedFeedback });
      }
      setSubmitted(true);
      // Auto-navigate back after a short pause
      setTimeout(() => navigate(`/projects/${id}`), 2200);
    } catch {
      setSubmitError('提交失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleReason = (reasonId: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonId) ? prev.filter((r) => r !== reasonId) : [...prev, reasonId]
    );
  };

  const exitRejectionMode = () => {
    setRejectionMode(false);
    setSelectedReasons([]);
    setFeedback('');
    setSubmitError(null);
  };

  const breadcrumbs = [
    { label: '项目', to: `/projects/${id}` },
    { label: 'Pipeline控制台', to: `/projects/${id}` },
    { label: `${gateInfo?.label ?? '审核'}审核` },
  ];

  if (loading) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex items-center justify-center py-40" role="status" aria-label="加载中">
          <Loader2 className="w-8 h-8 text-accent animate-spin" aria-hidden="true" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-canvas">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Page header */}
          <PageHeader
            breadcrumbs={breadcrumbs}
            title={`${gateInfo?.label ?? '人工审核'}`}
            subtitle="审查 AI 生成成果，决定是否批准继续后续流程"
          />

          {/* Gate info banner */}
          <div className="flex items-start gap-4 px-5 py-4 bg-accent-light border border-accent/20 rounded-xl">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center"
              aria-hidden="true"
            >
              <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-accent text-sm">
                人工审核节点 — {gateInfo?.label ?? gateKey}
              </p>
              <p className="text-sm text-txt-secondary mt-0.5">
                {GATE_DESCRIPTIONS[gateKey] ?? `本审核节点覆盖 ${priorStageKeys.length} 个 AI 阶段的输出成果，请逐一确认质量后作出决定。`}
              </p>
            </div>
          </div>

          {/* Gate-specific content preview section */}
          {id && gateKey === 'gate_creative' && <CreativeGatePreview projectId={id} />}
          {id && gateKey === 'gate_storyboard' && <StoryboardGatePreview projectId={id} />}
          {id && gateKey === 'gate_production' && <ProductionGatePreview projectId={id} />}
          {id && gateKey === 'gate_final' && <FinalGatePreview projectId={id} />}

          {/* Output gallery */}
          <section aria-label="阶段成果展示">
            <h2 className="text-heading text-txt-primary mb-4">各阶段输出成果</h2>

            {displaySteps.length === 0 ? (
              <Card variant="default">
                <p className="text-txt-muted text-sm text-center py-6">
                  暂无已完成阶段的输出成果可供审查
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {displaySteps.map((step, idx) => {
                  const stageInfo = PIPELINE_STAGES[step.step_key];
                  const agentKey = stageInfo?.agent;
                  const agentInfo = agentKey ? AGENT_TYPES[agentKey] : null;
                  const IconComponent = ICON_MAP[stageInfo?.icon ?? 'BookOpen'] ?? BookOpen;
                  const preview = formatOutputPreview(step.output);

                  return (
                    <div
                      key={step.id}
                      className="animate-fade-in-up bg-white rounded-xl overflow-hidden border border-bdr"
                      style={{ animationDelay: `${idx * 60}ms` }}
                      aria-label={`${stageInfo?.label ?? step.step_key} 输出`}
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-bdr bg-surface-subtle">
                        <span
                          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-accent/10 text-accent"
                          aria-hidden="true"
                        >
                          <IconComponent className="w-4 h-4" strokeWidth={2} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-txt-primary truncate">
                            {stageInfo?.label ?? step.step_key}
                          </p>
                          {agentInfo && (
                            <p className="text-[11px] text-txt-muted mt-0.5">{agentInfo.label}</p>
                          )}
                        </div>
                        {/* Status badge */}
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 bg-status-completed/10 text-status-completed text-[11px] font-medium rounded-full">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
                          已完成
                        </span>
                        {agentInfo && (
                          <span
                            className="flex-shrink-0 px-2 py-1 rounded-lg text-[11px] font-medium"
                            style={{
                              backgroundColor: `${agentInfo.color}18`,
                              color: agentInfo.color,
                            }}
                          >
                            {agentInfo.label}
                          </span>
                        )}
                      </div>

                      {/* Card body: output preview */}
                      <div className="px-5 py-4">
                        {preview ? (
                          <pre className="text-sm text-txt-secondary leading-relaxed whitespace-pre-wrap font-sans line-clamp-2">
                            {preview}
                          </pre>
                        ) : (
                          <div className="flex items-center justify-center aspect-video max-h-48 bg-surface-subtle rounded-lg border border-bdr">
                            <div className="text-center">
                              <span
                                className="block w-12 h-12 mx-auto rounded-xl bg-canvas flex items-center justify-center mb-2"
                                aria-hidden="true"
                              >
                                <IconComponent className="w-6 h-6 text-txt-muted" strokeWidth={1.5} />
                              </span>
                              <p className="text-xs text-txt-muted">输出内容暂不可预览</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Decision section */}
          <section aria-label="审核决定">
            {submitted ? (
              /* Success state */
              <div className="animate-scale-in flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-bdr text-center">
                <span
                  className="w-14 h-14 rounded-full bg-status-completed/15 flex items-center justify-center mb-4"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-7 h-7 text-status-completed" strokeWidth={2} />
                </span>
                <h3 className="text-heading text-txt-primary mb-1">审核决定已提交</h3>
                <p className="text-sm text-txt-muted">正在返回Pipeline控制台…</p>
              </div>
            ) : (
              <Card variant="default" className="space-y-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-accent" aria-hidden="true" />
                  <h2 className="text-heading text-txt-primary">审核决定</h2>
                </div>

                {!rejectionMode ? (
                  /* ---- Flow A: Quick Approve (default) ---- */
                  <div className="space-y-4">
                    {/* Prominent approve button */}
                    <button
                      type="button"
                      onClick={() => handleDecision('approve')}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-accent hover:bg-accent-dark active:scale-[0.98] text-white font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                      aria-label="批准通过 — 允许流水线继续后续阶段"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                      )}
                      批准通过，继续下一阶段
                    </button>

                    {/* Subtle rejection link */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setRejectionMode(true)}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 text-sm text-txt-muted hover:text-status-failed transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        发现问题？
                        <span className="inline-flex items-center gap-1 font-medium text-txt-secondary hover:text-status-failed transition-colors">
                          退回修改
                          <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                        </span>
                      </button>
                    </div>

                    {/* Micro-tune navigation buttons */}
                    {id && <MicroTuneButtons gateKey={gateKey} projectId={id} />}

                    {/* Helper text */}
                    <p className="text-[11px] text-txt-muted leading-relaxed text-center">
                      批准后，AI 将自动执行下一阶段。
                    </p>
                  </div>
                ) : (
                  /* ---- Flow B: Structured Rejection ---- */
                  <div className="space-y-5">
                    {/* Rejection header */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-status-failed/5 border border-status-failed/15 rounded-xl">
                      <AlertTriangle className="w-4.5 h-4.5 text-status-failed flex-shrink-0" strokeWidth={2} aria-hidden="true" />
                      <p className="text-sm font-medium text-status-failed">
                        退回原因（请选择至少一项）
                      </p>
                    </div>

                    {/* Reason checkboxes */}
                    <div className="space-y-2">
                      {(REJECTION_REASONS[gateKey] ?? []).map((reason) => {
                        const isSelected = selectedReasons.includes(reason.id);
                        return (
                          <label
                            key={reason.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-accent/40 bg-accent/5'
                                : 'border-bdr hover:border-bdr hover:bg-surface-subtle'
                            }`}
                          >
                            {/* Custom checkbox */}
                            <span
                              className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-accent text-white'
                                  : 'border-2 border-bdr bg-white'
                              }`}
                              aria-hidden="true"
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleReason(reason.id)}
                              className="sr-only"
                              aria-label={reason.label}
                            />
                            <span className={`text-sm ${isSelected ? 'text-txt-primary font-medium' : 'text-txt-secondary'}`}>
                              {reason.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>

                    {/* Optional supplementary textarea */}
                    <div className="space-y-2">
                      <label
                        htmlFor="gate-feedback"
                        className="block text-sm font-medium text-txt-secondary"
                      >
                        补充说明
                        <span className="text-txt-muted font-normal ml-1">（可选）</span>
                      </label>
                      <textarea
                        id="gate-feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="如有更具体的修改建议，可在此说明……"
                        rows={2}
                        disabled={submitting}
                        className="w-full rounded-xl border border-bdr bg-surface-subtle px-4 py-3 text-sm text-txt-primary placeholder:text-txt-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-describedby={submitError ? 'submit-error' : undefined}
                      />
                    </div>

                    {/* Error message */}
                    {submitError && (
                      <div
                        id="submit-error"
                        role="alert"
                        className="flex items-center gap-2 text-sm text-status-failed"
                      >
                        <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        {submitError}
                      </div>
                    )}

                    {/* Action buttons for rejection flow */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={exitRejectionMode}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-full text-sm font-medium text-txt-secondary hover:text-txt-primary hover:bg-surface-subtle transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecision('reject')}
                        disabled={submitting || selectedReasons.length === 0}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-status-failed/40 text-status-failed font-medium text-sm hover:bg-status-failed/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-status-failed/40"
                        aria-label="确认退回 — 将选中的问题反馈并退回修改"
                      >
                        {submitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <XCircle className="w-4 h-4" aria-hidden="true" />
                        )}
                        确认退回
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </section>

          {/* Back link */}
          {!submitted && (
            <div className="pb-6">
              <Link
                to={`/projects/${id}`}
                className="text-sm text-txt-muted hover:text-accent transition-colors"
              >
                &larr; 返回Pipeline控制台
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
