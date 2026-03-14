import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { listEpisodes, createEpisode, deleteEpisode } from '../api/episodes';
import { getProject } from '../api/projects';
import type { Episode, Project } from '../api/types';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import { StatusDot } from '../components/StatusBadge';
import {
  Plus,
  FileText,
  Eye,
  Trash2,
  Loader2,
  BookOpen,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ToastData { type: 'success' | 'error'; message: string }

export default function EpisodeManagement() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') as 'script' | 'storyboard' | null;

  const [project, setProject] = useState<Project | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [redirected, setRedirected] = useState(false);

  const showToast = useCallback((type: ToastData['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchEpisodes = (projectId: number) =>
    listEpisodes(projectId)
      .then((res) => setEpisodes(res.data))
      .catch(() => setEpisodes([]));

  useEffect(() => {
    if (!id) return;
    const projectId = Number(id);
    getProject(projectId)
      .then((res) => {
        setProject(res.data);
        return fetchEpisodes(projectId);
      })
      .catch(() => {
        // Backend unavailable — use a placeholder project so page still renders
        setProject({ id: projectId, title: '本地项目', description: '', genre: '', visual_style: '', status: 'draft' });
        showToast('error', '后端服务不可用，使用本地模式');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-redirect to first episode's editor when mode is specified and episodes exist
  useEffect(() => {
    if (loading || redirected || !mode || episodes.length === 0 || !id) return;
    const firstEp = episodes[0];
    const suffix = mode === 'script' ? 'script' : 'storyboard';
    setRedirected(true);
    navigate(`/projects/${id}/episodes/${firstEp.id}/${suffix}`, { replace: true });
  }, [loading, redirected, mode, episodes, id, navigate]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !id) return;
    const newEp: Episode = {
      id: -(episodes.length + 1),
      project_id: Number(id),
      title: newTitle,
      episode_number: episodes.length + 1,
      status: 'draft',
      script_content: '',
      panel_count: 0,
    };
    try {
      const res = await createEpisode(Number(id), {
        title: newTitle,
        episode_number: episodes.length + 1,
      });
      setEpisodes(prev => [...prev, res.data]);
    } catch {
      // API unavailable — create locally
      setEpisodes(prev => [...prev, newEp]);
      showToast('error', '后端不可用，剧集已创建在本地');
    }
    setShowCreate(false);
    setNewTitle('');
    setNewSynopsis('');
  };

  const handleDelete = async (episodeId: number) => {
    if (!id) return;
    const confirmed = window.confirm('确定要删除这个剧集吗？此操作不可撤销。');
    if (!confirmed) return;
    try {
      await deleteEpisode(episodeId);
    } catch {
      // API unavailable — delete locally anyway
    }
    setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
  };

  if (loading) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout layout="sidebar" sidebarContext="project">
        <div className="flex flex-col items-center justify-center py-32 text-txt-secondary">
          <p>项目未找到</p>
          <Link to="/projects" className="text-accent mt-2 hover:underline">
            返回项目列表
          </Link>
        </div>
      </AppLayout>
    );
  }

  const totalEpisodes = episodes.length;
  const completedCount = episodes.filter((ep) => ep.status === 'completed').length;
  const inProgressCount = episodes.filter((ep) => ep.status === 'in_progress').length;
  const totalPanels = episodes.reduce((sum, ep) => sum + (ep.panel_count ?? 0), 0);

  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in ${
          toast.type === 'success' ? 'bg-status-completed text-white' : 'bg-status-failed text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 p-0.5 hover:bg-white/20 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div className="p-6 flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* Create episode modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.08)] animate-scale-in">
            <h2 className="text-heading text-txt-primary mb-4">新建剧集</h2>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="输入剧集标题..."
              className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <textarea
              value={newSynopsis}
              onChange={(e) => setNewSynopsis(e.target.value)}
              placeholder="输入剧集简介（可选）..."
              rows={3}
              className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none mt-3 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setNewTitle('');
                  setNewSynopsis('');
                }}
              >
                取消
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + Title */}
      <PageHeader
        breadcrumbs={[
          { label: '项目', to: '/projects' },
          { label: project.title, to: `/projects/${id}` },
          { label: mode === 'script' ? '剧本编辑器' : mode === 'storyboard' ? '分镜编辑器' : '剧集管理' },
        ]}
        title={mode === 'script' ? '剧本编辑器 — 选择剧集' : mode === 'storyboard' ? '分镜编辑器 — 选择剧集' : '剧集管理'}
        tags={
          <span className="px-3 py-1 bg-accent-light text-accent text-xs font-medium rounded-lg border border-accent/20">
            共 {totalEpisodes} 集
          </span>
        }
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreate(true)}
          >
            新建剧集
          </Button>
        }
      />

      {/* Compact inline stats bar */}
      <div className="-mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 px-2 py-3 text-[13px] text-txt-secondary">
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-txt-primary">{totalEpisodes}</span>
          <span>总集数</span>
        </span>
        <span className="text-bdr">·</span>
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-txt-primary">{completedCount}</span>
          <span>已完成</span>
        </span>
        <span className="text-bdr">·</span>
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-txt-primary">{inProgressCount}</span>
          <span>进行中</span>
        </span>
        <span className="text-bdr">·</span>
        <span className="flex items-center gap-1.5">
          <span className="font-medium text-txt-primary">{totalPanels}</span>
          <span>面板</span>
        </span>
      </div>

      {/* Episode table */}
      <Card className="p-0 overflow-hidden mt-4">
        <div className="px-6 py-5 border-b border-bdr">
          <h2 className="text-xl font-semibold text-txt-primary">剧集列表</h2>
        </div>
        <div className="overflow-x-auto">
          {episodes.length === 0 ? (
            <div className="px-6 py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center text-accent mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <p className="text-lg font-semibold text-txt-primary">暂无剧集</p>
              <p className="text-sm text-txt-secondary mt-1">
                {mode ? '创建剧集后即可进入编辑器' : '创建你的第一个剧集'}
              </p>
              <Button
                variant="primary"
                className="mt-6"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreate(true)}
              >
                新建剧集
              </Button>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-bdr">
                  <th className="px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    #
                  </th>
                  <th className="px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    名称
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    简介
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    面板数
                  </th>
                  <th className="px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    状态
                  </th>
                  <th className="px-6 py-4 font-medium text-txt-muted uppercase text-[11px] tracking-wide">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {episodes.map((ep) => (
                  <tr
                    key={ep.id}
                    className="border-b border-bdr hover:bg-surface-subtle transition-colors"
                  >
                    <td className="px-6 py-4 text-txt-secondary">
                      {String(ep.episode_number).padStart(2, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-txt-primary">{ep.title}</td>
                    <td className="hidden md:table-cell px-6 py-4 text-txt-secondary max-w-[240px]">
                      <span className="line-clamp-1">{ep.synopsis || '—'}</span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-txt-secondary">
                      {ep.panel_count ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusDot status={ep.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/projects/${id}/episodes/${ep.id}/script`}
                          className={`p-2 rounded-lg transition-colors ${
                            mode === 'script'
                              ? 'bg-accent-light text-accent hover:bg-accent/20'
                              : 'hover:bg-surface-subtle text-txt-muted hover:text-accent'
                          }`}
                          title="剧本编辑器"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/projects/${id}/episodes/${ep.id}/storyboard`}
                          className={`p-2 rounded-lg transition-colors ${
                            mode === 'storyboard'
                              ? 'bg-accent-light text-accent hover:bg-accent/20'
                              : 'hover:bg-surface-subtle text-txt-muted hover:text-accent'
                          }`}
                          title="分镜编辑器"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(ep.id)}
                          className="p-2 hover:bg-status-failed/10 rounded-lg text-txt-muted hover:text-status-failed transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
      </div>
    </AppLayout>
  );
}
