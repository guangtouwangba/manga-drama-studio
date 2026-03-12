import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  FolderOpen,
  Settings,
  FileText,
  LayoutDashboard,
  Film,
  Warehouse,
  Users,
  HelpCircle,
  Clapperboard,
  PanelLeft,
} from 'lucide-react';
import ProgressBar from './ProgressBar';

interface NavItem {
  icon: ReactNode;
  label: string;
  to: string;
  dividerBefore?: string;
}

interface SidebarProps {
  context: 'home' | 'project' | 'editor';
  projectId?: string;
  collapsed: boolean;
  onToggle: () => void;
}

function getNavItems(context: string, projectId?: string): NavItem[] {
  if (context === 'home') {
    return [
      { icon: <FolderOpen className="w-5 h-5" />, label: '项目', to: '/projects' },
      { icon: <Settings className="w-5 h-5" />, label: '设置', to: '/settings' },
      { icon: <FileText className="w-5 h-5" />, label: '文档', to: '/docs' },
    ];
  }

  const base = `/projects/${projectId}`;
  const items: NavItem[] = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: '概览', to: base },
    { icon: <Film className="w-5 h-5" />, label: '剧集管理', to: `${base}/episodes` },
    { icon: <Warehouse className="w-5 h-5" />, label: '资产仓库', to: `${base}/assets` },
    { icon: <Users className="w-5 h-5" />, label: '团队协作', to: `${base}/team` },
  ];

  if (context === 'editor') {
    items.push({
      icon: <Settings className="w-5 h-5" />,
      label: '偏好设置',
      to: '/settings',
      dividerBefore: '系统控制',
    });
  }

  return items;
}

export default function Sidebar({ context, projectId, collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navItems = getNavItems(context, projectId);

  return (
    <aside
      className={`flex-shrink-0 bg-canvas flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
          <Clapperboard className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-txt-primary truncate">AI Manga Editor</p>
            <p className="text-[10px] text-txt-muted uppercase tracking-widest">Creator Studio</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-full hover:bg-white/60 text-txt-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item, i) => {
          const isActive =
            item.to === '/projects'
              ? location.pathname === '/projects'
              : location.pathname === item.to ||
                (item.to !== `/projects/${projectId}` && location.pathname.startsWith(item.to));

          return (
            <div key={i}>
              {item.dividerBefore && !collapsed && (
                <p className="text-[10px] font-bold text-txt-muted uppercase tracking-widest px-3 py-2 mt-4">
                  {item.dividerBefore}
                </p>
              )}
              <Link
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white text-accent font-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                    : 'text-txt-secondary hover:bg-white/60 hover:text-txt-primary'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {context === 'home' && !collapsed && (
        <div className="p-4">
          <div className="bg-white/70 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-txt-secondary">存储空间</span>
              <span className="text-xs font-bold text-accent">85%</span>
            </div>
            <ProgressBar percent={85} />
          </div>
        </div>
      )}

      {context !== 'home' && !collapsed && (
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent font-bold text-xs">
              SY
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-txt-primary truncate">Studio User</p>
              <p className="text-[10px] text-txt-muted">管理员</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom help link for project context */}
      {context === 'project' && (
        <div className="px-3 pb-3">
          <Link
            to="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-txt-secondary hover:bg-white/60 hover:text-txt-primary transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            {!collapsed && <span className="text-sm">帮助中心</span>}
          </Link>
        </div>
      )}
    </aside>
  );
}
