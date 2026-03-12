interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; dot?: string; label: string }> = {
  completed: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    label: '已完成',
  },
  in_progress: {
    bg: 'bg-primary/10 border-primary/20',
    text: 'text-primary',
    dot: 'bg-primary animate-pulse',
    label: '进行中',
  },
  not_started: {
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: '未开始',
  },
  draft: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    label: '草稿',
  },
  published: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-500',
    dot: 'bg-blue-500',
    label: '已发布',
  },
  active: {
    bg: 'bg-green-500/10 border-green-500/20',
    text: 'text-green-500',
    dot: 'bg-green-500',
    label: '活跃',
  },
  generating: {
    bg: 'bg-primary/10 border-primary/20',
    text: 'text-primary',
    dot: 'bg-primary animate-pulse',
    label: '生成中',
  },
  pending: {
    bg: 'bg-slate-500/10 border-slate-500/20',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: '等待中',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.not_started;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${sizeClasses} ${config.bg} ${config.text} font-bold rounded-lg border`}
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
