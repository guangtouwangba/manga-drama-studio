import { useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import type { PhaseStatus } from './Sidebar';
import { Search, Settings, Bell, Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  layout?: 'sidebar' | 'header-only' | 'split';
  sidebarContext?: 'home' | 'project' | 'editor';
  /** Pipeline phase statuses forwarded to the sidebar. */
  phaseStatuses?: Record<string, PhaseStatus>;
}

export default function AppLayout({
  children,
  layout = 'sidebar',
  sidebarContext = 'home',
  phaseStatuses,
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

  // Default: sidebar layout — used by all pages with navigation
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
              phaseStatuses={phaseStatuses}
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
          phaseStatuses={phaseStatuses}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto bg-canvas">
        {children}
      </main>
    </div>
  );
}
