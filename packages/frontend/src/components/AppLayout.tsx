import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Settings, Bell, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  layout?: 'sidebar' | 'header-sidebar' | 'header-only' | 'split';
  sidebarContext?: 'home' | 'project' | 'editor';
}

export default function AppLayout({
  children,
  layout = 'sidebar',
  sidebarContext = 'home',
}: AppLayoutProps) {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (layout === 'header-only' || layout === 'split') {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-canvas">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-bdr bg-white px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-txt-primary text-sm hidden sm:inline">漫剧工坊</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted w-4 h-4 pointer-events-none" />
              <input
                className="bg-surface-subtle border-none rounded-xl pl-9 pr-4 py-2 text-sm w-56 focus:ring-1 focus:ring-accent outline-none text-txt-primary placeholder:text-txt-muted"
                type="text"
                placeholder="搜索..."
                aria-label="全局搜索"
              />
            </div>
            <button className="flex items-center justify-center rounded-full h-10 w-10 hover:bg-surface-subtle relative transition-colors">
              <Bell className="w-5 h-5 text-txt-secondary" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-status-failed rounded-full" />
            </button>
            <div className="h-10 w-10 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-accent font-medium text-xs">
              SY
            </div>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    );
  }

  if (layout === 'header-sidebar') {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-canvas">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-bdr bg-white px-6 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-surface-subtle text-txt-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-txt-primary text-sm hidden sm:inline">漫剧工坊</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted w-4 h-4 pointer-events-none" />
              <input
                className="bg-surface-subtle border-none rounded-xl pl-9 pr-4 py-2 text-sm w-56 focus:ring-1 focus:ring-accent outline-none text-txt-primary placeholder:text-txt-muted"
                type="text"
                placeholder="搜索..."
                aria-label="全局搜索"
              />
            </div>
            <button className="flex items-center justify-center rounded-full h-10 w-10 hover:bg-surface-subtle relative transition-colors">
              <Settings className="w-5 h-5 text-txt-secondary" />
            </button>
            <button className="flex items-center justify-center rounded-full h-10 w-10 hover:bg-surface-subtle relative transition-colors">
              <Bell className="w-5 h-5 text-txt-secondary" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-status-failed rounded-full" />
            </button>
            <div className="h-10 w-10 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-accent font-medium text-xs">
              SY
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-64 flex-col p-4 gap-2 bg-canvas flex-shrink-0">
            <SidebarNav context={sidebarContext} projectId={id} />
          </aside>
          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute inset-0 bg-[#1A1A1A]/30" />
              <aside
                className="absolute left-0 top-0 h-full w-64 bg-canvas p-4 space-y-2"
                onClick={(e) => e.stopPropagation()}
              >
                <SidebarNav context={sidebarContext} projectId={id} />
              </aside>
            </div>
          )}
          <main className="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Default: sidebar layout
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-full bg-white hover:bg-surface-subtle text-txt-secondary"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-[#1A1A1A]/30" />
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar
              context={sidebarContext}
              projectId={id}
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          context={sidebarContext}
          projectId={id}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto bg-canvas">
        {children}
      </main>
    </div>
  );
}

/* Inline sidebar nav used in header-sidebar layout */
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Warehouse,
  Users,
  HelpCircle,
} from 'lucide-react';

function SidebarNav({
  projectId,
}: {
  context: string;
  projectId?: string;
}) {
  const location = useLocation();
  const base = `/projects/${projectId}`;

  const items = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: '概览', to: base },
    { icon: <Film className="w-5 h-5" />, label: '剧集管理', to: `${base}/episodes` },
    { icon: <Warehouse className="w-5 h-5" />, label: '资产仓库', to: `${base}/assets` },
    { icon: <Users className="w-5 h-5" />, label: '团队协作', to: `${base}/team` },
  ];

  return (
    <>
      {items.map((item, i) => {
        const isActive =
          location.pathname === item.to ||
          (item.to !== base && location.pathname.startsWith(item.to));
        return (
          <Link
            key={i}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm ${
              isActive
                ? 'bg-white text-accent font-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                : 'text-txt-secondary hover:bg-white/60 hover:text-txt-primary'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
      <div className="flex-1" />
      <Link
        to="/help"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-txt-secondary hover:bg-white/60 hover:text-txt-primary transition-colors text-sm mt-auto"
      >
        <HelpCircle className="w-5 h-5" />
        帮助中心
      </Link>
    </>
  );
}
