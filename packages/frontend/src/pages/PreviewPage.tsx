import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProject } from '../api/projects';
import type { Project } from '../api/types';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import {
  Play,
  Download,
  Share2,
  RefreshCw,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Film,
  Loader2,
  Pause,
} from 'lucide-react';

/* Demo data — will be replaced with real API responses */
const QA_ITEMS = [
  { label: '技术检查', score: 95 },
  { label: '视觉一致性', score: 88 },
  { label: '叙事连贯', score: 92 },
];

const STATS = [
  { label: '总耗时', value: '12分34秒', icon: Clock },
  { label: '总花费', value: '$3.42', icon: DollarSign },
  { label: '面板数', value: '24', icon: Layers },
  { label: '视频时长', value: '1分52秒', icon: Film },
];

export default function PreviewPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime] = useState(102); // 1:42 in seconds
  const totalTime = 112; // 1:52 in seconds

  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then((res) => setProject(res.data))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleAction = () => {
    alert('功能开发中');
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

  const progressPercent = Math.round((currentTime / totalTime) * 100);

  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      <div className="p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        <PageHeader
          breadcrumbs={[
            { label: '项目', to: '/projects' },
            { label: project.title, to: `/projects/${id}` },
            { label: '成片预览' },
          ]}
          title={`${project.title}  ·  EP01`}
          subtitle="成片预览与导出"
        />

        {/* Video Player */}
        <Card className="p-0 overflow-hidden">
          <div className="relative aspect-video bg-[#1A1A1A] flex items-center justify-center">
            {/* Placeholder frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a2a2a] to-[#1A1A1A]" />

            {/* Center play/pause button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all group"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-7 h-7 text-white ml-1 group-hover:scale-110 transition-transform" />
              )}
            </button>

            {/* Bottom controls overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10">
              {/* Timeline bar */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3 cursor-pointer group">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300 group-hover:bg-accent"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-white/70 text-xs">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalTime)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* QA Report */}
        <div>
          <h2 className="text-[15px] font-semibold text-txt-primary mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-completed" />
            质检报告
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QA_ITEMS.map((item) => (
              <Card key={item.label} variant="stat" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-txt-secondary">{item.label}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-status-completed/10 text-status-completed text-xs font-medium rounded-lg border border-status-completed/20">
                    <CheckCircle2 className="w-3 h-3" />
                    合格
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-semibold text-txt-primary">{item.score}</span>
                  <span className="text-sm text-txt-muted mb-0.5">/ 100</span>
                </div>
                <div className="h-1.5 w-full bg-surface-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full bg-status-completed rounded-full transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Production Stats */}
        <div>
          <h2 className="text-[15px] font-semibold text-txt-primary mb-3">
            生产统计
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} variant="stat" className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-subtle flex-shrink-0">
                    <Icon className="w-5 h-5 text-txt-muted" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-txt-muted">{stat.label}</p>
                    <p className="text-lg font-semibold text-txt-primary mt-0.5 truncate">
                      {stat.value}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-bdr">
          <Button
            variant="ghost"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleAction}
          >
            重新生成
          </Button>
          <div className="flex-1" />
          <Button
            variant="secondary"
            icon={<Share2 className="w-4 h-4" />}
            onClick={handleAction}
          >
            发布
          </Button>
          <Button
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleAction}
          >
            导出MP4
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
