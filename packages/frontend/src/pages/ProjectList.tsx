import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProjects, createProject } from '../api/projects';
import type { Project } from '../api/types';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import {
  Plus,
  Calendar,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';

/* ---- mock data for when API is unavailable ---- */
const MOCK_PROJECTS: (Project & { cover_image_url: string; progress: number })[] = [
  {
    id: 1,
    title: '仙玄纪元',
    description: '修仙世界的冒险旅程',
    genre: '仙侠',
    visual_style: 'anime',
    status: 'in_progress',
    global_style: '',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop',
    progress: 68,
    updated_at: '2025-12-15',
  },
  {
    id: 2,
    title: '都市猎人',
    description: '现代都市传奇故事',
    genre: '都市',
    visual_style: 'realistic',
    status: 'published',
    global_style: '',
    cover_image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=250&fit=crop',
    progress: 100,
    updated_at: '2025-11-20',
  },
  {
    id: 3,
    title: '机械黎明',
    description: '赛博朋克末日世界',
    genre: '科幻',
    visual_style: 'cyberpunk',
    status: 'draft',
    global_style: '',
    cover_image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aede?w=400&h=250&fit=crop',
    progress: 25,
    updated_at: '2026-01-08',
  },
  {
    id: 4,
    title: '武道至尊',
    description: '热血武侠的巅峰对决',
    genre: '武侠',
    visual_style: 'ink',
    status: 'in_progress',
    global_style: '',
    cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=250&fit=crop',
    progress: 42,
    updated_at: '2026-02-10',
  },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'bg-amber-500/90' },
  in_progress: { label: '进行中', color: 'bg-primary/90' },
  published: { label: '已发布', color: 'bg-emerald-500/90' },
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    listProjects()
      .then((res) => {
        setProjects(res.data.length > 0 ? res.data : MOCK_PROJECTS);
      })
      .catch(() => {
        setProjects(MOCK_PROJECTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const res = await createProject({ title: newTitle });
      if (res.data.id != null) {
        navigate(`/projects/${res.data.id}`);
      }
    } catch {
      // API unavailable — stay on dialog
    }
    setNewTitle('');
    setShowCreate(false);
  };

  return (
    <AppLayout layout="sidebar" sidebarContext="home">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-main-surface/80 backdrop-blur-md px-8 py-6 border-b border-slate-800/50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">我的项目</h1>
            <p className="text-slate-400 text-sm mt-1">管理和创建你的漫画作品集</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreate(true)}
          >
            新建项目
          </Button>
        </div>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-background-dark border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">创建新项目</h2>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="输入项目名称..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-8 pb-12 pt-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Plus className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold text-white">还没有项目</p>
            <p className="text-sm text-slate-400 mt-1">创建你的第一个 AI 漫画项目</p>
            <Button
              variant="primary"
              className="mt-6"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreate(true)}
            >
              创建新项目
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
            {/* Placeholder card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[340px]"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7" />
              </div>
              <p className="mt-4 font-bold text-white">创建新项目</p>
              <p className="text-xs text-slate-400 mt-1 text-center">
                使用 AI 开始你的分镜创作
              </p>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const p = project as Project & { cover_image_url?: string; progress?: number };
  const progress = p.progress ?? 0;
  const cover = p.cover_image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=250&fit=crop';
  const sts = statusLabels[p.status] || statusLabels.draft;

  return (
    <Link
      to={`/projects/${p.id}`}
      className="group bg-background-dark rounded-xl border border-slate-800 overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 block"
    >
      {/* Image header */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${cover})` }}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {p.genre && (
            <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
              {p.genre}
            </span>
          )}
          <span
            className={`${sts.color} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter`}
          >
            {sts.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
          {p.title}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>制作进度</span>
            <span className="font-bold text-slate-200">{progress}%</span>
          </div>
          <ProgressBar percent={progress} />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{p.updated_at?.slice(0, 10) || '2026-01-01'}</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
