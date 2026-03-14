import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FolderOpen,
  LayoutDashboard,
  Warehouse,
  Settings,
  Cpu,
  Clapperboard,
  PanelLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Bell,
  FileEdit,
  LayoutPanelLeft,
} from 'lucide-react';
import { PIPELINE_PHASES, PIPELINE_STAGES } from '../constants/pipeline';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PhaseStatus = 'completed' | 'running' | 'waiting_gate' | 'pending';

export interface SidebarProps {
  context: 'home' | 'project' | 'editor';
  projectId?: string;
  collapsed: boolean;
  onToggle: () => void;
  /** Per-phase status keyed by phase id (e.g. "pre_production"). */
  phaseStatuses?: Record<string, PhaseStatus>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Find the first gate stage key inside a given phase. */
function findGateKey(phaseId: string): string | undefined {
  const phase = PIPELINE_PHASES.find((p) => p.id === phaseId);
  if (!phase) return undefined;
  return phase.stages.find((s) => PIPELINE_STAGES[s]?.gate);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-auto my-2 h-px w-6 bg-sidebar-border" />;
  }
  return (
    <p className="text-[11px] font-medium text-sidebar-txt uppercase tracking-wide px-3 pt-5 pb-1.5">
      {label}
    </p>
  );
}

/** Status indicator icon rendered to the right of each phase label. */
function PhaseStatusIcon({ status }: { status: PhaseStatus }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-status-completed flex-shrink-0" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-accent-medium animate-spin flex-shrink-0" />;
    case 'waiting_gate':
      return <Bell className="w-4 h-4 text-status-waiting flex-shrink-0" />;
    case 'pending':
    default:
      return <Circle className="w-3.5 h-3.5 text-sidebar-txt/40 flex-shrink-0" />;
  }
}

/** Tooltip shown when hovering a pending phase. */
function PendingTooltip({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 whitespace-nowrap rounded-lg bg-[#2A2A3C] px-3 py-1.5 text-xs text-sidebar-txt-bright shadow-dropdown pointer-events-none">
      该阶段尚未开始
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Sidebar({
  context,
  projectId,
  collapsed,
  onToggle,
  phaseStatuses = {},
}: SidebarProps) {
  const location = useLocation();
  const base = projectId ? `/projects/${projectId}` : '';

  return (
    <aside
      className={`flex-shrink-0 h-screen bg-sidebar flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Logo                                                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <Clapperboard className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-txt-bright truncate font-display">
              漫剧工坊
            </p>
            <p className="text-[11px] text-sidebar-txt tracking-wide font-display">
              Manga Drama Studio
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-full hover:bg-sidebar-hover text-sidebar-txt transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Navigation                                                         */}
      {/* ----------------------------------------------------------------- */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {context === 'home' ? (
          <HomeNav collapsed={collapsed} pathname={location.pathname} />
        ) : (
          <ProjectNav
            collapsed={collapsed}
            pathname={location.pathname}
            search={location.search}
            base={base}
            phaseStatuses={phaseStatuses}
          />
        )}
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* User section                                                       */}
      {/* ----------------------------------------------------------------- */}
      {context !== 'home' && !collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent-medium font-medium text-xs">
              SY
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-txt-bright truncate">Studio User</p>
              <p className="text-[11px] text-sidebar-txt">管理员</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Home context — simple list
// ---------------------------------------------------------------------------

function HomeNav({ collapsed, pathname }: { collapsed: boolean; pathname: string }) {
  const items = [
    { to: '/projects', label: '项目', icon: <FolderOpen className="w-5 h-5" />, match: (p: string) => p === '/projects' || p === '/projects/' },
    { to: '/settings', label: '设置', icon: <Settings className="w-5 h-5" />, match: (p: string) => p === '/settings' },
  ];

  return (
    <>
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              active
                ? 'bg-accent/20 text-accent-medium font-medium'
                : 'text-sidebar-txt hover:bg-sidebar-hover hover:text-sidebar-txt-bright'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </Link>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Project context — three sections
// ---------------------------------------------------------------------------

function ProjectNav({
  collapsed,
  pathname,
  search,
  base,
  phaseStatuses,
}: {
  collapsed: boolean;
  pathname: string;
  search: string;
  base: string;
  phaseStatuses: Record<string, PhaseStatus>;
}) {
  return (
    <>
      {/* ---- 项目 section ---- */}
      <SectionLabel label="项目" collapsed={collapsed} />
      <NavLink
        to={base}
        icon={<LayoutDashboard className="w-5 h-5" />}
        label="概览"
        active={pathname === base || pathname === `${base}/`}
        collapsed={collapsed}
      />

      {/* ---- 阶段 section ---- */}
      <SectionLabel label="阶段" collapsed={collapsed} />
      {PIPELINE_PHASES.map((phase) => (
        <PhaseNavItem
          key={phase.id}
          phaseId={phase.id}
          label={phase.label}
          status={phaseStatuses[phase.id] ?? 'pending'}
          base={base}
          collapsed={collapsed}
          pathname={pathname}
        />
      ))}

      {/* ---- 工具 section ---- */}
      <SectionLabel label="工具" collapsed={collapsed} />
      <NavLink
        to={`${base}/assets`}
        icon={<Warehouse className="w-5 h-5" />}
        label="资产仓库"
        active={pathname.startsWith(`${base}/assets`)}
        collapsed={collapsed}
      />
      <NavLink
        to={`${base}/episodes?mode=script`}
        icon={<FileEdit className="w-5 h-5" />}
        label="剧本编辑器"
        active={
          pathname.startsWith(`${base}/episodes`) && (pathname.includes('/script') || search.includes('mode=script'))
        }
        collapsed={collapsed}
      />
      <NavLink
        to={`${base}/episodes?mode=storyboard`}
        icon={<LayoutPanelLeft className="w-5 h-5" />}
        label="分镜编辑器"
        active={
          pathname.startsWith(`${base}/episodes`) && (pathname.includes('/storyboard') || search.includes('mode=storyboard'))
        }
        collapsed={collapsed}
      />
      <NavLink
        to={`${base}/setup`}
        icon={<Settings className="w-5 h-5" />}
        label="项目设置"
        active={pathname.startsWith(`${base}/setup`)}
        collapsed={collapsed}
      />
      <NavLink
        to={`${base}/settings`}
        icon={<Cpu className="w-5 h-5" />}
        label="API 密钥配置"
        active={pathname === `${base}/settings` || pathname === '/settings'}
        collapsed={collapsed}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Phase nav item — handles click behavior per status
// ---------------------------------------------------------------------------

function PhaseNavItem({
  phaseId,
  label,
  status,
  base,
  collapsed,
  pathname,
}: {
  phaseId: string;
  label: string;
  status: PhaseStatus;
  base: string;
  collapsed: boolean;
  pathname: string;
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Determine link target based on status
  const gateKey = status === 'waiting_gate' ? findGateKey(phaseId) : undefined;

  const linkTarget =
    status === 'waiting_gate' && gateKey
      ? `${base}/gate/${gateKey}`
      : status === 'pending'
        ? undefined // no navigation for pending phases
        : `${base}#phase-${phaseId}`;

  // Active state: completed and running phases link to dashboard anchors
  const isActive =
    status === 'waiting_gate' && gateKey
      ? pathname === `${base}/gate/${gateKey}`
      : false;

  const sharedClasses = `flex items-center gap-3 px-3 py-2 rounded-xl transition-colors relative ${
    collapsed ? 'justify-center' : ''
  }`;

  // Pending phases are not clickable — render a span instead of a Link
  if (status === 'pending') {
    return (
      <span
        className={`${sharedClasses} text-sidebar-txt/50 cursor-default`}
        title={collapsed ? `${label} — 该阶段尚未开始` : undefined}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <PhaseStatusIcon status={status} />
        {!collapsed && (
          <>
            <span className="text-sm flex-1">{label}</span>
            <PendingTooltip visible={tooltipVisible} />
          </>
        )}
      </span>
    );
  }

  return (
    <Link
      to={linkTarget!}
      aria-current={isActive ? 'page' : undefined}
      className={`${sharedClasses} ${
        isActive
          ? 'bg-accent/20 text-accent-medium font-medium'
          : status === 'running'
            ? 'text-sidebar-txt-bright hover:bg-sidebar-hover'
            : 'text-sidebar-txt hover:bg-sidebar-hover hover:text-sidebar-txt-bright'
      }`}
      title={collapsed ? label : undefined}
    >
      <PhaseStatusIcon status={status} />
      {!collapsed && <span className="text-sm flex-1">{label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Generic nav link (used for tools section & overview)
// ---------------------------------------------------------------------------

function NavLink({
  to,
  icon,
  label,
  active,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        active
          ? 'bg-accent/20 text-accent-medium font-medium'
          : 'text-sidebar-txt hover:bg-sidebar-hover hover:text-sidebar-txt-bright'
      } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </Link>
  );
}
