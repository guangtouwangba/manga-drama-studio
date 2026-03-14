/**
 * PipelineMonitor — "Mission control" view for AI pipeline generation.
 *
 * Route: /projects/:id/pipeline
 * Layout: header-sidebar with project context
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getRun, listProjectRuns, streamRunEvents } from '../api/runs';
import type { PipelineRun, PipelineStep, RunEvent, Project } from '../api/types';
import {
  PIPELINE_PHASES,
  PIPELINE_STAGES,
  TOTAL_STAGES,
} from '../constants/pipeline';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import PipelineTimeline from '../components/PipelineTimeline';
import GateActionCard from '../components/GateActionCard';
import {
  BookOpen,
  Globe,
  Users,
  Map as MapIcon,
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
  Loader2,
  Zap,
  Clock,
  DollarSign,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Icon lookup (mirrors StageCard)
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Globe, Users, Map: MapIcon, FileText, Layout, ShieldCheck,
  Paintbrush, Image, Layers, Film, Mic, Music, Package,
};

// ---------------------------------------------------------------------------
// Run status display config
// ---------------------------------------------------------------------------
const RUN_STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  pending: {
    label: '待启动',
    dot: 'bg-status-pending',
    text: 'text-txt-muted',
    bg: 'bg-status-pending/10',
  },
  running: {
    label: '生成中',
    dot: 'bg-status-running animate-pulse',
    text: 'text-status-running',
    bg: 'bg-status-running/10',
  },
  paused: {
    label: '已暂停',
    dot: 'bg-status-waiting',
    text: 'text-status-waiting',
    bg: 'bg-status-waiting/10',
  },
  completed: {
    label: '已完成',
    dot: 'bg-status-completed',
    text: 'text-status-completed',
    bg: 'bg-status-completed/10',
  },
  failed: {
    label: '失败',
    dot: 'bg-status-failed',
    text: 'text-status-failed',
    bg: 'bg-status-failed/10',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatElapsed(startedAt: string | null, completedAt?: string | null): string {
  const start = startedAt ? new Date(startedAt).getTime() : null;
  if (!start) return '--';
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const secs = Math.round((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}

function formatCost(total: number): string {
  return `¥${total.toFixed(2)}`;
}


// ---------------------------------------------------------------------------
// Stage detail panel (right column)
// ---------------------------------------------------------------------------
interface StagePanelProps {
  stageKey: string;
  step?: PipelineStep;
  run: PipelineRun;
  onGateDecision: (decision: 'approve' | 'reject') => void;
}

function StageDetailPanel({ stageKey, step, run, onGateDecision }: StagePanelProps) {
  const stageInfo = PIPELINE_STAGES[stageKey];
  if (!stageInfo) return null;

  const IconComponent = ICON_MAP[stageInfo.icon] ?? BookOpen;
  const isGate = Boolean(stageInfo.gate);
  const isWaitingForGate = step?.status === 'waiting_for_gate';

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: '等待中', color: 'text-txt-muted' },
    running: { label: '生成中', color: 'text-status-running' },
    completed: { label: '已完成', color: 'text-status-completed' },
    failed: { label: '失败', color: 'text-status-failed' },
    skipped: { label: '已跳过', color: 'text-txt-muted' },
    waiting_for_gate: { label: '等待审核', color: 'text-status-waiting' },
  };

  const statusConfig = step?.status ? statusLabels[step.status] : statusLabels.pending;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Stage header */}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            isGate
              ? 'bg-status-waiting/10 border border-status-waiting/20'
              : step?.status === 'completed'
              ? 'bg-accent/10 border border-accent/20'
              : step?.status === 'running'
              ? 'bg-accent/10 border border-accent/20'
              : step?.status === 'failed'
              ? 'bg-status-failed/10 border border-status-failed/20'
              : 'bg-surface-subtle border border-bdr'
          }`}
        >
          <IconComponent
            className={`w-6 h-6 ${
              isGate
                ? 'text-status-waiting'
                : step?.status === 'completed' || step?.status === 'running'
                ? 'text-accent'
                : step?.status === 'failed'
                ? 'text-status-failed'
                : 'text-txt-muted'
            }`}
            strokeWidth={2}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-txt-primary">{stageInfo.label}</h3>
          <p className={`text-[13px] font-medium mt-0.5 ${statusConfig.color}`}>
            {statusConfig.label}
          </p>
        </div>
        {/* Timing */}
        {step?.started_at && (
          <div className="text-right flex-shrink-0">
            <p className="text-[11px] text-txt-muted uppercase tracking-wide">用时</p>
            <p className="text-[13px] font-medium text-txt-secondary tabular-nums">
              {formatElapsed(step.started_at, step.completed_at)}
            </p>
          </div>
        )}
      </div>

      {/* Gate action card — shown when gate is waiting */}
      {isGate && isWaitingForGate && (
        <GateActionCard
          gate={stageKey}
          runId={run.id}
          stepId={step?.id}
          onDecision={onGateDecision}
        />
      )}

      {/* Output content — shown for non-gate-waiting stages */}
      {!isWaitingForGate && (
        <div>
          <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wide mb-3">
            输出内容
          </p>
          {step?.output ? (
            <div className="bg-surface-subtle rounded-xl border border-bdr-subtle p-4">
              {typeof step.output === 'object' && step.output !== null ? (
                <div className="flex flex-col gap-3">
                  {Object.entries(step.output).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">
                        {key}
                      </span>
                      <p className="text-[13px] text-txt-secondary mt-0.5 leading-relaxed">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-txt-secondary">{String(step.output)}</p>
              )}
            </div>
          ) : (
            <div className="bg-surface-subtle rounded-xl border border-bdr-subtle p-8 flex flex-col items-center justify-center gap-2">
              {step?.status === 'running' ? (
                <>
                  <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  <p className="text-[13px] text-txt-muted">正在生成中...</p>
                </>
              ) : step?.status === 'failed' ? (
                <>
                  <AlertCircle className="w-6 h-6 text-status-failed" />
                  <p className="text-[13px] text-txt-muted">该阶段执行失败</p>
                </>
              ) : (
                <p className="text-[13px] text-txt-muted">等待中...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Metadata row */}
      {step && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-txt-muted pt-2 border-t border-bdr-subtle">
          {step.started_at && (
            <span>
              开始：{new Date(step.started_at).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
          {step.completed_at && (
            <span>
              完成：{new Date(step.completed_at).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
          )}
          {stageInfo.agent && <span>执行Agent：{stageInfo.agent}</span>}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function PipelineMonitor() {
  const { id } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const sseCleanupRef = useRef<(() => void) | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Used to trigger a re-render every second for the live elapsed clock
  const [, forceUpdate] = useState(0);

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
          if (!runs || runs.length === 0) {
            setRun(null);
            setSteps([]);
            return;
          }
          const latestRun = runs[0];
          const runRes = await getRun(latestRun.id);
          if (cancelled) return;
          const { steps: fetchedSteps, ...fetchedRun } = runRes.data as PipelineRun & {
            steps: PipelineStep[];
          };
          setRun(fetchedRun);
          setSteps(fetchedSteps ?? []);

          // Auto-select active step
          const runningStep = (fetchedSteps ?? []).find((s) => s.status === 'running');
          const waitingGate = (fetchedSteps ?? []).find((s) => s.status === 'waiting_for_gate');
          setSelectedStage(
            fetchedRun.current_step ??
              runningStep?.step_key ??
              waitingGate?.step_key ??
              (fetchedSteps?.[0]?.step_key ?? null)
          );
        } catch {
          // API unavailable — no run to show
          setRun(null);
          setSteps([]);
        }
      } catch {
        // Project fetch failed
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
  // SSE when run is active
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!run) return;
    if (run.status !== 'running' && run.status !== 'paused') return;

    const cleanup = streamRunEvents(run.id, (event: RunEvent) => {
      setSteps((prev) => {
        if (
          event.event_type === 'step_started' ||
          event.event_type === 'step_completed' ||
          event.event_type === 'step_failed'
        ) {
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
          if (stepKey) setSelectedStage(stepKey);
          return { ...prev, current_step: stepKey ?? prev.current_step };
        }
        if (event.event_type === 'run_completed') return { ...prev, status: 'completed', completed_at: new Date().toISOString() };
        if (event.event_type === 'run_failed') return { ...prev, status: 'failed', completed_at: new Date().toISOString() };
        return prev;
      });
    });

    sseCleanupRef.current = cleanup;
    return () => {
      cleanup();
      sseCleanupRef.current = null;
    };
  }, [run?.id, run?.status]);

  // ---------------------------------------------------------------------------
  // Live elapsed clock — re-renders every second while running
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (run?.status === 'running') {
      elapsedTimerRef.current = setInterval(() => forceUpdate((n) => n + 1), 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [run?.status]);

  // ---------------------------------------------------------------------------
  // Gate decision
  // ---------------------------------------------------------------------------
  function handleGateDecision(decision: 'approve' | 'reject') {
    if (!selectedStage) return;
    setSteps((prev) =>
      prev.map((s) =>
        s.step_key === selectedStage
          ? { ...s, status: decision === 'approve' ? 'completed' : 'pending' }
          : s
      )
    );
    if (decision === 'approve') {
      const allKeys = PIPELINE_PHASES.flatMap((p) => p.stages);
      const idx = allKeys.indexOf(selectedStage);
      if (idx >= 0 && idx + 1 < allKeys.length) {
        setSelectedStage(allKeys[idx + 1]);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------------
  const completedCount = steps.filter(
    (s) => s.status === 'completed' || s.status === 'skipped'
  ).length;
  const progressPercent = Math.round((completedCount / TOTAL_STAGES) * 100);

  const currentPhase = run?.current_step
    ? (PIPELINE_PHASES.find((p) => p.stages.includes(run.current_step!))?.label ?? '--')
    : '--';

  const runStatusCfg = run
    ? (RUN_STATUS_CONFIG[run.status] ?? RUN_STATUS_CONFIG.pending)
    : RUN_STATUS_CONFIG.pending;

  const selectedStep = selectedStage
    ? steps.find((s) => s.step_key === selectedStage)
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      <div className="p-6 flex flex-col gap-5 max-w-[1400px] mx-auto w-full">

        {/* Breadcrumb + page title */}
        <PageHeader
          breadcrumbs={[
            { label: '项目', to: '/projects' },
            { label: project?.title ?? `项目 ${id}`, to: `/projects/${id}` },
            { label: '生成流水线' },
          ]}
          title="生成流水线"
          subtitle="实时监控AI流水线各阶段的生成进度与输出结果"
        />

        {/* Top status bar */}
        <div className="bg-white rounded-xl border border-bdr px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {/* Run status badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium ${runStatusCfg.bg} ${runStatusCfg.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${runStatusCfg.dot}`} />
            {runStatusCfg.label}
          </div>

          <div className="h-4 w-px bg-bdr hidden sm:block" />

          {/* Current phase */}
          <div className="flex items-center gap-2 text-[13px]">
            <Zap className="w-3.5 h-3.5 text-txt-muted" />
            <span className="text-txt-muted">当前阶段</span>
            <span className="font-medium text-txt-primary">{currentPhase}</span>
          </div>

          <div className="h-4 w-px bg-bdr hidden sm:block" />

          {/* Stage progress */}
          <div className="flex items-center gap-3 text-[13px]">
            <span className="text-txt-muted">进度</span>
            <span className="font-medium text-txt-primary tabular-nums">
              {completedCount}/{TOTAL_STAGES} 阶段完成
            </span>
            <ProgressBar percent={progressPercent} size="sm" className="w-24" />
          </div>

          <div className="h-4 w-px bg-bdr hidden sm:block" />

          {/* Total cost */}
          <div className="flex items-center gap-1.5 text-[13px]">
            <DollarSign className="w-3.5 h-3.5 text-txt-muted" />
            <span className="text-txt-muted">花费</span>
            <span className="font-medium text-txt-primary tabular-nums">
              {run ? formatCost(run.total_cost) : '--'}
            </span>
          </div>

          <div className="h-4 w-px bg-bdr hidden sm:block" />

          {/* Elapsed time */}
          <div className="flex items-center gap-1.5 text-[13px]">
            <Clock className="w-3.5 h-3.5 text-txt-muted" />
            <span className="text-txt-muted">用时</span>
            <span className="font-medium text-txt-primary tabular-nums">
              {run ? formatElapsed(run.started_at, run.completed_at) : '--'}
            </span>
          </div>

          {/* No run nudge */}
          {!run && (
            <div className="ml-auto flex items-center gap-2 text-[13px] text-txt-muted">
              <PlayCircle className="w-4 h-4" />
              暂无运行中的流水线
            </div>
          )}
        </div>

        {/* Main two-column layout */}
        <div className="flex gap-5 items-start flex-col lg:flex-row">

          {/* Left column: Timeline */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <Card className="p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-bdr-subtle">
                <h2 className="text-[14px] font-semibold text-txt-primary">流程时间线</h2>
                <span className="text-[11px] text-txt-muted tabular-nums">
                  {completedCount}/{TOTAL_STAGES}
                </span>
              </div>
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar -mx-1 px-1">
                <PipelineTimeline
                  steps={steps}
                  selectedStage={selectedStage}
                  onSelectStage={setSelectedStage}
                  currentStep={run?.current_step ?? null}
                />
              </div>
            </Card>
          </div>

          {/* Right column: Detail panel */}
          <div className="flex-1 min-w-0">
            <Card className="p-6 min-h-[400px]">
              {selectedStage ? (
                <>
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-bdr-subtle">
                    <h2 className="text-[14px] font-semibold text-txt-primary">阶段详情</h2>
                    {selectedStep?.status === 'running' && (
                      <div className="flex items-center gap-2 text-[12px] text-status-running">
                        <span className="w-1.5 h-1.5 rounded-full bg-status-running animate-pulse" />
                        实时更新
                      </div>
                    )}
                  </div>
                  {run && (
                    <StageDetailPanel
                      stageKey={selectedStage}
                      step={selectedStep}
                      run={run}
                      onGateDecision={handleGateDecision}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-txt-muted">
                  <PlayCircle className="w-10 h-10 text-bdr" />
                  <p className="text-[14px]">请从左侧选择一个阶段查看详情</p>
                </div>
              )}
            </Card>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
