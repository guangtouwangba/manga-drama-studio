/**
 * StageCard — compact single-row card for one pipeline stage.
 *
 * Usage:
 *   <StageCard
 *     stageKey="story_analysis"
 *     step={steps.find(s => s.step_key === 'story_analysis')}
 *     isSelected={selectedStage === 'story_analysis'}
 *     isCurrent={currentStep === 'story_analysis'}
 *     onClick={() => onSelectStage('story_analysis')}
 *   />
 */
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
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react';
import type { PipelineStep } from '../api/types';
import { PIPELINE_STAGES, AGENT_TYPES } from '../constants/pipeline';

// Map icon string names from PIPELINE_STAGES to actual lucide components
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

export interface StageCardProps {
  stageKey: string;
  step?: PipelineStep;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: () => void;
}

function formatDuration(startedAt: string | null, finishedAt: string | null): string | null {
  if (!startedAt || !finishedAt) return null;
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}

function StatusIndicator({ status }: { status: string | undefined }) {
  if (!status || status === 'pending') {
    return (
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-txt-muted/40 bg-white"
        aria-label="等待中"
      />
    );
  }

  if (status === 'running') {
    return (
      <span className="flex-shrink-0 relative w-5 h-5" aria-label="运行中">
        <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
        <span className="absolute inset-[4px] rounded-full bg-accent" />
      </span>
    );
  }

  if (status === 'waiting_for_gate') {
    return (
      <span className="flex-shrink-0 relative w-5 h-5" aria-label="等待审核">
        <span className="absolute inset-0 rounded-full bg-status-waiting/20 animate-ping" />
        <span className="absolute inset-[4px] rounded-full bg-status-waiting" />
      </span>
    );
  }

  if (status === 'completed') {
    return (
      <CheckCircle2
        className="flex-shrink-0 w-5 h-5 text-accent"
        aria-label="已完成"
        strokeWidth={2.5}
      />
    );
  }

  if (status === 'failed') {
    return (
      <XCircle
        className="flex-shrink-0 w-5 h-5 text-status-failed"
        aria-label="失败"
        strokeWidth={2.5}
      />
    );
  }

  if (status === 'skipped') {
    return (
      <Circle
        className="flex-shrink-0 w-5 h-5 text-txt-muted/40"
        aria-label="跳过"
        strokeWidth={2}
      />
    );
  }

  return (
    <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-txt-muted/40 bg-white" />
  );
}

export default function StageCard({
  stageKey,
  step,
  isSelected,
  isCurrent,
  onClick,
}: StageCardProps) {
  const stageInfo = PIPELINE_STAGES[stageKey];
  if (!stageInfo) return null;

  const status = step?.status;
  const isGate = Boolean(stageInfo.gate);
  const agentKey = stageInfo.agent;
  const agentInfo = agentKey ? AGENT_TYPES[agentKey] : null;
  const duration = step ? formatDuration(step.started_at, step.completed_at) : null;

  const IconComponent = ICON_MAP[stageInfo.icon] ?? BookOpen;

  // Background and border based on state
  let cardClasses =
    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none group min-h-[48px]';

  if (isSelected) {
    cardClasses += isGate
      ? ' bg-status-waiting/8 border border-status-waiting/30 shadow-sm'
      : ' bg-accent/8 border border-accent/25 shadow-sm';
  } else if (isCurrent) {
    cardClasses += ' bg-surface-subtle border border-bdr';
  } else {
    cardClasses += ' hover:bg-surface-subtle border border-transparent';
  }

  // Gate stages get a left accent bar
  const gateAccentBar = isGate ? (
    <span
      className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full ${
        status === 'waiting_for_gate'
          ? 'bg-status-waiting'
          : status === 'completed'
          ? 'bg-accent'
          : 'bg-bdr'
      }`}
    />
  ) : null;

  return (
    <button
      className={cardClasses}
      onClick={onClick}
      aria-selected={isSelected}
      aria-label={`${stageInfo.label}${isGate ? ' (审核节点)' : ''}`}
    >
      {gateAccentBar}

      {/* Status circle */}
      <StatusIndicator status={status} />

      {/* Icon */}
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isGate
            ? 'bg-status-waiting/10 text-status-waiting'
            : status === 'completed'
            ? 'bg-accent/10 text-accent'
            : status === 'running'
            ? 'bg-accent/10 text-accent'
            : status === 'failed'
            ? 'bg-status-failed/10 text-status-failed'
            : 'bg-surface-subtle text-txt-muted'
        }`}
      >
        <IconComponent className="w-3.5 h-3.5" strokeWidth={2} />
      </span>

      {/* Label + agent pill */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span
          className={`text-[13px] font-medium truncate ${
            isSelected || isCurrent ? 'text-txt-primary' : 'text-txt-secondary'
          } group-hover:text-txt-primary transition-colors`}
        >
          {stageInfo.label}
        </span>
        {agentInfo && (
          <span
            className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none"
            style={{ backgroundColor: `${agentInfo.color}18`, color: agentInfo.color }}
          >
            {agentInfo.label}
          </span>
        )}
        {isGate && (
          <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none bg-status-waiting/15 text-status-waiting">
            审核
          </span>
        )}
      </div>

      {/* Right metadata: duration */}
      {duration && (
        <span className="flex-shrink-0 text-[11px] text-txt-muted tabular-nums">{duration}</span>
      )}

      {/* Running pulse glow on current */}
      {isCurrent && status === 'running' && (
        <span className="absolute inset-0 rounded-xl ring-1 ring-accent/30 animate-pulse pointer-events-none" />
      )}
    </button>
  );
}
