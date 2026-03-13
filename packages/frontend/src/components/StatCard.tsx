import type { ReactNode } from 'react';
import ProgressBar from './ProgressBar';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive?: boolean };
  progress?: number;
  icon?: ReactNode;
}

export default function StatCard({
  label,
  value,
  subtitle,
  trend,
  progress,
  icon,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-[24px] p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-medium text-txt-secondary uppercase tracking-wide">{label}</p>
        {icon && <div className="text-txt-secondary">{icon}</div>}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold text-txt-primary">{value}</p>
          {subtitle && <span className="text-txt-secondary text-xs">{subtitle}</span>}
        </div>
        {trend && (
          <span
            className={`flex items-center text-xs font-medium mt-1 ${
              trend.positive !== false ? 'text-status-completed' : 'text-status-failed'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3">
          <ProgressBar percent={progress} />
        </div>
      )}
    </div>
  );
}
