import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import type { Project, Episode, ActivityEvent } from '../api/types';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import Button from '../components/Button';
import { StatusDot } from '../components/StatusBadge';
import {
  Plus,
  Settings,
  Brush,
  Zap,
  Server,
  FileText,
  Eye,
  ClipboardCheck,
  Loader2,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

/* ---------- mock data ---------- */
const MOCK_EPISODES: Episode[] = [
  { id: 1, project_id: 1, episode_number: 1, title: '黎明之刃', status: 'completed', panel_count: 24 },
  { id: 2, project_id: 1, episode_number: 2, title: '暗影降临', status: 'completed', panel_count: 18 },
  { id: 3, project_id: 1, episode_number: 3, title: '试炼之路', status: 'in_progress', panel_count: 12 },
  { id: 4, project_id: 1, episode_number: 4, title: '觉醒之刻', status: 'not_started', panel_count: 0 },
  { id: 5, project_id: 1, episode_number: 5, title: '命运交汇', status: 'not_started', panel_count: 0 },
];

const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: '1', type: 'pipeline', title: 'EP03 分镜生成完成', description: '12 个面板全部生成', timestamp: '2分钟前' },
  { id: '2', type: 'approval', title: 'EP02 审核通过', description: '已进入发布队列', timestamp: '1小时前' },
  { id: '3', type: 'upload', title: '新角色资产上传', description: '凌风 - 战斗形态', timestamp: '3小时前' },
  { id: '4', type: 'warning', title: '预算使用提醒', description: '已使用 78% 预算额度', timestamp: '昨天' },
];

const activityIcons: Record<string, { icon: typeof Zap; color: string }> = {
  pipeline: { icon: Zap, color: 'bg-accent text-white' },
  approval: { icon: CheckCircle2, color: 'bg-status-completed text-white' },
  upload: { icon: Upload, color: 'bg-surface-subtle text-txt-muted' },
  warning: { icon: AlertTriangle, color: 'bg-status-waiting text-white' },
};

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then((res) => setProject(res.data))
      .catch(() => {
        setProject({
          id: Number(id),
          title: '仙玄纪元',
          description: '修仙世界的冒险旅程',
          genre: '仙侠',
          visual_style: 'anime',
          status: 'in_progress',
          global_style: '',
          progress: 68,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout layout="header-sidebar" sidebarContext="project">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout layout="header-sidebar" sidebarContext="project">
        <div className="flex flex-col items-center justify-center py-32 text-txt-secondary">
          <p>项目未找到</p>
          <Link to="/projects" className="text-accent mt-2 hover:underline">
            返回项目列表
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout layout="header-sidebar" sidebarContext="project">
      {/* Breadcrumb + Title */}
      <PageHeader
        breadcrumbs={[
          { label: '项目', to: '/projects' },
          { label: project.title },
        ]}
        title={project.title}
        tags={
          <>
            <span className="px-3 py-1 bg-accent-light text-accent text-xs font-bold rounded-lg border border-accent/20 uppercase tracking-wider">
              {project.genre || '仙侠'}
            </span>
            <span className="px-3 py-1 bg-status-completed/10 text-status-completed text-xs font-bold rounded-lg border border-status-completed/20">
              活跃
            </span>
            <span className="text-txt-muted text-sm">EP 05</span>
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              icon={<Settings className="w-4 h-4" />}
              onClick={() => navigate(`/projects/${id}/setup`)}
            >
              项目设置
            </Button>
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              新建剧集
            </Button>
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="已发布剧集"
          value="2"
          subtitle="共 5 集"
          trend={{ value: '+1', positive: true }}
        />
        <StatCard label="总面板数" value="98" subtitle="生成中" />
        <StatCard
          label="预算消耗"
          value="$124"
          subtitle="/ $200"
          progress={62}
        />
        <StatCard label="整体进度" value="68%" progress={68} />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-4">
        <QuickActionCard
          icon={<Brush className="w-6 h-6" />}
          iconBg="bg-accent-light text-accent group-hover:bg-accent group-hover:text-white"
          title="资产编辑器"
          desc="管理角色与场景"
          onClick={() => navigate(`/projects/${id}/assets`)}
        />
        <QuickActionCard
          icon={<Zap className="w-6 h-6" />}
          iconBg="bg-status-waiting/10 text-status-waiting group-hover:bg-status-waiting group-hover:text-white"
          title="流水线监控"
          desc="查看任务状态"
        />
        <QuickActionCard
          icon={<Server className="w-6 h-6" />}
          iconBg="bg-accent-light text-accent group-hover:bg-accent group-hover:text-white"
          title="模型配置"
          desc="AI 服务设置"
          onClick={() => navigate(`/projects/${id}/setup`)}
        />
      </div>

      {/* Two-column: Episode table + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Episode table */}
        <div className="xl:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-bdr">
              <h2 className="text-lg font-bold text-txt-primary">剧集列表</h2>
              <button className="text-sm text-accent hover:underline">查看全部</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bdr">
                    <th className="px-6 py-4 font-bold text-txt-muted uppercase text-xs">#</th>
                    <th className="px-6 py-4 font-bold text-txt-muted uppercase text-xs">名称</th>
                    <th className="px-6 py-4 font-bold text-txt-muted uppercase text-xs">面板</th>
                    <th className="px-6 py-4 font-bold text-txt-muted uppercase text-xs">状态</th>
                    <th className="px-6 py-4 font-bold text-txt-muted uppercase text-xs">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_EPISODES.map((ep) => (
                    <tr
                      key={ep.id}
                      className="border-b border-bdr hover:bg-surface-subtle transition-colors"
                    >
                      <td className="px-6 py-4 text-txt-secondary">{String(ep.episode_number).padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-medium text-txt-primary">{ep.title}</td>
                      <td className="px-6 py-4 text-txt-secondary">{ep.panel_count}</td>
                      <td className="px-6 py-4">
                        <StatusDot status={ep.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/projects/${id}/episodes/${ep.id}/script`}
                            className="p-2 hover:bg-surface-subtle rounded-lg text-txt-muted hover:text-accent transition-colors"
                            title="剧本"
                          >
                            <FileText className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/projects/${id}/episodes/${ep.id}/storyboard`}
                            className="p-2 hover:bg-surface-subtle rounded-lg text-txt-muted hover:text-accent transition-colors"
                            title="分镜"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            className="p-2 hover:bg-surface-subtle rounded-lg text-txt-muted hover:text-accent transition-colors"
                            title="审核"
                          >
                            <ClipboardCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <div className="xl:col-span-1">
          <Card className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-bdr">
              <h2 className="text-lg font-bold text-txt-primary">近期动态</h2>
            </div>
            <div className="p-6 space-y-6">
              {MOCK_ACTIVITY.map((event, i) => {
                const cfg = activityIcons[event.type] || activityIcons.pipeline;
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className="flex gap-4 relative">
                    {i < MOCK_ACTIVITY.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-bdr" />
                    )}
                    <div
                      className={`w-6 h-6 rounded-full ${cfg.color} flex items-center justify-center z-10 shrink-0`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-bold text-txt-primary">{event.title}</p>
                      <p className="text-xs text-txt-muted">
                        {event.description} &middot; {event.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 pb-4">
              <button className="w-full py-2.5 bg-surface-subtle hover:bg-bdr text-sm font-bold rounded-lg transition-colors text-txt-secondary">
                查看全部流水线记录
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function QuickActionCard({
  icon,
  iconBg,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 min-w-[200px] items-center gap-4 p-4 rounded-[24px] bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] group transition-all cursor-pointer"
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${iconBg}`}
      >
        {icon}
      </div>
      <div className="text-left">
        <p className="font-bold text-sm text-txt-primary">{title}</p>
        <p className="text-xs text-txt-muted">{desc}</p>
      </div>
    </button>
  );
}
