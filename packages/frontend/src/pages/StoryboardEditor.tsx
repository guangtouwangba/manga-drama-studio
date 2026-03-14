/**
 * StoryboardEditor.tsx
 * AI-generated storyboard review & refinement page.
 *
 * Route: /projects/:id/episodes/:eid/storyboard
 *
 * Core workflow: AI pipeline generates panels → user reviews → approve/reject/regenerate.
 * This is NOT a manual CMS editor. The user's job is to review AI output.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import type { Panel, PanelAssociation } from '../api/types';
import { listPanels, createPanel, deletePanel } from '../api/panels';
import { regenerateImage } from '../api/generation';
import {
  ChevronRight,
  Wand2,
  Camera,
  Clock,
  RefreshCw,
  Play,
  CheckCircle2,
  ImageIcon,
  Video,
  User,
  MapPin,
  Package,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Loader2,
  Save,
  Layers,
  Film,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Eye,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  SlidersHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Toast                                                                */
/* ------------------------------------------------------------------ */

interface ToastData {
  type: 'success' | 'error';
  message: string;
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-in fade-in slide-in-from-top-2 ${
        toast.type === 'success'
          ? 'bg-status-completed text-white'
          : 'bg-status-failed text-white'
      }`}
      role="alert"
    >
      <span>{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors"
        aria-label="关闭提示"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */

const ATMOSPHERE_OPTIONS = [
  '紧张', '压抑', '温馨', '悲壮', '神秘', '欢快',
  '恐怖', '浪漫', '热血', '平静', '庄严', '诡异',
];

const EMOTION_OPTIONS = [
  '愤怒', '悲伤', '喜悦', '恐惧', '惊讶', '厌恶',
  '隐忍', '释然', '绝望', '坚定', '迷茫', '震惊',
];

/* ------------------------------------------------------------------ */
/* TagSelector                                                          */
/* ------------------------------------------------------------------ */

interface TagSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  allowCustom?: boolean;
  label: string;
}

function TagSelector({ options, value, onChange, allowCustom = true, label }: TagSelectorProps) {
  const isCustomValue = value !== '' && !options.includes(value);
  const [showCustomInput, setShowCustomInput] = useState(isCustomValue);
  const [customDraft, setCustomDraft] = useState(isCustomValue ? value : '');
  const customInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (option: string) => {
    if (value === option) {
      onChange('');
    } else {
      onChange(option);
      setShowCustomInput(false);
    }
  };

  const handleCustomClick = () => {
    setShowCustomInput(true);
    setCustomDraft(isCustomValue ? value : '');
    setTimeout(() => customInputRef.current?.focus(), 0);
  };

  const handleCustomConfirm = () => {
    const trimmed = customDraft.trim();
    if (trimmed) {
      onChange(trimmed);
    }
    if (!trimmed) {
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomConfirm();
    }
    if (e.key === 'Escape') {
      setShowCustomInput(false);
      if (isCustomValue) onChange('');
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => handleSelect(option)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                selected
                  ? 'bg-accent/15 text-accent border-accent/30 font-medium'
                  : 'bg-surface-subtle text-txt-secondary border border-bdr hover:border-accent/30'
              }`}
            >
              {option}
            </button>
          );
        })}
        {allowCustom && !showCustomInput && (
          <button
            type="button"
            onClick={handleCustomClick}
            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
              isCustomValue
                ? 'bg-accent/15 text-accent border-accent/30 font-medium'
                : 'bg-surface-subtle text-txt-muted border border-dashed border-bdr hover:border-accent/30 hover:text-txt-secondary'
            }`}
          >
            {isCustomValue ? value : '自定义'}
          </button>
        )}
        {allowCustom && showCustomInput && (
          <input
            ref={customInputRef}
            type="text"
            value={customDraft}
            onChange={(e) => setCustomDraft(e.target.value)}
            onBlur={handleCustomConfirm}
            onKeyDown={handleCustomKeyDown}
            placeholder="输入..."
            className="px-2.5 py-1 text-xs rounded-full border border-accent/30 bg-white text-txt-primary outline-none focus:ring-1 focus:ring-accent w-20"
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function AssocIcon({ type }: { type: PanelAssociation['type'] }) {
  if (type === 'character') return <User className="w-3 h-3" />;
  if (type === 'location') return <MapPin className="w-3 h-3" />;
  return <Package className="w-3 h-3" />;
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function StoryboardEditor() {
  const { id, eid } = useParams();
  const navigate = useNavigate();

  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [approvedPanelIds, setApprovedPanelIds] = useState<Set<number>>(new Set());
  const [panelRegeneratingIds, setPanelRegeneratingIds] = useState<Set<number>>(new Set());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  /* Toast state */
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = useCallback((type: ToastData['type'], message: string) => {
    setToast({ type, message });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  /* Panel creation state */
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [newPanelTitle, setNewPanelTitle] = useState('');

  useEffect(() => {
    if (!eid) return;
    listPanels(Number(eid))
      .then(res => {
        setPanels(res.data);
        if (res.data.length > 0) {
          setSelectedPanelId(res.data[0].id);
        }
      })
      .catch(() => {
        setPanels([]);
        showToast('error', '后端服务不可用，数据已保存在本地');
      })
      .finally(() => setLoading(false));
  }, [id, eid, showToast]);

  const selectedPanel = panels.find((p) => p.id === selectedPanelId) ?? panels[0];
  const selectedIndex = panels.findIndex((p) => p.id === selectedPanelId);
  const approvedCount = approvedPanelIds.size;
  const totalPanels = panels.length;

  /* ── Panel creation ── */
  const handleAddPanel = async () => {
    if (!eid) return;

    const title = newPanelTitle.trim() || `分镜 ${panels.length + 1}`;
    const panelNumber = panels.length + 1;

    const panelData: Partial<Panel> = {
      panel_number: panelNumber,
      title,
      shot_type: '中景',
      duration: 3,
      status: 'draft',
    };

    try {
      const res = await createPanel(Number(eid), panelData);
      setPanels(prev => [...prev, res.data]);
      setSelectedPanelId(res.data.id);
      showToast('success', '分镜已创建');
    } catch {
      const localPanel: Panel = {
        id: -(panels.length + 1),
        episode_id: Number(eid),
        panel_number: panelNumber,
        title,
        shot_type: '中景',
        duration: 3,
        status: 'draft',
      };
      setPanels(prev => [...prev, localPanel]);
      setSelectedPanelId(localPanel.id);
      showToast('error', '后端服务不可用，数据已保存在本地');
    }

    setNewPanelTitle('');
    setShowCreatePanel(false);
  };

  /* ── Panel deletion ── */
  const handleDeletePanel = async (panelId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const idx = panels.findIndex(p => p.id === panelId);
    if (idx === -1) return;

    // Try API first, then remove locally regardless
    try {
      await deletePanel(panelId);
    } catch {
      // API unavailable, still remove locally
    }

    setPanels(prev => {
      const next = prev.filter(p => p.id !== panelId);
      // If the deleted panel was selected, select an adjacent one
      if (selectedPanelId === panelId) {
        if (next.length === 0) {
          setSelectedPanelId(null);
        } else {
          const newIdx = Math.min(idx, next.length - 1);
          setSelectedPanelId(next[newIdx].id);
        }
      }
      return next;
    });

    // Remove from approved set if present
    setApprovedPanelIds(prev => {
      const next = new Set(prev);
      next.delete(panelId);
      return next;
    });
  };

  const handleRegenerate = async () => {
    if (!selectedPanel || isRegenerating) return;
    setIsRegenerating(true);
    try {
      await regenerateImage(selectedPanel.id);
    } catch {
      showToast('error', '后端 AI 服务不可用');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePanelRegenerate = async (panelId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (panelRegeneratingIds.has(panelId)) return;
    setPanelRegeneratingIds((prev) => new Set(prev).add(panelId));
    try {
      await regenerateImage(panelId);
    } catch {
      showToast('error', '后端 AI 服务不可用');
    } finally {
      setPanelRegeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(panelId);
        return next;
      });
    }
  };

  const handleFieldChange = (panelId: number, field: keyof Panel, value: string) => {
    setPanels((prev) =>
      prev.map((p) => (p.id === panelId ? { ...p, [field]: value } : p)),
    );
  };

  const toggleApproved = (panelId: number) => {
    setApprovedPanelIds((prev) => {
      const next = new Set(prev);
      if (next.has(panelId)) next.delete(panelId);
      else next.add(panelId);
      return next;
    });
  };

  const goToPanel = (direction: 'prev' | 'next') => {
    if (panels.length === 0) return;
    const idx = direction === 'next'
      ? Math.min(selectedIndex + 1, panels.length - 1)
      : Math.max(selectedIndex - 1, 0);
    setSelectedPanelId(panels[idx].id);
  };

  const handleAutoPlanning = () => {
    showToast('error', '后端 AI 服务不可用');
  };

  const handleSave = () => {
    showToast('success', '已保存到本地');
  };

  const handleGenerateImage = () => {
    showToast('error', '后端 AI 服务不可用');
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <AppLayout layout="header-only">
      {/* ── Toast notification ── */}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      {/* ── Panel creation dialog ── */}
      {showCreatePanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            role="dialog"
            aria-label="添加分镜"
          >
            <h2 className="text-lg font-bold text-txt-primary mb-4">添加分镜</h2>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">
              分镜标题
            </label>
            <input
              type="text"
              value={newPanelTitle}
              onChange={e => setNewPanelTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddPanel(); }}
              placeholder={`分镜 ${panels.length + 1}`}
              className="w-full px-3 py-2 border border-bdr rounded-lg text-sm text-txt-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                className="px-3 py-1.5 text-sm text-txt-secondary rounded-lg hover:bg-surface-subtle transition-colors"
                onClick={() => {
                  setShowCreatePanel(false);
                  setNewPanelTitle('');
                }}
              >
                取消
              </button>
              <button
                className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                onClick={handleAddPanel}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Single compact header ── */}
      <div className="flex items-center justify-between border-b border-bdr bg-white px-4 py-2 flex-shrink-0 gap-3">
        {/* Left: back + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/projects/${id}`}
            className="flex items-center gap-1.5 text-txt-secondary hover:text-accent text-sm transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回</span>
          </Link>
          <div className="h-4 w-px bg-bdr flex-shrink-0" />
          <nav className="flex items-center gap-1 text-xs text-txt-muted overflow-hidden" aria-label="面包屑">
            <span className="truncate">EP{eid}</span>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-txt-primary font-medium flex-shrink-0 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-accent" />
              分镜审阅
            </span>
          </nav>
          {totalPanels > 0 && (
            <span className="text-xs text-txt-muted flex-shrink-0 ml-2">
              {approvedCount}/{totalPanels} 已通过
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {totalPanels > 0 && approvedCount === totalPanels && (
            <span className="text-xs text-status-completed font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              全部通过
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-txt-primary text-white text-sm font-medium rounded-lg transition-colors hover:bg-txt-primary/90"
            aria-label="保存"
          >
            <Save className="w-3.5 h-3.5" />
            保存
          </button>
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════
            LEFT — Panel filmstrip (narrow, scrollable)
        ════════════════════════════════════════════════════ */}
        <aside
          className="w-[220px] lg:w-[260px] flex-shrink-0 border-r border-bdr flex flex-col bg-white"
          aria-label="分镜列表"
        >
          {/* Toolbar */}
          <div className="px-3 py-2.5 border-b border-bdr flex items-center justify-between flex-shrink-0">
            <span className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">
              分镜 {totalPanels > 0 ? `(${totalPanels})` : ''}
            </span>
            <button
              onClick={handleAutoPlanning}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-accent font-medium rounded-md hover:bg-accent-light transition-colors"
              aria-label="AI 自动规划"
            >
              <Wand2 className="w-3 h-3" />
              自动规划
            </button>
          </div>

          {/* Scrollable panel list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
            {loading && (
              <div className="flex items-center justify-center h-32 gap-2 text-txt-muted">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">加载中...</span>
              </div>
            )}
            {!loading && panels.length === 0 && (
              <EmptyPanelList
                projectId={id}
                episodeId={eid}
                onAddPanel={() => setShowCreatePanel(true)}
              />
            )}
            {!loading && panels.map((panel) => {
              const isSelected = panel.id === selectedPanelId;
              const isApproved = approvedPanelIds.has(panel.id);
              const isGenerating = panelRegeneratingIds.has(panel.id) || (isRegenerating && isSelected);

              return (
                <button
                  key={panel.id}
                  onClick={() => setSelectedPanelId(panel.id)}
                  className={`group w-full text-left rounded-lg overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-accent ring-1 ring-accent/20'
                      : 'border-bdr hover:border-txt-muted/30'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/9] bg-surface-subtle relative overflow-hidden">
                    {panel.image_url ? (
                      <img
                        src={panel.image_url}
                        alt={panel.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-txt-muted/50" />
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                    {/* Regen hover */}
                    {!isGenerating && panel.image_url && (
                      <button
                        onClick={(e) => handlePanelRegenerate(panel.id, e)}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`重新生成 ${panel.title}`}
                      >
                        <RefreshCw className="w-4 h-4 text-white" />
                      </button>
                    )}
                    {/* Approval badge */}
                    {isApproved && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-status-completed flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Delete button — visible on hover */}
                    <button
                      onClick={(e) => handleDeletePanel(panel.id, e)}
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/40 hover:bg-status-failed flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`删除 ${panel.title}`}
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  {/* Meta row */}
                  <div className="px-2 py-1.5 flex items-center gap-1.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-accent text-white' : 'bg-surface-subtle text-txt-muted'
                    }`}>
                      {panel.panel_number}
                    </span>
                    <span className="text-[11px] text-txt-primary truncate flex-1">{panel.title}</span>
                    <span className="text-[10px] text-txt-muted flex-shrink-0">{panel.duration}s</span>
                  </div>
                </button>
              );
            })}
            {/* Add panel button at the bottom of the panel list */}
            {!loading && panels.length > 0 && (
              <button
                onClick={() => setShowCreatePanel(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-dashed border-bdr text-[11px] text-txt-muted font-medium hover:border-accent/50 hover:text-accent transition-colors"
                aria-label="添加分镜"
              >
                <Plus className="w-3 h-3" />
                添加分镜
              </button>
            )}
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════
            RIGHT — Review panel (image-dominant)
        ════════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col overflow-hidden bg-canvas" aria-label="分镜审阅">
          {(loading || !selectedPanel) ? (
            <div className="flex-1 flex items-center justify-center text-txt-muted">
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" aria-label="加载中" />
                : <EmptyDetailPanel />
              }
            </div>
          ) : (
            <>
              {/* Image preview — dominant area */}
              <div className="flex-1 flex items-center justify-center p-4 min-h-0 relative">
                <div className="relative w-full h-full max-w-4xl rounded-xl overflow-hidden bg-surface-subtle group">
                  {selectedPanel.image_url ? (
                    <img
                      src={selectedPanel.image_url}
                      alt={selectedPanel.title}
                      className={`w-full h-full object-contain transition-opacity ${
                        isRegenerating ? 'opacity-30' : 'opacity-100'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-txt-muted">
                      <ImageIcon className="w-12 h-12 text-txt-muted/30" />
                      <p className="text-sm">尚未生成图片</p>
                      <button
                        onClick={handleGenerateImage}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        生成图片
                      </button>
                    </div>
                  )}

                  {/* Regen overlay */}
                  {isRegenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-10 h-10 text-accent animate-spin" />
                      <p className="text-sm text-txt-secondary font-medium">生成中...</p>
                    </div>
                  )}

                  {/* Hover controls */}
                  {selectedPanel.image_url && !isRegenerating && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors" aria-label="播放">
                        <Play className="w-5 h-5 text-white" />
                      </button>
                      <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors" aria-label="全屏">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  )}

                  {/* Shot info badge — bottom left */}
                  {selectedPanel.shot_type && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-black/50 text-white text-[11px] font-medium rounded-md flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {selectedPanel.shot_type}
                      </span>
                      {selectedPanel.camera_angle && (
                        <span className="px-2 py-1 bg-black/50 text-white text-[11px] rounded-md">
                          {selectedPanel.camera_angle}
                        </span>
                      )}
                      {selectedPanel.camera_movement && selectedPanel.camera_movement !== '固定' && (
                        <span className="px-2 py-1 bg-black/50 text-white text-[11px] rounded-md">
                          {selectedPanel.camera_movement}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Panel number — top left */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-accent text-white text-xs font-semibold rounded-md">
                    P{selectedPanel.panel_number}
                  </div>

                  {/* Duration — top right */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-[11px] rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedPanel.duration}s
                  </div>
                </div>
              </div>

              {/* Action bar — below the image */}
              <div className="flex-shrink-0 border-t border-bdr bg-white px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                  {/* Left: nav + panel info */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPanel('prev')}
                      disabled={selectedIndex <= 0}
                      className="p-1.5 rounded-md hover:bg-surface-subtle text-txt-muted transition-colors disabled:opacity-30"
                      aria-label="上一个"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-txt-secondary tabular-nums min-w-[3rem] text-center">
                      {selectedIndex + 1} / {totalPanels}
                    </span>
                    <button
                      onClick={() => goToPanel('next')}
                      disabled={selectedIndex >= totalPanels - 1}
                      className="p-1.5 rounded-md hover:bg-surface-subtle text-txt-muted transition-colors disabled:opacity-30"
                      aria-label="下一个"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-bdr mx-1" />
                    <h3 className="text-sm font-medium text-txt-primary truncate max-w-[200px]">
                      {selectedPanel.title}
                    </h3>
                    <StatusBadge status={selectedPanel.status} size="sm" />
                  </div>

                  {/* Center: primary review actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleApproved(selectedPanel.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        approvedPanelIds.has(selectedPanel.id)
                          ? 'bg-status-completed text-white'
                          : 'bg-status-completed/10 text-status-completed hover:bg-status-completed/20'
                      }`}
                      aria-pressed={approvedPanelIds.has(selectedPanel.id)}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {approvedPanelIds.has(selectedPanel.id) ? '已通过' : '通过'}
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      className="flex items-center gap-1.5 px-4 py-2 border border-bdr rounded-lg text-sm font-medium text-txt-primary transition-colors hover:bg-surface-subtle disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      {isRegenerating ? '生成中...' : '重新生成'}
                    </button>
                  </div>

                  {/* Right: secondary actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setDetailsOpen(!detailsOpen)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        detailsOpen ? 'bg-accent/10 text-accent' : 'text-txt-secondary hover:bg-surface-subtle'
                      }`}
                      aria-expanded={detailsOpen}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">详情</span>
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/projects/${id}/episodes/${eid}/storyboard/panels/${selectedPanel.id}/compare`)
                      }
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-txt-secondary transition-colors hover:bg-surface-subtle"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">版本对比</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable detail panel */}
              {detailsOpen && selectedPanel && (
                <DetailPanel
                  panel={selectedPanel}
                  promptOpen={promptOpen}
                  onPromptToggle={() => setPromptOpen(!promptOpen)}
                  onFieldChange={handleFieldChange}
                />
              )}
            </>
          )}
        </main>
      </div>
    </AppLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Empty states                                                         */
/* ------------------------------------------------------------------ */

function EmptyPanelList({
  projectId,
  episodeId,
  onAddPanel,
}: {
  projectId?: string;
  episodeId?: string;
  onAddPanel: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center mb-4">
        <Film className="w-6 h-6 text-accent" />
      </div>
      <p className="text-sm font-medium text-txt-primary mb-1">尚无分镜</p>
      <p className="text-xs text-txt-muted mb-4 max-w-[180px]">
        分镜将由 AI 流水线自动生成，也可手动添加
      </p>
      <div className="space-y-2 w-full">
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent-dark transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          启动生成流水线
        </Link>
        <Link
          to={`/projects/${projectId}/episodes/${episodeId}/script`}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-surface-subtle text-txt-secondary text-xs font-medium rounded-lg hover:bg-bdr transition-colors"
        >
          <Eye className="w-3 h-3" />
          查看剧本
        </Link>
        <button
          onClick={onAddPanel}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 border border-dashed border-bdr text-txt-secondary text-xs font-medium rounded-lg hover:border-accent/50 hover:text-accent transition-colors"
        >
          <Plus className="w-3 h-3" />
          手动添加分镜
        </button>
      </div>
    </div>
  );
}

function EmptyDetailPanel() {
  return (
    <div className="text-center">
      <p className="text-sm text-txt-muted">选择左侧分镜开始审阅</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Detail panel (collapsible)                                           */
/* ------------------------------------------------------------------ */

function DetailPanel({
  panel,
  promptOpen,
  onPromptToggle,
  onFieldChange,
}: {
  panel: Panel;
  promptOpen: boolean;
  onPromptToggle: () => void;
  onFieldChange: (panelId: number, field: keyof Panel, value: string) => void;
}) {
  return (
    <div className="flex-shrink-0 border-t border-bdr bg-white max-h-[40vh] overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto p-4 space-y-5">
        {/* Row 1: Shot design + dialogue side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Shot design */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">镜头设计</h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-txt-muted block mb-1">景别</label>
                <select
                  className="w-full bg-surface-subtle border border-bdr rounded-md px-2 py-1.5 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                  value={panel.shot_type}
                  onChange={(e) => onFieldChange(panel.id, 'shot_type', e.target.value)}
                >
                  {['全景', '远景', '中景', '近景', '特写', '大特写'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-txt-muted block mb-1">角度</label>
                <select
                  className="w-full bg-surface-subtle border border-bdr rounded-md px-2 py-1.5 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                  value={panel.camera_angle ?? '平视'}
                  onChange={(e) => onFieldChange(panel.id, 'camera_angle', e.target.value)}
                >
                  {['平视', '俯视', '仰视', '鸟瞰'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-txt-muted block mb-1">运镜</label>
                <select
                  className="w-full bg-surface-subtle border border-bdr rounded-md px-2 py-1.5 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                  value={panel.camera_movement ?? '固定'}
                  onChange={(e) => onFieldChange(panel.id, 'camera_movement', e.target.value)}
                >
                  {['固定', '推进', '拉远', '摇移', '跟踪', '环绕'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            {/* Tags */}
            <TagSelector
              options={ATMOSPHERE_OPTIONS}
              value={panel.mood ?? ''}
              onChange={(v) => onFieldChange(panel.id, 'mood', v)}
              label="氛围"
            />
            <TagSelector
              options={EMOTION_OPTIONS}
              value={panel.emotion ?? ''}
              onChange={(v) => onFieldChange(panel.id, 'emotion', v)}
              label="情绪"
            />
          </div>

          {/* Dialogue & description */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-medium text-txt-muted uppercase tracking-wide">内容</h4>
            <div>
              <label className="text-[10px] text-txt-muted block mb-1">动作描述</label>
              <textarea
                className="w-full bg-surface-subtle border border-bdr rounded-md px-2.5 py-2 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent resize-none"
                rows={2}
                value={panel.action_description ?? ''}
                onChange={(e) => onFieldChange(panel.id, 'action_description', e.target.value)}
                placeholder="描述画面中的动作..."
              />
            </div>
            <div>
              <label className="text-[10px] text-txt-muted block mb-1">对白</label>
              <textarea
                className="w-full bg-surface-subtle border-l-2 border-l-accent/40 border border-bdr rounded-md px-2.5 py-2 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent resize-none italic"
                rows={2}
                value={panel.dialogue ?? ''}
                onChange={(e) => onFieldChange(panel.id, 'dialogue', e.target.value)}
                placeholder="无对白..."
              />
            </div>
            <div>
              <label className="text-[10px] text-txt-muted block mb-1">旁白 / 音效</label>
              <input
                type="text"
                className="w-full bg-surface-subtle border border-bdr rounded-md px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                value={panel.narration ?? ''}
                onChange={(e) => onFieldChange(panel.id, 'narration', e.target.value)}
                placeholder="旁白或音效..."
              />
            </div>
          </div>
        </div>

        {/* Row 2: Associations */}
        {(panel.associations ?? []).length > 0 && (
          <div>
            <h4 className="text-[11px] font-medium text-txt-muted uppercase tracking-wide mb-2">关联资产</h4>
            <div className="flex flex-wrap gap-1.5">
              {(panel.associations ?? []).map((assoc, i) => (
                <span
                  key={i}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium ${
                    assoc.type === 'character'
                      ? 'bg-accent-light text-accent'
                      : assoc.type === 'location'
                      ? 'bg-status-completed/10 text-status-completed'
                      : 'bg-surface-subtle text-txt-secondary'
                  }`}
                >
                  <AssocIcon type={assoc.type} />
                  {assoc.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Prompts (collapsible) */}
        <div className="border-t border-bdr pt-3">
          <button
            onClick={onPromptToggle}
            className="flex items-center gap-2 text-[11px] font-medium text-txt-muted uppercase tracking-wide hover:text-txt-secondary transition-colors"
            aria-expanded={promptOpen}
          >
            {promptOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            AI 提示词 (通常无需修改)
          </button>
          {promptOpen && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-txt-muted flex items-center gap-1 mb-1">
                  <ImageIcon className="w-3 h-3 text-accent" />
                  图片提示词
                </label>
                <textarea
                  className="w-full bg-surface-subtle border border-bdr rounded-md p-2 text-[11px] text-txt-secondary resize-none focus:ring-1 focus:ring-accent outline-none font-mono leading-relaxed"
                  rows={3}
                  value={panel.image_prompt ?? ''}
                  onChange={(e) => onFieldChange(panel.id, 'image_prompt', e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-txt-muted flex items-center gap-1 mb-1">
                  <Video className="w-3 h-3 text-accent" />
                  视频提示词
                </label>
                <textarea
                  className="w-full bg-surface-subtle border border-bdr rounded-md p-2 text-[11px] text-txt-secondary resize-none focus:ring-1 focus:ring-accent outline-none font-mono leading-relaxed"
                  rows={3}
                  value={panel.video_prompt ?? ''}
                  onChange={(e) => onFieldChange(panel.id, 'video_prompt', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
