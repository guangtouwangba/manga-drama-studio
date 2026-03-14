/**
 * CandidatePicker — AI image candidate selection grid.
 *
 * Usage:
 *   <CandidatePicker
 *     panelId={12}
 *     candidates={versions}
 *     selectedId={selectedVersionId}
 *     onSelect={(id) => setSelectedVersionId(id)}
 *     loading={isFetchingCandidates}
 *   />
 */
import type { PanelVersion } from '../api/types';
import { Clock, Cpu, CheckCircle2 } from 'lucide-react';

export interface CandidatePickerProps {
  panelId: number;
  candidates: PanelVersion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  loading?: boolean;
}

export default function CandidatePicker({
  candidates,
  selectedId,
  onSelect,
  loading = false,
}: CandidatePickerProps) {
  // Loading state: skeleton placeholders
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" aria-busy="true" aria-label="加载候选版本中">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden border border-bdr animate-pulse"
          >
            {/* Image skeleton */}
            <div className="aspect-video bg-surface-subtle" />
            {/* Body skeleton */}
            <div className="p-3 space-y-2">
              <div className="h-3 bg-surface-subtle rounded-full w-1/3" />
              <div className="h-2.5 bg-surface-subtle rounded-full w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (candidates.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-bdr rounded-xl text-txt-muted"
        role="status"
        aria-label="暂无候选版本"
      >
        <span className="text-3xl mb-3" aria-hidden="true">🖼</span>
        <p className="text-sm font-medium text-txt-secondary">暂无候选版本</p>
        <p className="text-xs text-txt-muted mt-1">AI 生成完成后，候选版本将显示在此处</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      role="listbox"
      aria-label="选择候选版本"
    >
      {candidates.map((candidate) => {
        const isSelected = candidate.id === selectedId;

        return (
          <button
            key={candidate.id}
            role="option"
            aria-selected={isSelected}
            aria-label={`候选版本 V${candidate.version_number}: ${candidate.label}`}
            onClick={() => onSelect(candidate.id)}
            className={`relative bg-white rounded-xl overflow-hidden text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group ${
              isSelected
                ? 'ring-2 ring-accent shadow-[0_4px_16px_rgba(13,148,136,0.15)]'
                : 'border border-bdr hover:border-accent/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Selected checkmark overlay */}
            {isSelected && (
              <span
                className="absolute top-2 right-2 z-10 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-md"
                aria-hidden="true"
              >
                <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={2.5} />
              </span>
            )}

            {/* Thumbnail */}
            <div className="aspect-video overflow-hidden bg-surface-subtle relative">
              <img
                src={candidate.image_url}
                alt={candidate.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {/* Version badge */}
              <span
                className={`absolute bottom-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
                  isSelected
                    ? 'bg-accent text-white'
                    : 'bg-[#1A1A1A]/60 text-white backdrop-blur-sm'
                }`}
              >
                V{candidate.version_number}
              </span>
              {candidate.is_latest && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-accent text-white">
                  最新
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p
                className={`text-[13px] font-semibold truncate ${
                  isSelected ? 'text-accent' : 'text-txt-primary'
                }`}
              >
                {candidate.label || `版本 ${candidate.version_number}`}
              </p>

              {/* Badges row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {candidate.model_used && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-subtle rounded text-[10px] text-txt-muted font-medium">
                    <Cpu className="w-2.5 h-2.5" aria-hidden="true" />
                    {candidate.model_used}
                  </span>
                )}
                {candidate.inference_time != null && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-subtle rounded text-[10px] text-txt-muted font-medium">
                    <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                    {candidate.inference_time}s
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
