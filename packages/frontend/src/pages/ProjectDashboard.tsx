/**
 * ProjectDashboard — Pipeline Control Console
 *
 * Route: /projects/:id
 *
 * The core page of the product. Replaces the old episode-table dashboard with
 * a unified pipeline console that shows real-time progress, gate reviews,
 * and completion state.
 *
 * Three states:
 *   A) Pipeline Running  — live SSE progress, current stage card, completed list
 *   B) Gate Waiting       — prominent review alert, approve/reject inline
 *   C) Not Started / Done — CTA to start or completion summary
 */
import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import { listProjectRuns, startRun, streamRunEvents, submitGateDecision } from '../api/runs';
import type { PipelineRun, PipelineStep, RunEvent, Project, GateDecision } from '../api/types';
import {
  PIPELINE_PHASES,
  PIPELINE_STAGES,
  TOTAL_STAGES,
  AGENT_TYPES,
} from '../constants/pipeline';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import {
  Settings,
  Loader2,
  Play,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  FileText,
  Eye,
  Download,
  MessageSquare,
  ThumbsUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format elapsed time from a start timestamp (optionally to a finish timestamp). */
function formatElapsed(startedAt: string | null, finishedAt?: string | null): string {
  const start = startedAt ? new Date(startedAt).getTime() : null;
  if (!start) return '--';
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const totalSecs = Math.max(0, Math.round((end - start) / 1000));
  if (totalSecs < 60) return `${totalSecs}s`;
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}m ${secs}s`;
}

/** Format a dollar cost value. */
function formatCost(cost: number): string {
  return `$${cost.toFixed(2)}`;
}


// ---------------------------------------------------------------------------
// Phase progress helpers
// ---------------------------------------------------------------------------

type PhaseStatus = 'completed' | 'active' | 'pending';

function getPhaseStatus(phase: typeof PIPELINE_PHASES[number], steps: PipelineStep[]): PhaseStatus {
  const allDone = phase.stages.every((key) => {
    const s = steps.find((st) => st.step_key === key);
    return s?.status === 'completed' || s?.status === 'skipped';
  });
  if (allDone) return 'completed';

  const hasActive = phase.stages.some((key) => {
    const s = steps.find((st) => st.step_key === key);
    return s?.status === 'running' || s?.status === 'waiting_for_gate';
  });
  if (hasActive) return 'active';

  return 'pending';
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Horizontal 5-phase progress indicator at the top of the console. */
function PhaseProgressBar({ steps }: { steps: PipelineStep[] }) {
  const phases = PIPELINE_PHASES.map((phase) => ({
    ...phase,
    status: getPhaseStatus(phase, steps),
  }));

  return (
    <div className="flex items-center w-full gap-0">
      {phases.map((phase, idx) => {
        const dotColor =
          phase.status === 'completed'
            ? 'bg-accent'
            : phase.status === 'active'
            ? 'bg-accent animate-pulse'
            : 'bg-bdr';
        const labelColor =
          phase.status === 'completed'
            ? 'text-accent'
            : phase.status === 'active'
            ? 'text-txt-primary font-semibold'
            : 'text-txt-muted';
        const lineColor =
          phase.status === 'completed' ? 'bg-accent' : 'bg-bdr';

        return (
          <div key={phase.id} className="flex items-center flex-1 min-w-0">
            {/* Dot + label */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors duration-300 ${
                phase.status === 'completed'
                  ? 'border-accent bg-accent'
                  : phase.status === 'active'
                  ? 'border-accent bg-white'
                  : 'border-bdr bg-white'
              }`}>
                {phase.status === 'active' && (
                  <div className="w-full h-full rounded-full bg-accent scale-50" />
                )}
              </div>
              <span className={`text-[11px] tracking-wide whitespace-nowrap ${labelColor}`}>
                {phase.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < phases.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-colors duration-500 ${lineColor}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** The live "current stage" card shown during State A (running). */
function CurrentStageCard({
  run,
  steps,
  currentStep,
}: {
  run: PipelineRun;
  steps: PipelineStep[];
  currentStep: PipelineStep | undefined;
}) {
  const stageInfo = run.current_step ? PIPELINE_STAGES[run.current_step] : null;
  const agentInfo = currentStep?.agent_type ? AGENT_TYPES[currentStep.agent_type] : null;

  // Count completed steps as a numeric progress indicator
  const allKeys = PIPELINE_PHASES.flatMap((p) => p.stages);
  const currentIdx = run.current_step ? allKeys.indexOf(run.current_step) : -1;
  const completedInStage = steps.filter((s) => s.status === 'completed').length;

  return (
    <Card className="border border-accent/20 bg-gradient-to-br from-accent-light/60 to-white p-0 overflow-hidden">
      {/* Animated accent bar at top */}
      <div className="h-1 bg-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent animate-pulse" style={{ width: '60%' }} />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
              </span>
            </div>
            <div>
              <h3 className="text-base font-semibold text-txt-primary">
                当前阶段：{stageInfo?.label ?? run.current_step}
              </h3>
              {agentInfo && (
                <p className="text-sm text-txt-secondary mt-0.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: agentInfo.color }}
                  />
                  {agentInfo.label} 正在工作...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-txt-muted mb-1.5">
            <span className="tabular-nums">{completedInStage}/{TOTAL_STAGES} 阶段完成</span>
            <span className="tabular-nums">{Math.round((completedInStage / TOTAL_STAGES) * 100)}%</span>
          </div>
          <ProgressBar
            percent={Math.round((completedInStage / TOTAL_STAGES) * 100)}
            size="md"
          />
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
          <span className="flex items-center gap-1.5 text-txt-secondary">
            <Clock className="w-3.5 h-3.5 text-txt-muted" />
            已用时 {formatElapsed(run.started_at)}
          </span>
          <span className="flex items-center gap-1.5 text-txt-secondary">
            <DollarSign className="w-3.5 h-3.5 text-txt-muted" />
            花费 {formatCost(run.total_cost)}
          </span>
        </div>
      </div>
    </Card>
  );
}

/** List of completed stages shown below the current stage card. */
function CompletedStagesList({ steps }: { steps: PipelineStep[] }) {
  const completedSteps = steps.filter((s) => s.status === 'completed');
  if (completedSteps.length === 0) return null;

  // Sort by completed_at descending (most recent first)
  const sorted = [...completedSteps].sort((a, b) => {
    if (!a.completed_at || !b.completed_at) return 0;
    return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
  });

  return (
    <div>
      <h3 className="text-[13px] font-medium text-txt-muted uppercase tracking-wide mb-3">
        已完成的阶段
      </h3>
      <div className="bg-white rounded-xl border border-bdr overflow-hidden divide-y divide-bdr-subtle">
        {sorted.map((step) => {
          const stageInfo = PIPELINE_STAGES[step.step_key];
          const agentInfo = step.agent_type ? AGENT_TYPES[step.agent_type] : null;
          const elapsed = formatElapsed(step.started_at, step.completed_at);

          return (
            <div
              key={step.id}
              className="flex items-center gap-3 px-4 py-3 text-[13px]"
            >
              <CheckCircle2 className="w-4 h-4 text-status-completed flex-shrink-0" />
              <span className="font-medium text-txt-primary flex-1 min-w-0 truncate">
                {stageInfo?.label ?? step.step_key}
              </span>
              {agentInfo && (
                <span className="text-txt-muted hidden sm:inline-flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: agentInfo.color }}
                  />
                  {agentInfo.label}
                </span>
              )}
              <span className="text-txt-muted tabular-nums flex-shrink-0">{elapsed}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Gate review card for State B — prominent inline review UI. */
function GateReviewCard({
  run,
  gateStep,
  projectId,
  onDecision,
  skipApi,
}: {
  run: PipelineRun;
  gateStep: PipelineStep;
  projectId: string;
  onDecision: (decision: 'approve' | 'reject') => void;
  skipApi?: boolean;
}) {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const stageInfo = PIPELINE_STAGES[gateStep.step_key];
  const gateName = stageInfo?.label ?? gateStep.step_key;

  // Find the phase this gate belongs to, for contextual links
  const gatePhase = PIPELINE_PHASES.find((p) => p.stages.includes(gateStep.step_key));

  async function handleDecision(decision: 'approve' | 'reject') {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (!skipApi) {
        const gateDecision: GateDecision = {
          decision,
          feedback: feedback.trim() || undefined,
        };
        await submitGateDecision(gateStep.id, gateDecision);
      }
      onDecision(decision);
    } catch {
      setSubmitError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Alert banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-txt-primary">需要您的审核</h3>
          <p className="text-sm text-amber-700 mt-0.5">
            {gateName} — 流水线已暂停，等待您确认后继续
          </p>
        </div>
      </div>

      {/* Gate review card */}
      <Card className="border border-amber-200/60 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-status-waiting/10 border border-status-waiting/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-status-waiting" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-txt-primary">{gateName}</h3>
            <p className="text-[13px] text-txt-muted mt-0.5">
              请检查AI输出结果，确认无误后批准继续
            </p>
          </div>
        </div>

        {/* AI output preview if available */}
        {gateStep.output && Object.keys(gateStep.output).length > 0 && (
          <div className="mb-5 bg-surface-subtle rounded-xl border border-bdr-subtle p-4">
            <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wide mb-2">AI 输出预览</p>
            <div className="flex flex-col gap-2">
              {Object.entries(gateStep.output).map(([key, value]) => (
                <div key={key}>
                  <span className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">{key}</span>
                  <p className="text-[13px] text-txt-secondary mt-0.5 leading-relaxed line-clamp-2">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand to see detail + editor links */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[13px] text-accent font-medium hover:text-accent-dark transition-colors mb-4"
        >
          {expanded ? '收起详情' : '展开详情'}
          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="mb-5 flex flex-wrap gap-3 animate-fade-in">
            <Link
              to={`/projects/${projectId}/script`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-subtle rounded-xl border border-bdr text-[13px] font-medium text-txt-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
              查看剧本
              <ExternalLink className="w-3 h-3 text-txt-muted" />
            </Link>
            <Link
              to={`/projects/${projectId}/storyboard`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-subtle rounded-xl border border-bdr text-[13px] font-medium text-txt-secondary hover:text-accent hover:border-accent/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
              查看分镜
              <ExternalLink className="w-3 h-3 text-txt-muted" />
            </Link>
          </div>
        )}

        {/* Feedback textarea */}
        <div className="mb-5">
          <label
            htmlFor={`gate-feedback-${gateStep.step_key}`}
            className="flex items-center gap-1.5 text-[12px] font-medium text-txt-secondary uppercase tracking-wide mb-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            审核意见（可选）
          </label>
          <textarea
            id={`gate-feedback-${gateStep.step_key}`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="填写审核意见或修改建议..."
            disabled={submitting}
            rows={3}
            className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[13px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error */}
        {submitError && (
          <p className="text-[12px] text-status-failed bg-status-failed/8 px-3 py-2 rounded-lg border border-status-failed/20 mb-4">
            {submitError}
          </p>
        )}

        {/* Action buttons — large and prominent */}
        <div className="flex gap-3">
          <Button
            variant="danger"
            size="lg"
            icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            onClick={() => handleDecision('reject')}
            disabled={submitting}
            className="flex-1"
          >
            退回修改
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
            onClick={() => handleDecision('approve')}
            disabled={submitting}
            className="flex-1 !bg-accent !text-white !border-accent hover:!bg-accent-dark"
          >
            批准通过
          </Button>
        </div>

        <p className="text-[11px] text-txt-muted text-center mt-3">
          批准后流水线将继续执行下一阶段 · 退回将重新执行本阶段
        </p>
      </Card>
    </div>
  );
}

/** State C (not started) — prominent CTA to kick off the pipeline. */
function NotStartedCard({
  starting,
  onStart,
}: {
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <Card className="border-2 border-dashed border-bdr p-10 flex flex-col items-center justify-center text-center animate-fade-in-up">
      <div className="w-16 h-16 rounded-2xl bg-accent-light border border-accent/20 flex items-center justify-center mb-5">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>
      <h2 className="text-heading text-txt-primary mb-2">开始AI生成</h2>
      <p className="text-sm text-txt-muted max-w-md mb-6 leading-relaxed">
        启动AI流水线，自动从故事分析到最终合成完成漫剧内容的全流程生成。
        整个过程中会有多个审核节点供您确认。
      </p>
      <Button
        variant="primary"
        size="lg"
        icon={starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
        onClick={onStart}
        disabled={starting}
      >
        {starting ? '启动中...' : '开始生成'}
      </Button>
    </Card>
  );
}

/** State C (completed) — summary with cost, duration, and export link. */
function CompletedCard({
  run,
  projectId,
}: {
  run: PipelineRun;
  projectId: string;
}) {
  return (
    <Card className="border border-status-completed/20 bg-gradient-to-br from-status-completed/5 to-white p-0 overflow-hidden animate-fade-in-up">
      <div className="h-1 bg-status-completed" />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-status-completed/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-status-completed" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-txt-primary">生成完成</h3>
            <p className="text-sm text-txt-muted mt-0.5">
              所有阶段已成功完成，漫剧内容已准备就绪
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface-subtle rounded-xl px-4 py-3">
            <p className="text-[11px] text-txt-muted uppercase tracking-wide mb-1">总耗时</p>
            <p className="text-base font-semibold text-txt-primary tabular-nums">
              {formatElapsed(run.started_at, run.completed_at)}
            </p>
          </div>
          <div className="bg-surface-subtle rounded-xl px-4 py-3">
            <p className="text-[11px] text-txt-muted uppercase tracking-wide mb-1">总花费</p>
            <p className="text-base font-semibold text-txt-primary tabular-nums">
              {formatCost(run.total_cost)}
            </p>
          </div>
          <div className="bg-surface-subtle rounded-xl px-4 py-3">
            <p className="text-[11px] text-txt-muted uppercase tracking-wide mb-1">阶段</p>
            <p className="text-base font-semibold text-txt-primary tabular-nums">
              {TOTAL_STAGES}/{TOTAL_STAGES}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Link to={`/projects/${projectId}/storyboard`}>
            <Button
              variant="primary"
              size="md"
              icon={<Eye className="w-4 h-4" />}
            >
              预览成果
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            icon={<Download className="w-4 h-4" />}
          >
            导出
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Cost summary footer card. */
function CostSummary({
  run,
  project,
}: {
  run: PipelineRun;
  project: Project;
}) {
  const budgetLimit = project.budget_limit ?? 0;
  const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((run.total_cost / budgetLimit) * 100)) : 0;

  return (
    <div>
      <h3 className="text-[13px] font-medium text-txt-muted uppercase tracking-wide mb-3">
        花费统计
      </h3>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-txt-muted" />
            <span className="text-sm text-txt-secondary">已花费</span>
            <span className="text-base font-semibold text-txt-primary tabular-nums">
              {formatCost(run.total_cost)}
            </span>
          </div>
          {budgetLimit > 0 && (
            <span className="text-sm text-txt-muted">
              / 预算 {formatCost(budgetLimit)}
            </span>
          )}
        </div>
        {budgetLimit > 0 && (
          <ProgressBar percent={budgetPercent} size="sm" />
        )}
      </Card>
    </div>
  );
}

const ALL_STAGE_KEYS = PIPELINE_PHASES.flatMap((p) => p.stages);

// ---------------------------------------------------------------------------
// Toast component (reusable inline)
// ---------------------------------------------------------------------------

function Toast({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  const bg = type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : type === 'error'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-blue-50 border-blue-200 text-blue-800';

  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium animate-fade-in ${bg}`}>
      <div className="flex items-center gap-2">
        {type === 'error' && <AlertTriangle className="w-4 h-4" />}
        {type === 'info' && <Info className="w-4 h-4" />}
        {type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {message}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingRun, setStartingRun] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const sseCleanupRef = useRef<(() => void) | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Force re-render every second for live elapsed clock
  const [, forceUpdate] = useState(0);

  function showToast(type: 'success' | 'error' | 'info', message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }

  // ---------------------------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const projRes = await getProject(Number(id));
        if (cancelled) return;
        setProject(projRes.data);

        try {
          const runsRes = await listProjectRuns(Number(id));
          if (cancelled) return;
          const runs = runsRes.data;
          if (runs && runs.length > 0) {
            const latestRun = runs[0];
            setRun(latestRun);
            // TODO: fetch full run details with steps via getRun(latestRun.id)
            setSteps([]);
          } else {
            // No runs — show "Not Started" CTA
            setRun(null);
            setSteps([]);
          }
        } catch {
          // Runs fetch failed — show "Not Started" CTA
          setRun(null);
          setSteps([]);
        }
      } catch {
        // Project fetch failed — project will be null, handled below
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---------------------------------------------------------------------------
  // SSE real-time updates (when backend worker is actually running)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!run) return;
    if (run.status !== 'running' && run.status !== 'paused') return;

    const cleanup = streamRunEvents(run.id, (event: RunEvent) => {
      setSteps((prev) => {
        if (['step_started', 'step_completed', 'step_failed'].includes(event.event_type)) {
          const stepData = event.payload as Partial<PipelineStep>;
          const idx = prev.findIndex((s) => s.id === stepData.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...stepData };
            return updated;
          }
          return stepData.id ? [...prev, stepData as PipelineStep] : prev;
        }
        return prev;
      });

      setRun((prev) => {
        if (!prev) return prev;
        if (event.event_type === 'step_started') {
          const stepKey = (event.payload as Partial<PipelineStep>).step_key ?? prev.current_step;
          return { ...prev, current_step: stepKey ?? prev.current_step };
        }
        if (event.event_type === 'step_completed') {
          const cost = (event.payload as Record<string, unknown>).cost;
          if (typeof cost === 'number') return { ...prev, total_cost: prev.total_cost + cost };
        }
        if (event.event_type === 'gate_waiting') {
          const stepKey = (event.payload as Partial<PipelineStep>).step_key ?? prev.current_step;
          return { ...prev, status: 'paused', current_step: stepKey ?? prev.current_step };
        }
        if (event.event_type === 'run_completed') return { ...prev, status: 'completed', completed_at: new Date().toISOString() };
        if (event.event_type === 'run_failed') return { ...prev, status: 'failed', completed_at: new Date().toISOString() };
        return prev;
      });
    });

    sseCleanupRef.current = cleanup;
    return () => { cleanup(); sseCleanupRef.current = null; };
  }, [run?.id, run?.status]);

  // ---------------------------------------------------------------------------
  // Live elapsed clock
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (run?.status === 'running') {
      elapsedTimerRef.current = setInterval(() => forceUpdate((n) => n + 1), 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => { if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current); };
  }, [run?.status]);

  // Cleanup timers
  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleStartRun = async () => {
    if (!id) return;
    setStartingRun(true);
    try {
      const res = await startRun(Number(id));
      const status = res.data.status;
      if (status === 'running') {
        // Worker picked it up — set run and let SSE drive updates
        setRun({
          id: res.data.run_id,
          project_id: Number(id),
          workflow_type: 'full',
          status: 'running',
          current_step: null,
          total_cost: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          created_at: new Date().toISOString(),
        });
        setSteps([]);
        showToast('success', '流水线已启动');
      } else {
        // Backend accepted but worker not running (status=pending)
        showToast('error', '后端服务未就绪，请先配置 API 密钥并启动 Pipeline Worker');
      }
    } catch {
      showToast('error', '无法连接后端服务，请检查后端是否启动');
    } finally {
      setStartingRun(false);
    }
  };

  const handleGateDecision = (decision: 'approve' | 'reject') => {
    if (!run?.current_step) return;

    const currentKey = run.current_step;
    const currentIdx = ALL_STAGE_KEYS.indexOf(currentKey);

    if (decision === 'approve') {
      setSteps((prev) =>
        prev.map((s) =>
          s.step_key === currentKey
            ? { ...s, status: 'completed', completed_at: new Date().toISOString() }
            : s
        )
      );
      setRun((prev) => (prev ? { ...prev, status: 'running' } : prev));
      showToast('success', `${PIPELINE_STAGES[currentKey]?.label ?? '审核'} 已通过`);

      if (currentIdx >= 0 && currentIdx + 1 < ALL_STAGE_KEYS.length) {
        setRun((prev) => (prev ? { ...prev, current_step: ALL_STAGE_KEYS[currentIdx + 1] } : prev));
      }
    } else {
      setSteps((prev) =>
        prev.map((s) => s.step_key === currentKey ? { ...s, status: 'pending' } : s)
      );
      showToast('info', '退回修改 — 重新执行本阶段');
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const isRunning = run?.status === 'running';
  const isPaused = run?.status === 'paused';
  const isCompleted = run?.status === 'completed';
  const isFailed = run?.status === 'failed';
  const hasNoRun = !run || run.status === 'pending';

  // Find the gate step that is waiting for review
  const gateStep = steps.find((s) => s.status === 'waiting_for_gate');

  // Determine if we are in gate-waiting state (State B)
  const isGateWaiting = isPaused && gateStep;

  // Current running step
  const currentRunningStep = run?.current_step
    ? steps.find((s) => s.step_key === run.current_step)
    : undefined;

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex flex-col items-center justify-center py-32 text-txt-secondary">
          <p>项目未找到</p>
          <Link to="/projects" className="text-accent mt-2 hover:underline">
            返回项目列表
          </Link>
        </div>
      </AppLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="p-6 flex flex-col gap-5 max-w-5xl mx-auto w-full">

        {/* Breadcrumb + Title */}
        <PageHeader
          breadcrumbs={[
            { label: '项目', to: '/projects' },
            { label: project.title },
          ]}
          title={project.title}
          actions={
            <Button
              variant="secondary"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => navigate(`/projects/${id}/setup`)}
            >
              项目设置
            </Button>
          }
        />

        {/* Phase progress bar — always visible when there are steps */}
        {steps.length > 0 && (
          <Card className="px-6 py-5">
            <h3 className="text-[13px] font-medium text-txt-muted uppercase tracking-wide mb-4">
              Pipeline 进度
            </h3>
            <PhaseProgressBar steps={steps} />
          </Card>
        )}

        {/* ================================================================= */}
        {/* State A: Pipeline Running                                         */}
        {/* ================================================================= */}
        {isRunning && run && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <CurrentStageCard
              run={run}
              steps={steps}
              currentStep={currentRunningStep}
            />
            <CompletedStagesList steps={steps} />
            <CostSummary run={run} project={project} />
          </div>
        )}

        {/* ================================================================= */}
        {/* State B: Gate Waiting (needs human review)                        */}
        {/* ================================================================= */}
        {isGateWaiting && run && gateStep && id && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <GateReviewCard
              run={run}
              gateStep={gateStep}
              projectId={id}
              onDecision={handleGateDecision}
              skipApi={false}
            />
            <CompletedStagesList steps={steps} />
            <CostSummary run={run} project={project} />
          </div>
        )}

        {/* Paused but no gate found — generic pause state */}
        {isPaused && !gateStep && run && (
          <Card className="border border-amber-200 bg-amber-50 p-6 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-txt-primary">流水线已暂停</h3>
                <p className="text-sm text-amber-700 mt-0.5">等待继续...</p>
              </div>
            </div>
          </Card>
        )}

        {/* ================================================================= */}
        {/* State C: Not Started                                              */}
        {/* ================================================================= */}
        {hasNoRun && (
          <NotStartedCard starting={startingRun} onStart={handleStartRun} />
        )}

        {/* ================================================================= */}
        {/* State C: Completed                                                */}
        {/* ================================================================= */}
        {isCompleted && run && id && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <CompletedCard run={run} projectId={id} />
            <CompletedStagesList steps={steps} />
            <CostSummary run={run} project={project} />
          </div>
        )}

        {/* ================================================================= */}
        {/* Failed state                                                      */}
        {/* ================================================================= */}
        {isFailed && run && (
          <div className="flex flex-col gap-5 animate-fade-in-up">
            <Card className="border border-status-failed/20 bg-status-failed/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-status-failed/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-status-failed" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-txt-primary">生成失败</h3>
                  <p className="text-sm text-txt-muted mt-0.5">
                    流水线在 {run.current_step ? (PIPELINE_STAGES[run.current_step]?.label ?? run.current_step) : '未知阶段'} 阶段遇到错误
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-[13px] text-txt-muted">
                    <span className="tabular-nums">用时 {formatElapsed(run.started_at, run.completed_at)}</span>
                    <span className="tabular-nums">花费 {formatCost(run.total_cost)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                <Button
                  variant="primary"
                  icon={startingRun ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  onClick={handleStartRun}
                  disabled={startingRun}
                >
                  {startingRun ? '重新启动中...' : '重新开始'}
                </Button>
              </div>
            </Card>
            <CompletedStagesList steps={steps} />
            <CostSummary run={run} project={project} />
          </div>
        )}

      </div>
    </AppLayout>
  );
}
