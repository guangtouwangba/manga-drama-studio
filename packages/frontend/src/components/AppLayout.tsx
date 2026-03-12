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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-main-surface">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-background-dark px-6 py-3 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:inline">Manga Drama Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                className="bg-slate-900 border-none rounded-lg pl-9 pr-4 py-2 text-sm w-56 focus:ring-1 focus:ring-primary outline-none text-slate-200 placeholder-slate-500"
                type="text"
                placeholder="搜索..."
                aria-label="全局搜索"
              />
            </div>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-800 hover:bg-slate-700 relative transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark" />
            </button>
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
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
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-main-surface">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-background-dark px-6 py-3 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:inline">项目仪表盘</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
              <input
                className="bg-slate-900 border-none rounded-lg pl-9 pr-4 py-2 text-sm w-56 focus:ring-1 focus:ring-primary outline-none text-slate-200 placeholder-slate-500"
                type="text"
                placeholder="搜索..."
                aria-label="全局搜索"
              />
            </div>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-800 hover:bg-slate-700 relative transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-800 hover:bg-slate-700 relative transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark" />
            </button>
            <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
              SY
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 p-4 gap-2 bg-background-dark flex-shrink-0">
            <SidebarNav context={sidebarContext} projectId={id} />
          </aside>
          {/* Mobile sidebar overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute inset-0 bg-black/60" />
              <aside
                className="absolute left-0 top-0 h-full w-64 bg-background-dark border-r border-slate-800 p-4 space-y-2"
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
    <div className="flex h-screen overflow-hidden bg-main-surface">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
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

      <main className="flex-1 flex flex-col overflow-y-auto bg-main-surface">
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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-slate-400 hover:bg-slate-800'
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
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors text-sm mt-auto"
      >
        <HelpCircle className="w-5 h-5" />
        帮助中心
      </Link>
    </>
  );
}
