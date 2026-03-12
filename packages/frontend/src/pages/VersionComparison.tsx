import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import type { PanelVersion } from '../api/types';
import {
  Film,
  Star,
  Plus,
  Maximize2,
  Clock,
  Cpu,
  Save,
} from 'lucide-react';

type VersionWithHighlights = PanelVersion & { promptHighlights?: string[] };

const MOCK_VERSIONS: VersionWithHighlights[] = [
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
    promptHighlights: ['dramatic rim lighting', 'volumetric fog', 'golden hour atmosphere'],
    model_used: 'Flux Pro v1.2',
    inference_time: 14.2,
    created_at: '2026-03-11 09:30',
    is_latest: true,
  },
];

export default function VersionComparison() {
  const { id, eid, panelId } = useParams();
  const [viewMode, setViewMode] = useState('side-by-side');
  const [compareVersions, setCompareVersions] = useState<[number, number]>([1, 3]);
  const [selectedFinal, setSelectedFinal] = useState<number | null>(3);

  const leftVersion = MOCK_VERSIONS.find((v) => v.version_number === compareVersions[0])!;
  const rightVersion = MOCK_VERSIONS.find((v) => v.version_number === compareVersions[1])!;

  return (
    <AppLayout layout="split">
      {/* Top navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-background-dark/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-white">分镜编辑器</span>
          </div>
          <nav className="hidden md:flex gap-1">
            {['项目', '素材库', '分镜编辑器', '版本对比'].map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  i === 3
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Save className="w-4 h-4" />}>
            保存
          </Button>
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-[10px]">
            SY
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-slate-400">
            <Link to={`/projects/${id}`} className="hover:text-primary transition-colors">
              仙玄纪元
            </Link>
            {' / '}
            <Link
              to={`/projects/${id}/episodes/${eid}/storyboard`}
              className="hover:text-primary transition-colors"
            >
              场景 4
            </Link>
            {' / '}
            <span className="text-slate-100 font-medium">面板 12 版本对比</span>
          </nav>

          {/* Title section */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                版本迭代对比
              </h1>
              <p className="text-slate-400 mt-1 max-w-2xl">
                对比不同版本的生成结果,选择最佳版本作为最终输出
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VersionCard
              version={leftVersion}
              isSelected={selectedFinal === leftVersion.version_number}
              onSelect={() => setSelectedFinal(leftVersion.version_number)}
            />
            <VersionCard
              version={rightVersion}
              isSelected={selectedFinal === rightVersion.version_number}
              onSelect={() => setSelectedFinal(rightVersion.version_number)}
            />
          </div>

          {/* Version history */}
          <div className="mt-12 border-t border-border-dark pt-8">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-slate-400" />
              版本历史
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {MOCK_VERSIONS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    if (compareVersions[0] !== v.version_number && compareVersions[1] !== v.version_number) {
                      setCompareVersions([v.version_number, compareVersions[1]]);
                    }
                  }}
                  className={`min-w-[120px] aspect-[4/3] rounded-lg flex flex-col items-center justify-center transition-all ${
                    compareVersions.includes(v.version_number)
                      ? 'border-2 border-primary bg-primary/10'
                      : 'bg-slate-800 border border-border-dark hover:border-primary/50'
                  }`}
                >
                  <span
                    className={`text-sm font-bold uppercase ${
                      compareVersions.includes(v.version_number) ? 'text-primary' : 'text-slate-400'
                    }`}
                  >
                    V{v.version_number}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">{v.label}</span>
                </button>
              ))}
              <button className="min-w-[120px] aspect-[4/3] rounded-lg flex flex-col items-center justify-center border border-dashed border-border-dark text-slate-500 hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-5 h-5" />
                <span className="text-[10px] mt-1">新版本</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function VersionCard({
  version,
  isSelected,
  onSelect,
}: {
  version: VersionWithHighlights;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`rounded-xl overflow-hidden shadow-2xl transition-all ${
        version.is_latest
          ? 'bg-panel-dark border-2 border-primary shadow-[0_0_40px_rgba(37,106,244,0.15)]'
          : 'bg-panel-dark border border-border-dark'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between p-4 ${
          version.is_latest ? 'bg-primary/10' : 'bg-slate-800/30'
        } relative`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 text-xs font-bold rounded ${
              version.is_latest ? 'bg-primary text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            V{version.version_number}
          </span>
          <div>
            <p className="font-bold text-sm text-white">{version.label}</p>
            <p className="text-[10px] text-slate-500">{version.created_at}</p>
          </div>
        </div>
        {version.is_latest && (
          <span className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg">
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
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-colors">
            <Maximize2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Prompt */}
      <div className="p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          AI 提示词
        </p>
        <div
          className={`p-4 rounded-lg text-sm leading-relaxed ${
            version.is_latest
              ? 'bg-primary/5 border border-primary/20 text-slate-300'
              : 'bg-slate-900/50 border border-border-dark/50 text-slate-300'
          }`}
        >
          {version.promptHighlights ? (
            <span>
              {version.prompt.split(/(?<=\s)/).map((word, i) => {
                const isHighlight = version.promptHighlights?.some((h) =>
                  word.includes(h.split(' ')[0])
                );
                return isHighlight ? (
                  <span key={i} className="text-primary font-semibold">
                    {word}
                  </span>
                ) : (
                  <span key={i}>{word}</span>
                );
              })}
            </span>
          ) : (
            version.prompt
          )}
        </div>
      </div>

      {/* Specs */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>{version.model_used}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{version.inference_time}s 推理时间</span>
          </div>
        </div>

        {/* Action */}
        {isSelected ? (
          <Button variant="primary" className="w-full" icon={<Star className="w-4 h-4" />}>
            已选为最终版本
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={onSelect}>
            选为最终版本
          </Button>
        )}
      </div>
    </div>
  );
}
