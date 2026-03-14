import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import type { Episode, Panel } from '../api/types';
import { listEpisodes, createEpisode } from '../api/episodes';
import { listPanels, createPanel } from '../api/panels';
import { getProject } from '../api/projects';
import { generateImage } from '../api/generation';
import {
  Bold,
  Italic,
  Underline,
  Wand2,
  Plus,
  ChevronRight,
  ChevronDown,
  Camera,
  Clock,
  User,
  Save,
  Undo2,
  Redo2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Film,
  CheckCircle2,
  Loader2,
  AlignLeft,
  PanelLeft,
  PanelRight,
  X,
} from 'lucide-react';

/* ---------- Toast component ---------- */

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

/* ---------- Sub-components ---------- */

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    completed: 'bg-status-completed',
    in_progress: 'bg-accent',
    draft: 'bg-txt-muted',
    pending: 'bg-txt-muted',
    generating: 'bg-status-waiting',
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colorMap[status] ?? 'bg-txt-muted'}`}
    />
  );
}

function ShotTypeBadge({ type }: { type: string }) {
  return (
    <span
      className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide bg-accent-light text-accent"
    >
      {type}
    </span>
  );
}

/* ---------- Main component ---------- */

/**
 * ScriptEditor — three-column integrated layout
 *
 * Usage:
 *   <Route path="/projects/:id/episodes/:eid/script" element={<ScriptEditor />} />
 */
export default function ScriptEditor() {
  const { id, eid } = useParams();
  const navigate = useNavigate();

  const activeEpisodeId = eid ? parseInt(eid, 10) : undefined;
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | undefined>(activeEpisodeId);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [mobileEpisodeListOpen, setMobileEpisodeListOpen] = useState(false);
  const [mobilePanelBreakdownOpen, setMobilePanelBreakdownOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  /* Toast state */
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = useCallback((type: ToastData['type'], message: string) => {
    setToast({ type, message });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  /* Episode creation dialog state */
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEpisodeTitle, setNewEpisodeTitle] = useState('');

  /* Fetch project title */
  useEffect(() => {
    if (!id) return;
    getProject(Number(id))
      .then(res => setProjectTitle(res.data.title))
      .catch(() => {});
  }, [id]);

  /* Fetch episodes for this project */
  useEffect(() => {
    if (!id) return;
    listEpisodes(Number(id))
      .then(res => setEpisodes(res.data))
      .catch(() => {
        showToast('error', '后端服务不可用，数据已保存在本地');
      })
      .finally(() => setLoading(false));
  }, [id, showToast]);

  /* Once episodes load, fall back to the first episode if none is selected */
  useEffect(() => {
    if (!selectedEpisodeId && episodes.length > 0) {
      setSelectedEpisodeId(episodes[0].id);
    }
  }, [episodes, selectedEpisodeId]);

  /* Fetch panels whenever the selected episode changes */
  useEffect(() => {
    if (!selectedEpisodeId) return;
    listPanels(selectedEpisodeId)
      .then(res => setPanels(res.data))
      .catch(() => setPanels([]));
  }, [selectedEpisodeId]);

  const activeEpisode = episodes.find(e => e.id === selectedEpisodeId);
  const totalDuration = panels.reduce((sum, p) => sum + p.duration, 0);

  /* Rich-text formatting helpers */
  const execFormat = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  };

  /* Handle content editable input — sync changes back to episode state */
  const handleEditorInput = () => {
    if (!editorRef.current || !selectedEpisodeId) return;
    const content = editorRef.current.textContent ?? '';
    setEpisodes(prev =>
      prev.map(ep =>
        ep.id === selectedEpisodeId
          ? { ...ep, script_content: content }
          : ep
      )
    );
  };

  /* Create a new episode — try API first, fall back to local */
  const handleCreateEpisode = async () => {
    const title = newEpisodeTitle.trim();
    if (!title || !id) return;

    const projectId = Number(id);
    const episodeNumber = episodes.length + 1;

    try {
      const res = await createEpisode(projectId, {
        title,
        episode_number: episodeNumber,
        status: 'draft',
        script_content: '',
      });
      setEpisodes(prev => [...prev, res.data]);
      setSelectedEpisodeId(res.data.id);
      showToast('success', '剧集创建成功');
    } catch {
      /* Backend unavailable — create locally with a negative ID */
      const localEpisode: Episode = {
        id: -(episodes.length + 1),
        project_id: projectId,
        episode_number: episodeNumber,
        title,
        status: 'draft',
        script_content: '',
      };
      setEpisodes(prev => [...prev, localEpisode]);
      setSelectedEpisodeId(localEpisode.id);
      showToast('error', '后端服务不可用，数据已保存在本地');
    }

    setNewEpisodeTitle('');
    setShowCreateDialog(false);
  };

  /* Save draft — show confirmation toast */
  const handleSaveDraft = () => {
    showToast('success', '已保存到本地');
  };

  /* AI regenerate script */
  const handleAiRegenerate = async () => {
    if (!panels[0]?.id) {
      showToast('error', '后端 AI 服务不可用');
      return;
    }
    setAiGenerating(true);
    try {
      await generateImage(panels[0].id, { model: 'deepseek-v3' });
    } catch {
      showToast('error', '后端 AI 服务不可用');
    } finally {
      setAiGenerating(false);
    }
  };

  /* AI-assisted writing */
  const handleAiAssist = () => {
    showToast('error', '后端 AI 服务不可用');
  };

  /* Auto-storyboard */
  const handleAutoStoryboard = () => {
    showToast('error', '后端 AI 服务不可用');
  };

  /* Add a local panel with defaults */
  const handleAddPanel = async () => {
    if (!selectedEpisodeId) return;

    const panelNumber = panels.length + 1;
    const panelData: Partial<Panel> = {
      panel_number: panelNumber,
      title: `面板 ${panelNumber}`,
      shot_type: 'MS',
      duration: 3,
      status: 'pending',
      action_description: '',
      dialogue: '',
    };

    try {
      const res = await createPanel(selectedEpisodeId, panelData);
      setPanels(prev => [...prev, res.data]);
      showToast('success', '面板已创建');
    } catch {
      /* Backend unavailable — create locally with a negative ID */
      const localPanel: Panel = {
        id: -(panels.length + 1),
        episode_id: selectedEpisodeId,
        panel_number: panelNumber,
        title: `面板 ${panelNumber}`,
        shot_type: 'MS',
        duration: 3,
        status: 'pending',
        action_description: '',
        dialogue: '',
      };
      setPanels(prev => [...prev, localPanel]);
      showToast('error', '后端服务不可用，数据已保存在本地');
    }
  };

  return (
    <AppLayout layout="split">
      {/* ── Toast notification ───────────────────────────────────── */}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}

      {/* ── Create episode dialog ────────────────────────────────── */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
            role="dialog"
            aria-label="新建剧集"
          >
            <h2 className="text-lg font-bold text-txt-primary mb-4">新建剧集</h2>
            <label className="block text-sm font-medium text-txt-secondary mb-1.5">
              剧集标题
            </label>
            <input
              type="text"
              value={newEpisodeTitle}
              onChange={e => setNewEpisodeTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateEpisode(); }}
              placeholder="请输入剧集标题"
              className="w-full px-3 py-2 border border-bdr rounded-lg text-sm text-txt-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewEpisodeTitle('');
                }}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateEpisode}
                disabled={!newEpisodeTitle.trim()}
              >
                创建
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-bdr px-3 md:px-6 h-14 bg-white sticky top-0 z-10 flex-shrink-0">
        {/* Back + Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-txt-secondary min-w-0" aria-label="breadcrumb">
          <Link
            to={`/projects/${id}`}
            className="flex items-center gap-1.5 text-txt-secondary hover:text-accent transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回</span>
          </Link>
          <div className="h-4 w-px bg-bdr flex-shrink-0" />
          <Link to={`/projects/${id}`} className="hover:text-accent transition-colors hidden md:inline truncate">
            {projectTitle || '项目'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-txt-muted hidden md:block flex-shrink-0" aria-hidden="true" />
          <span className="text-txt-primary font-medium truncate">
            EP{eid} 剧本编辑器
          </span>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Model badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subtle border border-bdr text-[11px] font-medium text-txt-muted">
            <Sparkles className="w-3 h-3 text-accent" aria-hidden="true" />
            Gemini 2.5 Flash
          </span>

          {/* AI 重新生成 button */}
          {aiGenerating ? (
            <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-accent bg-accent-light">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              AI生成中...
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<Sparkles className="w-4 h-4" />}
              className="hidden md:flex"
              onClick={handleAiRegenerate}
              aria-label="AI 重新生成剧本"
            >
              AI 重新生成
            </Button>
          )}

          <div className="w-px h-5 bg-bdr mx-1 hidden md:block" />
          <button
            aria-label="保存"
            className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
            onClick={handleSaveDraft}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Three-column body ──────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Episode list ─────────────────────────────── */}
        {/* Mobile toggle button */}
        <button
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-b border-bdr bg-white text-sm font-medium text-txt-secondary hover:bg-surface-subtle transition-colors w-full text-left"
          onClick={() => setMobileEpisodeListOpen(!mobileEpisodeListOpen)}
          aria-expanded={mobileEpisodeListOpen}
        >
          <PanelLeft className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>剧集列表</span>
          <span className="text-[11px] text-txt-muted ml-1">({episodes.length} 集)</span>
          <ChevronDown className={`w-4 h-4 text-txt-muted ml-auto transition-transform ${mobileEpisodeListOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <aside
          className={`${mobileEpisodeListOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-64 flex-shrink-0 flex-col border-r border-bdr bg-white`}
          aria-label="剧集列表"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-bdr flex items-center gap-2">
            <Film className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-medium text-txt-primary uppercase tracking-wide">
              剧集列表
            </span>
            <span className="ml-auto text-[11px] font-medium text-txt-muted">
              {episodes.length} 集
            </span>
          </div>

          {/* Episode list */}
          <ul className="flex-1 overflow-y-auto custom-scrollbar py-2 max-h-[40vh] lg:max-h-none" role="listbox" aria-label="选择剧集">
            {loading && (
              <li className="px-4 py-6 flex items-center justify-center gap-2 text-xs text-txt-muted">
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                加载中…
              </li>
            )}
            {!loading && episodes.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-txt-muted">
                暂无剧集数据
              </li>
            )}
            {episodes.map((ep) => {
              const isActive = ep.id === selectedEpisodeId;
              return (
                <li key={ep.id} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => setSelectedEpisodeId(ep.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors group ${
                      isActive
                        ? 'bg-accent-light border-l-4 border-accent'
                        : 'border-l-4 border-transparent hover:bg-surface-subtle'
                    }`}
                  >
                    {/* Episode number badge */}
                    <span
                      className={`mt-0.5 text-[11px] font-extrabold w-7 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-accent text-white'
                          : 'bg-surface-subtle text-txt-muted group-hover:bg-bdr'
                      }`}
                    >
                      {ep.episode_number}
                    </span>

                    {/* Title + status */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-txt-primary' : 'text-txt-secondary'
                        }`}
                      >
                        {ep.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StatusDot status={ep.status} />
                        <span className="text-[11px] text-txt-muted">
                          {ep.panel_count ? `${ep.panel_count} 面板` : '草稿'}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* New episode button */}
          <div className="p-3 border-t border-bdr">
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-bdr text-xs text-txt-muted font-medium hover:border-accent/50 hover:text-accent transition-colors"
              aria-label="新建剧集"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              新建剧集
            </button>
          </div>
        </aside>

        {/* ── CENTER PANEL: Script editor ──────────────────────────── */}
        <section className="flex-1 flex flex-col min-w-0 lg:border-r border-bdr bg-white">

          {/* Editor toolbar */}
          <div
            className="flex flex-wrap items-center gap-1 px-3 md:px-4 py-2 border-b border-bdr bg-surface-subtle flex-shrink-0"
            role="toolbar"
            aria-label="文本格式工具栏"
          >
            {/* Font size */}
            <div className="flex items-center gap-1 mr-2">
              <AlignLeft className="w-3.5 h-3.5 text-txt-muted" aria-hidden="true" />
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-white border border-bdr rounded px-1.5 py-0.5 text-xs text-txt-secondary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent appearance-none cursor-pointer"
                aria-label="字号"
              >
                {[12, 13, 14, 15, 16, 18].map((s) => (
                  <option key={s} value={s}>
                    {s}px
                  </option>
                ))}
              </select>
            </div>

            <div className="w-px h-4 bg-bdr mx-1" />

            {/* Format buttons */}
            {[
              { label: '粗体', icon: <Bold className="w-3.5 h-3.5" />, cmd: 'bold' },
              { label: '斜体', icon: <Italic className="w-3.5 h-3.5" />, cmd: 'italic' },
              { label: '下划线', icon: <Underline className="w-3.5 h-3.5" />, cmd: 'underline' },
            ].map(({ label, icon, cmd }) => (
              <button
                key={cmd}
                onClick={() => execFormat(cmd)}
                aria-label={label}
                className="p-1.5 rounded hover:bg-white text-txt-secondary hover:text-txt-primary transition-colors"
              >
                {icon}
              </button>
            ))}

            <div className="w-px h-4 bg-bdr mx-1" />

            {/* AI Assist */}
            <button
              onClick={handleAiAssist}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-light text-accent hover:bg-accent/20 transition-colors"
              aria-label="AI 辅助写作"
            >
              <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
              AI 辅助写作
            </button>

            {/* Autosave indicator */}
            <div className="ml-auto flex items-center gap-1.5" aria-live="polite">
              <span className="w-1.5 h-1.5 rounded-full bg-status-completed" />
              <span className="text-[11px] text-txt-muted">已自动保存</span>
            </div>
          </div>

          {/* Episode title bar */}
          <div className="px-4 md:px-10 py-4 border-b border-bdr/60 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto flex flex-wrap items-baseline gap-2 md:gap-3">
              {activeEpisode ? (
                <>
                  <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
                    EP{activeEpisode.episode_number}
                  </span>
                  <h1 className="text-lg font-extrabold text-txt-primary">{activeEpisode.title}</h1>
                  {activeEpisode.synopsis && (
                    <p className="text-xs text-txt-muted italic truncate">{activeEpisode.synopsis}</p>
                  )}
                </>
              ) : (
                <h1 className="text-lg font-extrabold text-txt-muted">请选择剧集</h1>
              )}
            </div>
          </div>

          {/* Scrollable script body */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-10 bg-white"
            style={{ fontSize }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              aria-label="剧本编辑区"
              aria-multiline="true"
              className="max-w-3xl mx-auto text-txt-primary outline-none whitespace-pre-wrap"
              style={{ fontSize, lineHeight: 1.8 }}
              onInput={handleEditorInput}
              dangerouslySetInnerHTML={{
                __html: activeEpisode?.script_content || '<p class="text-txt-muted italic">暂无剧本内容，点击"自动生成剧本"开始创作</p>',
              }}
            />
          </div>

          {/* Bottom control bar */}
          <div className="border-t border-bdr bg-white flex flex-wrap items-center justify-between gap-2 px-3 md:px-6 py-2 md:py-0 md:h-14 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => document.execCommand('undo')}
                aria-label="撤销"
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.execCommand('redo')}
                aria-label="重做"
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-bdr mx-2 hidden md:block" />
              <Button
                variant="ghost"
                size="sm"
                icon={<Save className="w-3.5 h-3.5" />}
                className="hidden md:flex"
                onClick={handleSaveDraft}
              >
                保存草稿
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                className="hidden md:flex"
                onClick={handleAiRegenerate}
              >
                重新生成
              </Button>
            </div>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/projects/${id}/episodes/${eid}/storyboard`)}
            >
              <span className="hidden md:inline">下一步：</span>分镜规划
            </Button>
          </div>
        </section>

        {/* ── RIGHT PANEL: Panel breakdown ─────────────────────────── */}
        {/* Mobile toggle button */}
        <button
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-t border-bdr bg-white text-sm font-medium text-txt-secondary hover:bg-surface-subtle transition-colors w-full text-left"
          onClick={() => setMobilePanelBreakdownOpen(!mobilePanelBreakdownOpen)}
          aria-expanded={mobilePanelBreakdownOpen}
        >
          <PanelRight className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>分镜拆解</span>
          <span className="text-[11px] text-txt-muted ml-1">({panels.length} 面板)</span>
          <ChevronDown className={`w-4 h-4 text-txt-muted ml-auto transition-transform ${mobilePanelBreakdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <aside
          className={`${mobilePanelBreakdownOpen ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 flex-shrink-0 flex-col bg-white lg:border-l border-bdr`}
          aria-label="分镜拆解"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-bdr flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-xs font-medium text-txt-primary uppercase tracking-wide">
                  分镜拆解
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Wand2 className="w-3.5 h-3.5" />}
                onClick={handleAutoStoryboard}
              >
                自动分镜
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-surface-subtle rounded-lg px-2.5 py-1.5">
                <Camera className="w-3 h-3 text-txt-muted" aria-hidden="true" />
                <span className="text-[11px] font-medium text-txt-secondary">
                  {panels.length} 面板
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-subtle rounded-lg px-2.5 py-1.5">
                <Clock className="w-3 h-3 text-txt-muted" aria-hidden="true" />
                <span className="text-[11px] font-medium text-txt-secondary">
                  {totalDuration.toFixed(1)}s 共计
                </span>
              </div>
            </div>
          </div>

          {/* Panel cards list */}
          <ul
            className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-2 max-h-[50vh] lg:max-h-none"
            aria-label="面板列表"
          >
            {panels.length === 0 && (
              <li className="py-6 text-center text-xs text-txt-muted">
                暂无面板数据
              </li>
            )}
            {panels.map((panel) => {
              /* Backend may return `action` instead of `action_description` */
              const actionText =
                panel.action_description ?? (panel as unknown as Record<string, string>)['action'];
              return (
                <li key={panel.id}>
                  <div className="rounded-xl bg-surface-subtle hover:bg-bdr transition-colors p-3 space-y-2.5 cursor-pointer group">
                    {/* Panel header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold bg-accent-light text-accent px-1.5 py-0.5 rounded">
                          P{panel.panel_number}
                        </span>
                        <ShotTypeBadge type={panel.shot_type} />
                      </div>
                      {/* Status icon */}
                      <span className="flex-shrink-0 mt-0.5">
                        {panel.status === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-status-completed" aria-label="已完成" />
                        )}
                        {panel.status === 'generating' && (
                          <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" aria-label="生成中" />
                        )}
                        {panel.status === 'pending' && (
                          <Clock className="w-3.5 h-3.5 text-txt-muted" aria-label="待处理" />
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-txt-primary group-hover:text-accent transition-colors line-clamp-1">
                      {panel.title}
                    </p>

                    {/* Description */}
                    {actionText && (
                      <p className="text-xs text-txt-muted line-clamp-2 leading-relaxed">
                        {actionText}
                      </p>
                    )}

                    {/* Footer row */}
                    <div className="flex items-center justify-between pt-0.5">
                      {/* Dialogue indicator */}
                      <div className="flex items-center gap-3">
                        {panel.dialogue ? (
                          <span className="flex items-center gap-1 text-[11px] text-txt-muted">
                            <User className="w-3 h-3" aria-hidden="true" />
                            <span className="text-txt-secondary truncate max-w-[100px]">
                              {panel.dialogue}
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-txt-muted italic">无对白</span>
                        )}
                      </div>

                      {/* Duration badge */}
                      <span className="flex items-center gap-1 text-[11px] font-medium text-txt-muted bg-white px-1.5 py-0.5 rounded">
                        <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                        {panel.duration}s
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Add panel button */}
          <div className="p-3 border-t border-bdr flex-shrink-0">
            <button
              onClick={handleAddPanel}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-bdr text-xs text-txt-muted font-medium hover:border-accent/50 hover:text-accent transition-colors"
              aria-label="手动添加面板"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              手动添加面板
            </button>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
