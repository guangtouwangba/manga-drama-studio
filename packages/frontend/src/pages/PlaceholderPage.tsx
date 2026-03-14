/**
 * PlaceholderPage.tsx
 * Generic under-construction page for routes that are not yet implemented.
 *
 * Usage:
 *   <Route path="/settings" element={<PlaceholderPage title="设置" />} />
 *   <Route path="/projects/:id/team" element={<PlaceholderPage title="团队协作" sidebarContext="project" />} />
 */

import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  sidebarContext?: 'home' | 'project';
}

export default function PlaceholderPage({ title, sidebarContext = 'home' }: PlaceholderPageProps) {
  return (
    <AppLayout
      layout="sidebar"
      sidebarContext={sidebarContext}
    >
      <div className="flex flex-col items-center justify-center py-32 px-6 text-txt-secondary">
        <Construction className="w-12 h-12 text-txt-muted mb-4" />
        <h1 className="text-xl font-semibold text-txt-primary mb-2">{title}</h1>
        <p className="text-sm">该功能正在开发中，敬请期待</p>
        <Link to="/projects" className="text-accent mt-4 hover:underline text-sm">
          返回项目列表
        </Link>
      </div>
    </AppLayout>
  );
}
