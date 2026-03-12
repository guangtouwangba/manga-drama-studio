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
    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-white">{value}</p>
          {subtitle && <span className="text-slate-400 text-xs">{subtitle}</span>}
        </div>
        {trend && (
          <span
            className={`flex items-center text-xs font-bold mt-1 ${
              trend.positive !== false ? 'text-green-500' : 'text-red-500'
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
