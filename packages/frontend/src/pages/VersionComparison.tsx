import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import type { PanelVersion } from '../api/types';
import { getProject } from '../api/projects';
import { getCandidates } from '../api/generation';
import {
  Film,
  Star,
  Plus,
  Maximize2,
  Clock,
  Cpu,
  Save,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

// Fallback demo versions shown when the API is unavailable
const FALLBACK_VERSIONS: PanelVersion[] = [
  {
    id: 1,
    panel_id: 0,
    version_number: 1,
    label: '原始概念',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=340&fit=crop',
    prompt: 'epic wide shot, young swordsman standing on mountain peak at dawn, flowing robes, cinematic lighting, anime style',
    model_used: 'Flux Pro v1.1',
    inference_time: 12.4,
    created_at: '2026-03-10 14:20',
    is_latest: false,
  },
  {
    id: 2,
    panel_id: 0,
    version_number: 2,
    label: '构图优化',
    image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=340&fit=crop',
    prompt: 'epic wide shot, young swordsman standing on mountain peak at dawn, flowing robes, cinematic lighting, anime style, rule of thirds composition',
    model_used: 'Flux Pro v1.1',
    inference_time: 11.8,
    created_at: '2026-03-10 15:45',
    is_latest: false,
  },
  {
    id: 3,
    panel_id: 0,
    version_number: 3,
    label: '光影增强',
    image_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aede?w=600&h=340&fit=crop',
    prompt: 'epic wide shot, young swordsman standing on mountain peak at dawn, flowing robes, dramatic rim lighting, volumetric fog, anime style, rule of thirds composition, golden hour atmosphere',
    model_used: 'Flux Pro v1.2',
    inference_time: 14.2,
    created_at: '2026-03-11 09:30',
    is_latest: true,
  },
];

export default function VersionComparison() {
  const { id, eid, panelId } = useParams();
  const [projectTitle, setProjectTitle] = useState('');
  const [versions, setVersions] = useState<PanelVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState(false);
  const [viewMode, setViewMode] = useState('side-by-side');
  const [compareVersions, setCompareVersions] = useState<[number, number]>([1, 3]);
  const [selectedFinal, setSelectedFinal] = useState<number | null>(null);
  const [finalConfirmed, setFinalConfirmed] = useState(false);

  // Fetch project title
  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then(res => setProjectTitle(res.data.title))
      .catch(() => {});
  }, [id]);

  // Fetch real candidates; fall back to demo data if unavailable
  useEffect(() => {
    if (!panelId) {
      setVersions(FALLBACK_VERSIONS);
      setVersionsLoading(false);
      return;
    }
    getCandidates(Number(panelId))
      .then((res) => {
        const data = res.data as PanelVersion[];
        if (data && data.length > 0) {
          setVersions(data);
          // Default compare: first and last versions
          const nums = data.map((v) => v.version_number).sort((a, b) => a - b);
          setCompareVersions([nums[0], nums[nums.length - 1]]);
          // Pre-select latest if available
          const latest = data.find((v) => v.is_latest);
          if (latest) setSelectedFinal(latest.version_number);
        } else {
          setVersions(FALLBACK_VERSIONS);
          setCompareVersions([1, 3]);
          setSelectedFinal(3);
        }
      })
      .catch(() => {
        setVersionsError(true);
        setVersions(FALLBACK_VERSIONS);
        setCompareVersions([1, 3]);
        setSelectedFinal(3);
      })
      .finally(() => setVersionsLoading(false));
  }, [panelId]);

  const handleSelectFinal = (versionNumber: number) => {
    setSelectedFinal(versionNumber);
    setFinalConfirmed(false);
  };

  const handleConfirmFinal = () => {
    setFinalConfirmed(true);
    // Persist to backend here in a real implementation
    setTimeout(() => setFinalConfirmed(false), 3000);
  };

  const leftVersion = versions.find((v) => v.version_number === compareVersions[0]) ?? versions[0];
  const rightVersion = versions.find((v) => v.version_number === compareVersions[1]) ?? versions[versions.length - 1];

  // Loading state for versions fetch
  if (versionsLoading) {
    return (
      <AppLayout layout="split">
        <TopNav id={id} eid={eid} projectTitle={projectTitle} />
        <div className="flex-1 flex items-center justify-center bg-canvas">
          <div className="flex flex-col items-center gap-3 text-txt-muted">
            <Loader2 className="w-8 h-8 text-accent animate-spin" aria-hidden="true" />
            <p className="text-sm">加载版本数据中…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty state (no versions at all)
  if (versions.length === 0) {
    return (
      <AppLayout layout="split">
        <TopNav id={id} eid={eid} projectTitle={projectTitle} />
        <div className="flex-1 flex items-center justify-center bg-canvas">
          <div className="flex flex-col items-center gap-3 text-txt-muted text-center px-6">
            <span className="text-3xl" aria-hidden="true">🖼</span>
            <p className="text-base font-medium text-txt-secondary">暂无候选版本</p>
            <p className="text-sm max-w-xs">AI 生成完成后，版本数据将自动出现在此处</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout layout="split">
      {/* Top navigation */}
      <TopNav id={id} eid={eid} projectTitle={projectTitle} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-canvas">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-txt-muted" aria-label="面包屑导航">
            <Link to={`/projects/${id}`} className="hover:text-accent transition-colors">
              {projectTitle || '项目'}
            </Link>
            {' / '}
            <span className="text-txt-primary font-medium">
              面板 {panelId} 版本对比
            </span>
          </nav>

          {/* Error notice (API failed, showing demo data) */}
          {versionsError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-status-waiting/10 border border-status-waiting/30 rounded-xl text-sm text-status-waiting">
              <span aria-hidden="true">⚠</span>
              API 暂不可用，当前显示演示数据
            </div>
          )}

          {/* Confirm toast */}
          {finalConfirmed && (
            <div
              role="status"
              aria-live="polite"
              className="animate-scale-in flex items-center gap-2 px-4 py-3 bg-status-completed/10 border border-status-completed/30 rounded-xl text-sm text-status-completed"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              已选定最终版本 V{selectedFinal}
            </div>
          )}

          {/* Title section */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-display-lg text-txt-primary font-display">
                版本迭代对比
              </h1>
              <p className="text-txt-secondary mt-1 max-w-2xl">
                对比不同版本的生成结果，选择最佳版本作为最终输出
              </p>
            </div>
            <Tabs
              tabs={[
                { id: 'side-by-side', label: '并排对比' },
                { id: 'overlay', label: '叠加对比' },
              ]}
              activeId={viewMode}
              onChange={setViewMode}
              variant="toggle"
            />
          </div>

          {/* Comparison grid */}
          {leftVersion && rightVersion && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="animate-fade-in-up">
                <VersionCard
                  version={leftVersion}
                  isSelected={selectedFinal === leftVersion.version_number}
                  onSelect={() => handleSelectFinal(leftVersion.version_number)}
                  onConfirm={handleConfirmFinal}
                />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <VersionCard
                  version={rightVersion}
                  isSelected={selectedFinal === rightVersion.version_number}
                  onSelect={() => handleSelectFinal(rightVersion.version_number)}
                  onConfirm={handleConfirmFinal}
                />
              </div>
            </div>
          )}

          {/* Version history */}
          <div className="mt-12 border-t border-bdr pt-8">
            <h3 className="text-lg font-semibold text-txt-primary flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-txt-muted" aria-hidden="true" />
              版本历史
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4" role="listbox" aria-label="选择对比版本">
              {versions.map((v) => (
                <button
                  key={v.id}
                  role="option"
                  aria-selected={compareVersions.includes(v.version_number)}
                  aria-label={`V${v.version_number} ${v.label}`}
                  onClick={() => {
                    // Cycle: if already in left slot, move to right; else replace left
                    if (compareVersions[0] === v.version_number) {
                      setCompareVersions([compareVersions[1], v.version_number]);
                    } else if (compareVersions[1] === v.version_number) {
                      // no-op when clicking already-selected right
                    } else {
                      setCompareVersions([v.version_number, compareVersions[1]]);
                    }
                  }}
                  className={`min-w-[120px] aspect-[4/3] rounded-lg flex flex-col items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    compareVersions.includes(v.version_number)
                      ? 'border-2 border-accent bg-accent-light'
                      : 'bg-surface-subtle hover:bg-accent-light/50 border border-transparent'
                  }`}
                >
                  <span
                    className={`text-sm font-bold uppercase ${
                      compareVersions.includes(v.version_number) ? 'text-accent' : 'text-txt-secondary'
                    }`}
                  >
                    V{v.version_number}
                  </span>
                  <span className="text-[11px] text-txt-muted mt-1 line-clamp-1 px-2 text-center">
                    {v.label}
                  </span>
                </button>
              ))}
              <button
                className="min-w-[120px] aspect-[4/3] rounded-lg flex flex-col items-center justify-center border border-dashed border-bdr text-txt-muted hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="生成新版本"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
                <span className="text-[11px] mt-1">新版本</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

/* Extracted top nav bar for reuse in loading/empty states */
function TopNav({
  id,
  eid,
  projectTitle,
}: {
  id?: string;
  eid?: string;
  projectTitle: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-bdr px-4 py-2 bg-white flex-shrink-0">
      <nav className="flex items-center gap-3 text-sm text-txt-secondary min-w-0" aria-label="breadcrumb">
        {id && eid && (
          <Link
            to={`/projects/${id}/episodes/${eid}/storyboard`}
            className="flex items-center gap-1.5 text-txt-secondary hover:text-accent transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回分镜</span>
          </Link>
        )}
        <div className="h-4 w-px bg-bdr flex-shrink-0" />
        <span className="text-txt-primary font-medium truncate flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-accent" />
          版本对比
        </span>
      </nav>
      <div className="flex items-center gap-2">
        {id && eid && (
          <Link
            to={`/projects/${id}/episodes/${eid}/storyboard`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-txt-primary text-white text-sm font-medium rounded-lg transition-colors hover:bg-txt-primary/90"
            aria-label="保存并返回分镜编辑器"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            保存
          </Link>
        )}
        <div
          className="h-8 w-8 rounded-full bg-accent-light border border-accent/30 flex items-center justify-center text-accent font-medium text-[11px]"
          aria-label={`用户: ${projectTitle || '当前用户'}`}
        >
          SY
        </div>
      </div>
    </div>
  );
}

function VersionCard({
  version,
  isSelected,
  onSelect,
  onConfirm,
}: {
  version: PanelVersion;
  isSelected: boolean;
  onSelect: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl overflow-hidden transition-all ${
        version.is_latest ? 'ring-2 ring-accent/30' : 'border border-bdr'
      }`}
      aria-label={`版本 V${version.version_number}: ${version.label}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 relative ${
          version.is_latest ? 'bg-accent-light' : 'bg-surface-subtle'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 text-xs font-bold rounded ${
              version.is_latest ? 'bg-accent text-white' : 'bg-white text-txt-secondary border border-bdr'
            }`}
          >
            V{version.version_number}
          </span>
          <div>
            <p className="font-medium text-sm text-txt-primary">{version.label}</p>
            <p className="text-[11px] text-txt-muted">{version.created_at}</p>
          </div>
        </div>
        {version.is_latest && (
          <span className="absolute top-0 right-0 bg-accent text-white px-3 py-1 text-[11px] font-medium uppercase rounded-bl-lg">
            最新版本
          </span>
        )}
      </div>

      {/* Image */}
      <div className="aspect-video relative group">
        <img
          className="w-full h-full object-cover"
          src={version.image_url}
          alt={version.label}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-[#1A1A1A]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors"
            aria-label={`全屏查看 ${version.label}`}
          >
            <Maximize2 className="w-6 h-6 text-white" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Prompt */}
      <div className="p-4">
        <p className="text-[11px] font-medium text-txt-muted uppercase tracking-wide mb-2">
          AI 提示词
        </p>
        <div
          className={`p-4 rounded-lg text-sm leading-relaxed border ${
            version.is_latest
              ? 'bg-accent-light/50 border-accent/20 text-txt-primary'
              : 'bg-surface-subtle border-bdr text-txt-primary'
          }`}
        >
          {version.prompt}
        </div>
      </div>

      {/* Specs */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-txt-muted">
            <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{version.model_used}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-txt-muted">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{version.inference_time}s 推理时间</span>
          </div>
        </div>

        {/* Action: two-step select + confirm */}
        {isSelected ? (
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full bg-accent hover:bg-accent-dark"
              icon={<Star className="w-4 h-4" aria-hidden="true" />}
              onClick={onConfirm}
              aria-label={`确认选定 V${version.version_number} 为最终版本`}
            >
              确认为最终版本
            </Button>
            <p className="text-[11px] text-txt-muted text-center">点击确认以保存选择</p>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={onSelect}
            aria-label={`选择 V${version.version_number} 为最终版本`}
          >
            选为最终版本
          </Button>
        )}
      </div>
    </div>
  );
}
