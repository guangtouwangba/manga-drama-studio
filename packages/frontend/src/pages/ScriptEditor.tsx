import { useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import type { Episode, Panel } from '../api/types';
import {
  Bold,
  Italic,
  Underline,
  Wand2,
  Plus,
  ChevronRight,
  Camera,
  Clock,
  User,
  Save,
  Undo2,
  Redo2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Film,
  CheckCircle2,
  Loader2,
  AlignLeft,
} from 'lucide-react';

/* ---------- Mock data ---------- */

const MOCK_EPISODES: Episode[] = [
  {
    id: 1,
    project_id: 1,
    episode_number: 1,
    title: '废体觉醒',
    status: 'completed',
    panel_count: 24,
    synopsis: '沈渊在屈辱中觉醒远古血脉',
  },
  {
    id: 2,
    project_id: 1,
    episode_number: 2,
    title: '宗门大比',
    status: 'in_progress',
    panel_count: 18,
    synopsis: '宗门大比中凌风崭露头角',
  },
  {
    id: 3,
    project_id: 1,
    episode_number: 3,
    title: '禁地之秘',
    status: 'draft',
    panel_count: 0,
    synopsis: '探索禁地深处隐藏的秘密',
  },
  {
    id: 4,
    project_id: 1,
    episode_number: 4,
    title: '血脉传承',
    status: 'draft',
    panel_count: 0,
    synopsis: '远古血脉的真正含义浮出水面',
  },
  {
    id: 5,
    project_id: 1,
    episode_number: 5,
    title: '逆天之战',
    status: 'draft',
    panel_count: 0,
    synopsis: '决战时刻，命运的转折点',
  },
];

interface ScriptScene {
  id: number;
  number: number;
  location: string;
  timeOfDay: string;
  intOrExt: string;
  stageDirection: string;
  blocks: ScriptBlock[];
}

type ScriptBlock =
  | { type: 'character'; name: string; direction?: string; dialogue: string }
  | { type: 'action'; text: string };

const MOCK_SCRIPT_SCENES: ScriptScene[] = [
  {
    id: 1,
    number: 1,
    location: '苍玄宗 - 主殿前广场',
    timeOfDay: '黎明',
    intOrExt: '外景',
    stageDirection:
      '晨曦中，巍峨的苍玄宗主殿轮廓在薄雾中若隐若现。微风拂过，殿前的石阶上散落着几片枯叶。阳光从云层边缘透出，将大地染成一片金橙色。',
    blocks: [
      {
        type: 'character',
        name: '凌风',
        direction: '抬头望向天空，目光坚定',
        dialogue: '今天……就是宗门大比的日子了。',
      },
      {
        type: 'action',
        text: '凌风缓缓拔出腰间长剑，剑身在晨光中泛出淡蓝色光芒。他深吸一口气，将剑意收敛于心。',
      },
      {
        type: 'character',
        name: '小白',
        direction: '从远处跑来，气喘吁吁',
        dialogue: '师兄！师兄等等我！',
      },
      {
        type: 'character',
        name: '凌风',
        direction: '微微一笑，回身等待',
        dialogue: '你总是迟到。今天可不能再如此了。',
      },
      {
        type: 'action',
        text: '小白跑到凌风身旁，弯腰喘息。两人并肩望向宗门方向，神情各异。',
      },
    ],
  },
  {
    id: 2,
    number: 2,
    location: '苍玄宗 - 比武台',
    timeOfDay: '上午',
    intOrExt: '外景',
    stageDirection:
      '比武台上人声鼎沸，四周坐满了前来观战的弟子。台中央的阵法正散发着微弱的光芒，空气中弥漫着淡淡的灵气波动。',
    blocks: [
      {
        type: 'character',
        name: '长老',
        dialogue: '宗门大比，正式开始！第一场——凌风对战赵铭！',
      },
      {
        type: 'action',
        text: '人群爆发出热烈的欢呼声。凌风从容走上比武台，手握长剑，剑意凛然。对面，赵铭冷笑着踏步而来。',
      },
      {
        type: 'character',
        name: '凌风',
        dialogue: '请指教。',
      },
      {
        type: 'character',
        name: '赵铭',
        direction: '轻蔑地扫视凌风',
        dialogue: '废物就是废物，不知道自量力。今日，我赵铭要让你知道，天才与庸才的差距！',
      },
      {
        type: 'action',
        text: '赵铭率先出手，掌风劈来如山倒。凌风身形一闪，苍澜剑划出一道弧光，以快打快。台下一片哗然。',
      },
    ],
  },
  {
    id: 3,
    number: 3,
    location: '苍玄宗 - 禁地入口',
    timeOfDay: '夜晚',
    intOrExt: '外景',
    stageDirection:
      '月色朦胧。禁地入口处，两道古老的石柱上刻满了诡异的符文，微微发光。凌风独自立于此处，手中握着一枚残缺的古玉。',
    blocks: [
      {
        type: 'action',
        text: '凌风将古玉靠近石柱，符文开始剧烈震动，发出低沉的轰鸣声。',
      },
      {
        type: 'character',
        name: '凌风',
        direction: '自语，神情复杂',
        dialogue: '师父临终前留下的东西……究竟隐藏着什么秘密？',
      },
    ],
  },
];

const MOCK_PANELS: Panel[] = [
  {
    id: 1,
    episode_id: 2,
    panel_number: 1,
    title: '黎明中的剑修',
    shot_type: '远景',
    camera_angle: '平视',
    duration: 3.0,
    status: 'completed',
    action_description: '晨曦中，凌风站在苍玄宗山巅，背对镜头，长衫随风飘动。',
    dialogue: '',
  },
  {
    id: 2,
    episode_id: 2,
    panel_number: 2,
    title: '回望宗门',
    shot_type: '中景',
    camera_angle: '平视',
    duration: 2.5,
    status: 'completed',
    action_description: '凌风转身望向山脚下的宗门建筑群，目光中带着复杂的感情。',
    dialogue: '今天……就是宗门大比的日子了。',
  },
  {
    id: 3,
    episode_id: 2,
    panel_number: 3,
    title: '拔剑试锋',
    shot_type: '特写',
    camera_angle: '仰拍',
    duration: 2.0,
    status: 'completed',
    action_description: '凌风缓缓拔出腰间长剑，剑身在晨光中泛出淡蓝色光芒。',
    dialogue: '',
  },
  {
    id: 4,
    episode_id: 2,
    panel_number: 4,
    title: '小白登场',
    shot_type: '全景',
    camera_angle: '平视',
    duration: 2.0,
    status: 'generating',
    action_description: '小白从远处跑来，气喘吁吁，身后尘土飞扬。',
    dialogue: '师兄！师兄等等我！',
  },
  {
    id: 5,
    episode_id: 2,
    panel_number: 5,
    title: '二人并肩',
    shot_type: '中景',
    camera_angle: '平视',
    duration: 3.5,
    status: 'pending',
    action_description: '小白跑到凌风身旁，弯腰喘息。凌风微微一笑。',
    dialogue: '你总是迟到。',
  },
  {
    id: 6,
    episode_id: 2,
    panel_number: 6,
    title: '比武台全景',
    shot_type: '远景',
    camera_angle: '俯拍',
    duration: 3.0,
    status: 'pending',
    action_description: '镜头切换到宏大的比武台全景，四周坐满了弟子。',
    dialogue: '',
  },
  {
    id: 7,
    episode_id: 2,
    panel_number: 7,
    title: '长老宣布',
    shot_type: '中景',
    camera_angle: '平视',
    duration: 2.5,
    status: 'pending',
    action_description: '长老站于高台之上，手持令旗，庄严宣布大比开始。',
    dialogue: '宗门大比，正式开始！',
  },
  {
    id: 8,
    episode_id: 2,
    panel_number: 8,
    title: '凌风应战',
    shot_type: '近景',
    camera_angle: '平视',
    duration: 2.0,
    status: 'pending',
    action_description: '凌风从容走上比武台，手握长剑，剑意凛然，神情沉静。',
    dialogue: '请指教。',
  },
];

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

  const activeEpisodeId = eid ? parseInt(eid, 10) : MOCK_EPISODES[1].id;
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(activeEpisodeId);
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef<HTMLDivElement>(null);

  const totalDuration = MOCK_PANELS.reduce((sum, p) => sum + p.duration, 0);
  const activeEpisode =
    MOCK_EPISODES.find((e) => e.id === selectedEpisodeId) ?? MOCK_EPISODES[1];

  /* Rich-text formatting helpers */
  const execFormat = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false);
  };

  return (
    <AppLayout layout="split">
      {/* ── Top toolbar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-bdr px-6 h-14 bg-white sticky top-0 z-10 flex-shrink-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-txt-secondary" aria-label="breadcrumb">
          <Link to="/projects" className="hover:text-accent transition-colors">
            项目
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-txt-muted" aria-hidden="true" />
          <Link to={`/projects/${id}`} className="hover:text-accent transition-colors">
            仙玄纪元
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-txt-muted" aria-hidden="true" />
          <span className="text-txt-primary font-medium">
            EP{eid} 剧本编辑器
          </span>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Sparkles className="w-4 h-4" />}>
            自动生成剧本
          </Button>
          <div className="w-px h-5 bg-bdr mx-1" />
          <button
            aria-label="保存"
            className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Three-column body ──────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL: Episode list ─────────────────────────────── */}
        <aside
          className="w-64 flex-shrink-0 flex flex-col border-r border-bdr bg-white"
          aria-label="剧集列表"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-bdr flex items-center gap-2">
            <Film className="w-4 h-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-medium text-txt-primary uppercase tracking-wide">
              剧集列表
            </span>
            <span className="ml-auto text-[11px] font-medium text-txt-muted">
              {MOCK_EPISODES.length} 集
            </span>
          </div>

          {/* Episode list */}
          <ul className="flex-1 overflow-y-auto custom-scrollbar py-2" role="listbox" aria-label="选择剧集">
            {MOCK_EPISODES.map((ep) => {
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-bdr text-xs text-txt-muted font-medium hover:border-accent/50 hover:text-accent transition-colors"
              aria-label="新建剧集"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              新建剧集
            </button>
          </div>
        </aside>

        {/* ── CENTER PANEL: Script editor ──────────────────────────── */}
        <section className="flex-1 flex flex-col min-w-0 border-r border-bdr bg-white">

          {/* Editor toolbar */}
          <div
            className="flex items-center gap-1 px-4 py-2 border-b border-bdr bg-surface-subtle flex-shrink-0"
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-light text-accent hover:bg-accent/20 transition-colors"
              aria-label="AI 辅助写作"
            >
              <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
              AI 辅助写作
            </button>

            {/* Autosave indicator */}
            <div className="ml-auto flex items-center gap-1.5" aria-live="polite">
              <span className="w-1.5 h-1.5 rounded-full bg-status-completed animate-pulse" />
              <span className="text-[11px] text-txt-muted">已自动保存</span>
            </div>
          </div>

          {/* Episode title bar */}
          <div className="px-10 py-4 border-b border-bdr/60 bg-white flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-baseline gap-3">
              <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
                EP{activeEpisode.episode_number}
              </span>
              <h1 className="text-lg font-extrabold text-txt-primary">{activeEpisode.title}</h1>
              {activeEpisode.synopsis && (
                <p className="text-xs text-txt-muted italic truncate">{activeEpisode.synopsis}</p>
              )}
            </div>
          </div>

          {/* Scrollable script body */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-white"
            style={{ fontSize }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              aria-label="剧本编辑区"
              aria-multiline="true"
              className="max-w-3xl mx-auto space-y-8 text-txt-primary outline-none"
              style={{ fontSize, lineHeight: 1.8 }}
            >
              {MOCK_SCRIPT_SCENES.map((scene) => (
                <div key={scene.id} className="space-y-4">
                  {/* Scene heading */}
                  <div className="bg-accent-light/30 px-4 py-2 rounded font-semibold text-sm tracking-wide border-l-4 border-accent text-txt-primary select-none">
                    场景 {scene.number}：
                    <span className="editor-highlight">[{scene.location}]</span>
                    {' - '}{scene.timeOfDay}{' - '}{scene.intOrExt}
                  </div>

                  {/* Stage direction */}
                  <p className="italic text-txt-muted text-sm leading-relaxed pl-4">
                    {scene.stageDirection}
                  </p>

                  {/* Script blocks */}
                  <div className="space-y-5 pl-8">
                    {scene.blocks.map((block, i) => {
                      if (block.type === 'character') {
                        return (
                          <div key={i} className="space-y-1" data-block="character">
                            <p className="text-center font-medium text-sm text-txt-secondary uppercase tracking-wide">
                              【<span className="editor-highlight">{block.name}</span>】
                            </p>
                            {block.direction && (
                              <p className="italic text-center text-xs text-txt-muted">
                                ({block.direction})
                              </p>
                            )}
                            <p className="text-center leading-relaxed max-w-md mx-auto text-txt-primary">
                              {block.dialogue}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p key={i} className="py-1 text-sm leading-relaxed text-txt-secondary" data-block="action">
                          {block.text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom control bar */}
          <div className="h-14 border-t border-bdr bg-white flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                aria-label="撤销"
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                aria-label="重做"
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-txt-secondary transition-colors"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-bdr mx-2" />
              <Button variant="ghost" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
                保存草稿
              </Button>
              <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
                重新生成
              </Button>
            </div>
            <Button
              variant="primary"
              size="sm"
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/projects/${id}/episodes/${eid}/storyboard`)}
            >
              下一步：分镜规划
            </Button>
          </div>
        </section>

        {/* ── RIGHT PANEL: Panel breakdown ─────────────────────────── */}
        <aside
          className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-bdr"
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
              <Button variant="outline" size="sm" icon={<Wand2 className="w-3.5 h-3.5" />}>
                自动分镜
              </Button>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 bg-surface-subtle rounded-lg px-2.5 py-1.5">
                <Camera className="w-3 h-3 text-txt-muted" aria-hidden="true" />
                <span className="text-[11px] font-medium text-txt-secondary">
                  {MOCK_PANELS.length} 面板
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
            className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3 space-y-2"
            aria-label="面板列表"
          >
            {MOCK_PANELS.map((panel, index) => (
              <li key={panel.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
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
                  {panel.action_description && (
                    <p className="text-xs text-txt-muted line-clamp-2 leading-relaxed">
                      {panel.action_description}
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
            ))}
          </ul>

          {/* Add panel button */}
          <div className="p-3 border-t border-bdr flex-shrink-0">
            <button
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
