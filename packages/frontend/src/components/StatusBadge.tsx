interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; dot?: string; label: string }> = {
  completed: {
    bg: 'bg-status-completed/10',
    text: 'text-status-completed',
    dot: 'bg-status-completed',
    label: '已完成',
  },
  in_progress: {
    bg: 'bg-status-running/10',
    text: 'text-status-running',
    dot: 'bg-status-running animate-pulse',
    label: '进行中',
  },
  not_started: {
    bg: 'bg-status-pending/10',
    text: 'text-txt-muted',
    dot: 'bg-status-pending',
    label: '未开始',
  },
  draft: {
    bg: 'bg-status-waiting/10',
    text: 'text-status-waiting',
    dot: 'bg-status-waiting',
    label: '草稿',
  },
  published: {
    bg: 'bg-accent-light',
    text: 'text-accent',
    dot: 'bg-accent',
    label: '已发布',
  },
  active: {
    bg: 'bg-status-completed/10',
    text: 'text-status-completed',
    dot: 'bg-status-completed',
    label: '活跃',
  },
  generating: {
    bg: 'bg-status-running/10',
    text: 'text-status-running',
    dot: 'bg-status-running animate-pulse',
    label: '生成中',
  },
  pending: {
    bg: 'bg-status-pending/10',
    text: 'text-txt-muted',
    dot: 'bg-status-pending',
    label: '等待中',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.not_started;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-[13px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} ${config.bg} ${config.text} font-medium rounded-full`}
    >
      {config.dot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {config.label}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.not_started;
  return (
    <span className={`flex items-center gap-1.5 ${config.text} text-sm`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
