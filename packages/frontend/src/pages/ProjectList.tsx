import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProjects } from '../api/projects';
import type { Project } from '../api/types';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Pipeline phase definitions
// ---------------------------------------------------------------------------

const PIPELINE_PHASES = [
  { key: 'pre_production', label: '策划' },
  { key: 'creative_development', label: '创意' },
  { key: 'asset_production', label: '资产' },
  { key: 'production', label: '生产' },
  { key: 'post_production', label: '后期' },
] as const;

function phaseIndex(phase?: string): number {
  if (!phase) return -1;
  return PIPELINE_PHASES.findIndex((p) => p.key === phase);
}

function currentPhaseLabel(phase?: string): string | null {
  const idx = phaseIndex(phase);
  if (idx < 0) return null;
  return PIPELINE_PHASES[idx].label;
}

// ---------------------------------------------------------------------------
// PipelinePhaseBar — visual dot-and-line progress indicator
// ---------------------------------------------------------------------------

function PipelinePhaseBar({
  currentPhase,
  status,
}: {
  currentPhase?: string;
  status?: string;
}) {
  const activeIdx = phaseIndex(currentPhase);

  return (
    <div className="flex items-start w-full">
      {PIPELINE_PHASES.map((phase, i) => {
        const isCompleted = activeIdx > i;
        const isCurrent = activeIdx === i;
        const isRunning = isCurrent && status === 'running';
        const isLastPhase = i === PIPELINE_PHASES.length - 1;

        return (
          <div key={phase.key} className="flex flex-col items-center flex-1 min-w-0">
            {/* Dot + connector row */}
            <div className="flex items-center w-full">
              {/* Left connector */}
              {i > 0 && (
                <div
                  className={`h-[2px] flex-1 transition-colors ${
                    isCompleted || isCurrent ? 'bg-accent' : 'bg-bdr'
                  }`}
                />
              )}
              {i === 0 && <div className="flex-1" />}

              {/* Dot */}
              <div className="relative flex items-center justify-center">
                {isRunning && (
                  <span className="absolute w-4 h-4 rounded-full bg-accent/30 animate-ping" />
                )}
                <span
                  className={`relative w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-accent border-accent'
                      : isCurrent
                        ? 'bg-accent border-accent'
                        : 'bg-surface-subtle border-bdr'
                  }`}
                />
              </div>

              {/* Right connector */}
              {!isLastPhase && (
                <div
                  className={`h-[2px] flex-1 transition-colors ${
                    isCompleted ? 'bg-accent' : 'bg-bdr'
                  }`}
                />
              )}
              {isLastPhase && <div className="flex-1" />}
            </div>

            {/* Label */}
            <span
              className={`mt-1.5 text-[10px] leading-tight truncate ${
                isCompleted || isCurrent
                  ? 'text-accent font-medium'
                  : 'text-txt-muted'
              }`}
            >
              {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status labels
// ---------------------------------------------------------------------------

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-status-waiting' },
  in_progress: { label: '进行中', color: 'bg-accent' },
  published: { label: '已发布', color: 'bg-status-completed' },
};

// ---------------------------------------------------------------------------
// Format budget display
// ---------------------------------------------------------------------------

function formatBudget(used?: number, limit?: number): string | null {
  if (used == null) return null;
  const usedStr = `$${used.toFixed(2)}`;
  if (limit != null && limit > 0) return `${usedStr}/$${limit}`;
  return usedStr;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects()
      .then((res) => {
        setProjects(res.data);
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout layout="sidebar" sidebarContext="home">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white pl-14 pr-4 py-4 lg:px-8 md:py-6 border-b border-bdr">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-display-lg text-txt-primary font-display">我的项目</h1>
            <p className="text-txt-secondary text-sm mt-1">管理和创建你的漫画作品集</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/projects/new')}
          >
            新建项目
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8 pt-3 md:px-8 md:pb-12 md:pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center text-accent mb-4">
              <Plus className="w-10 h-10" />
            </div>
            <p className="text-lg font-semibold text-txt-primary">还没有项目</p>
            <p className="text-sm text-txt-secondary mt-1">创建你的第一个 AI 漫剧项目</p>
            <Button
              variant="primary"
              className="mt-6"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/projects/new')}
            >
              创建新项目
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p, i) => (
              <div key={p.id} className={i === 0 ? 'md:col-span-2' : ''}>
                <ProjectCard project={p} isFeatured={i === 0} />
              </div>
            ))}
            {/* Placeholder card */}
            <button
              onClick={() => navigate('/projects/new')}
              className="group border-2 border-dashed border-bdr rounded-2xl flex flex-col items-center justify-center p-8 hover:border-accent/50 hover:bg-accent-light/50 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <p className="mt-4 font-semibold text-txt-primary">创建新项目</p>
              <p className="text-xs text-txt-secondary mt-1 text-center">
                输入故事，AI 自动生成完整漫剧
              </p>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ---------------------------------------------------------------------------
// Dropdown menu -- self-contained per card, no prop drilling
// ---------------------------------------------------------------------------

function CardMenu({ projectId }: { projectId: number }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside this component
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  }

  function handleItem(e: React.MouseEvent, action: () => void) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    action();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label="项目菜单"
        aria-expanded={open}
        onClick={handleToggle}
        className="p-1.5 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-accent transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 bottom-full mb-1 w-40 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] border border-bdr z-20 overflow-hidden"
        >
          <button
            role="menuitem"
            onClick={(e) => handleItem(e, () => navigate(`/projects/${projectId}`))}
            className="w-full text-left px-4 py-2.5 text-sm text-txt-primary hover:bg-surface-subtle transition-colors"
          >
            打开项目
          </button>
          <button
            role="menuitem"
            onClick={(e) => handleItem(e, () => navigate(`/projects/${projectId}/setup`))}
            className="w-full text-left px-4 py-2.5 text-sm text-txt-primary hover:bg-surface-subtle transition-colors"
          >
            项目设置
          </button>
          <div className="border-t border-bdr" />
          <button
            role="menuitem"
            onClick={(e) =>
              handleItem(e, () => console.log('删除项目 placeholder — id:', projectId))
            }
            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            删除项目
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Project card — featured (first) and regular variants
// ---------------------------------------------------------------------------

function ProjectCard({ project, isFeatured = false }: { project: Project; isFeatured?: boolean }) {
  const p = project;
  const cover = p.cover_image_url || '';
  const sts = statusLabels[p.status] || statusLabels.draft;
  const phaseLabel = currentPhaseLabel(p.current_phase);
  const budget = formatBudget(p.budget_used, p.budget_limit);

  if (isFeatured) {
    return (
      <Link
        to={`/projects/${p.id}`}
        className="group bg-white rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow block h-full"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Image -- left side on md+ */}
          <div className="relative md:w-1/2 aspect-[16/10] md:aspect-auto md:min-h-[240px] overflow-hidden">
            {cover ? (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${cover})` }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                <span className="text-4xl font-bold text-accent/40">{p.title?.charAt(0) || '?'}</span>
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="bg-white/80 backdrop-blur-sm text-accent text-[11px] font-medium px-2.5 py-0.5 rounded-full tracking-wide">
                最近编辑
              </span>
              {p.genre && (
                <span className="bg-accent text-white text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide">
                  {p.genre}
                </span>
              )}
              <span
                className={`${sts.color} text-white text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide`}
              >
                {sts.label}
              </span>
            </div>
          </div>

          {/* Body -- right side on md+ */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold text-txt-primary mb-2 group-hover:text-accent transition-colors">
                {p.title}
              </h3>
              {p.description && (
                <p className="text-[15px] text-txt-secondary leading-relaxed line-clamp-2">
                  {p.description}
                </p>
              )}
            </div>
            <div className="space-y-3 mt-4">
              {/* Pipeline phase bar */}
              <PipelinePhaseBar currentPhase={p.current_phase} status={p.latest_run_status} />

              {/* Current stage + budget */}
              <div className="flex items-center justify-between text-xs text-txt-secondary">
                <span>
                  {phaseLabel ? `当前：${phaseLabel}` : '当前：未开始'}
                </span>
                {budget && (
                  <span className="font-medium text-txt-primary">{budget}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-bdr">
                <div className="flex items-center gap-1 text-[11px] text-txt-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{p.updated_at?.slice(0, 10) || '2026-01-01'}</span>
                </div>
                <CardMenu projectId={p.id} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/projects/${p.id}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow block"
    >
      {/* Image header */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {cover ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundImage: `url(${cover})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
            <span className="text-3xl font-bold text-accent/40">{p.title?.charAt(0) || '?'}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {p.genre && (
            <span className="bg-accent text-white text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide">
              {p.genre}
            </span>
          )}
          <span
            className={`${sts.color} text-white text-[11px] font-medium px-2 py-0.5 rounded uppercase tracking-wide`}
          >
            {sts.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-txt-primary mb-3 group-hover:text-accent transition-colors">
          {p.title}
        </h3>
        <div className="space-y-3">
          {/* Pipeline phase bar */}
          <PipelinePhaseBar currentPhase={p.current_phase} status={p.latest_run_status} />

          {/* Current stage + budget */}
          <div className="flex items-center justify-between text-xs text-txt-secondary">
            <span>
              {phaseLabel ? `当前：${phaseLabel}` : '当前：未开始'}
            </span>
            {budget && (
              <span className="font-medium text-txt-primary">{budget}</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-bdr">
            <div className="flex items-center gap-1 text-[11px] text-txt-secondary">
              <Calendar className="w-3.5 h-3.5" />
              <span>{p.updated_at?.slice(0, 10) || '2026-01-01'}</span>
            </div>
            <CardMenu projectId={p.id} />
          </div>
        </div>
      </div>
    </Link>
  );
}
