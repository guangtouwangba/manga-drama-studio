/**
 * StoryboardEditor.tsx
 * Storyboard / panel editor page for AI manga production.
 *
 * Route: /projects/:id/episodes/:eid/storyboard
 *
 * Usage:
 *   <Route path="/projects/:id/episodes/:eid/storyboard" element={<StoryboardEditor />} />
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import type { Panel, PanelAssociation, PanelVersion } from '../api/types';
import {
  ChevronRight,
  Wand2,
  Plus,
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
  Settings,
  Search,
  Trash2,
  Copy,
  Mic,
  Layers,
  Check,
  Film,
  ArrowRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Mock data                                                             */
/* ------------------------------------------------------------------ */

type MockPanel = Panel & {
  associations: PanelAssociation[];
};

const MOCK_PANELS: MockPanel[] = [
  {
    id: 1, episode_id: 1, panel_number: 1, title: '大厅全景', status: 'completed',
    shot_type: '全景', camera_angle: '平视', camera_movement: '固定', duration: 2.5,
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=640&h=360&fit=crop',
    current_version: 2,
    action_description: '镜头拉远,展示气势恢宏的宗族大殿全景。大殿内烛火通明,族人分列两侧。',
    dialogue: '', mood: '庄严', emotion: '肃穆', narration: '退婚大典,天下皆知。',
    image_prompt: 'epic wide shot, ancient Chinese palace hall, torches lit, two rows of people, cinematic, 8k',
    video_prompt: 'slow dolly out, ambient crowd sounds, torch flickers',
    associations: [{ type: 'location', name: '宗族大殿', id: 10 }],
  },
  {
    id: 2, episode_id: 1, panel_number: 2, title: '特写：手部颤抖', status: 'completed',
    shot_type: '特写', camera_angle: '俯视', camera_movement: '固定', duration: 1.5,
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=360&fit=crop',
    current_version: 1,
    action_description: '某人手捧一只玉制茶盏,手指微微颤抖,茶水轻晃。',
    dialogue: '', mood: '紧张', emotion: '恐惧', narration: '',
    image_prompt: 'extreme close-up, trembling hand holding jade teacup, candlelight reflection',
    video_prompt: 'micro camera shake, tea ripple animation',
    associations: [{ type: 'prop', name: '玉茶盏', id: 20 }],
  },
  {
    id: 3, episode_id: 1, panel_number: 3, title: '族长宣布退婚', status: 'generating',
    shot_type: '中景', camera_angle: '仰视', camera_movement: '固定', duration: 2.5,
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=640&h=360&fit=crop',
    current_version: 3,
    action_description: '族长在主座上缓缓站起,单手展开一份金色的退婚书,目光如炬,投向台下的少年。',
    dialogue: '"今日召集大家,不为别事,只为宣布叶凡与纳兰嫣然婚约解除一事！"',
    mood: '紧张', emotion: '威严', narration: '',
    image_prompt: 'masterpiece, highly detailed, fantasy ancient Chinese palace, elder man standing on throne, holding gold scroll, cinematic lighting, sharp focus, volumetric fog, blue and gold color scheme, 8k',
    video_prompt: 'slow motion zoom towards character face, clothes blowing in mystical wind, character opening scroll slowly, epic background movement, particles flying',
    associations: [
      { type: 'character', name: '族长 (萧战)', id: 1 },
      { type: 'prop', name: '退婚书', id: 21 },
      { type: 'location', name: '大殿-夜', id: 11 },
    ],
  },
  {
    id: 4, episode_id: 1, panel_number: 4, title: '叶凡面色苍白', status: 'pending',
    shot_type: '近景', camera_angle: '平视', camera_movement: '固定', duration: 2.0,
    image_url: '',
    current_version: 0,
    action_description: '叶凡站于大殿中央,面色惨白,身躯微微颤抖。',
    dialogue: '', mood: '悲伤', emotion: '震惊', narration: '',
    image_prompt: 'close-up portrait, young man pale face, shocked expression, ancient Chinese attire, dramatic lighting',
    video_prompt: 'slow zoom in, tears welling up',
    associations: [{ type: 'character', name: '叶凡', id: 2 }],
  },
  {
    id: 5, episode_id: 1, panel_number: 5, title: '人群议论纷纷', status: 'pending',
    shot_type: '全景', camera_angle: '平视', camera_movement: '摇移', duration: 3.0,
    image_url: '',
    current_version: 0,
    action_description: '殿内族人开始低声交谈,目光或怜悯或冷漠地投向叶凡。',
    dialogue: '"废体！""果然是废体……"', mood: '嘈杂', emotion: '轻蔑', narration: '',
    image_prompt: 'wide shot crowd of ancient Chinese nobles whispering, shallow depth of field',
    video_prompt: 'slow pan across crowd faces',
    associations: [{ type: 'location', name: '宗族大殿', id: 10 }],
  },
  {
    id: 6, episode_id: 1, panel_number: 6, title: '纳兰嫣然回头', status: 'pending',
    shot_type: '中景', camera_angle: '平视', camera_movement: '固定', duration: 2.0,
    image_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=640&h=360&fit=crop',
    current_version: 0,
    action_description: '纳兰嫣然缓缓转过头,与叶凡四目相对,随即移开视线。',
    dialogue: '"……对不起。"', mood: '沉重', emotion: '愧疚', narration: '',
    image_prompt: 'medium shot, beautiful young woman turning head away, sad eyes, ancient Chinese silk dress',
    video_prompt: 'slow head turn, eye contact, look away',
    associations: [{ type: 'character', name: '纳兰嫣然', id: 3 }],
  },
  {
    id: 7, episode_id: 1, panel_number: 7, title: '叶凡握拳', status: 'pending',
    shot_type: '特写', camera_angle: '平视', camera_movement: '固定', duration: 1.5,
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&h=360&fit=crop',
    current_version: 0,
    action_description: '叶凡垂在身侧的手缓缓握成拳,指节泛白。',
    dialogue: '', mood: '压抑', emotion: '隐忍', narration: '有些伤,比刀更深。',
    image_prompt: 'extreme close-up, clenched fist, white knuckles, ancient fabric sleeve, dramatic side lighting',
    video_prompt: 'slow clench animation, tension build',
    associations: [{ type: 'character', name: '叶凡', id: 2 }],
  },
  {
    id: 8, episode_id: 1, panel_number: 8, title: '族长收回退婚书', status: 'pending',
    shot_type: '中景', camera_angle: '俯视', camera_movement: '固定', duration: 2.0,
    image_url: '',
    current_version: 0,
    action_description: '族长将退婚书收回袖中,神情恢复平静,仿佛刚才只是一件微不足道的小事。',
    dialogue: '"退下吧,叶凡。"', mood: '冷漠', emotion: '威严', narration: '',
    image_prompt: 'medium shot, elderly man retracting golden scroll into sleeve, dismissive gesture',
    video_prompt: 'steady shot, hand motion, scroll disappear',
    associations: [
      { type: 'character', name: '族长 (萧战)', id: 1 },
      { type: 'prop', name: '退婚书', id: 21 },
    ],
  },
  {
    id: 9, episode_id: 1, panel_number: 9, title: '叶凡转身离去', status: 'pending',
    shot_type: '全景', camera_angle: '平视', camera_movement: '推进', duration: 3.5,
    image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=640&h=360&fit=crop',
    current_version: 0,
    action_description: '叶凡缓缓转身,迈步向大殿出口走去,背影孤独而落寞。四周人群自动让开一条道。',
    dialogue: '', mood: '孤寂', emotion: '坚定', narration: '从今往后,一切皆由自己。',
    image_prompt: 'wide shot, lone figure walking away through parting crowd in palace hall, dramatic backlighting',
    video_prompt: 'slow tracking shot following character, crowd parts, light beams through doorway',
    associations: [
      { type: 'character', name: '叶凡', id: 2 },
      { type: 'location', name: '宗族大殿', id: 10 },
    ],
  },
  {
    id: 10, episode_id: 1, panel_number: 10, title: '宫门外夜色', status: 'pending',
    shot_type: '远景', camera_angle: '平视', camera_movement: '固定', duration: 2.5,
    image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=640&h=360&fit=crop',
    current_version: 0,
    action_description: '宫门缓缓关闭,叶凡独立于门外,仰望夜空繁星。',
    dialogue: '', mood: '旷远', emotion: '迷茫', narration: '',
    image_prompt: 'extreme wide shot, lone figure standing outside palace gates at night, starry sky, atmosphere',
    video_prompt: 'crane shot pulling back, gate closing, stars twinkling',
    associations: [
      { type: 'character', name: '叶凡', id: 2 },
      { type: 'location', name: '宗族门外', id: 12 },
    ],
  },
  {
    id: 11, episode_id: 1, panel_number: 11, title: '闪回：儿时承诺', status: 'pending',
    shot_type: '近景', camera_angle: '平视', camera_movement: '固定', duration: 2.0,
    image_url: 'https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?w=640&h=360&fit=crop',
    current_version: 0,
    action_description: '（闪回）年幼的叶凡与纳兰嫣然在花丛中手拉手,小叶凡笑着说。',
    dialogue: '"嫣然,我以后一定会成为最强的修士保护你！"', mood: '温馨', emotion: '天真', narration: '',
    image_prompt: 'soft focus childhood flashback, two children in flower garden, warm golden light, nostalgic',
    video_prompt: 'warm color grade, gentle handheld, blurry edges vignette',
    associations: [
      { type: 'character', name: '幼年叶凡', id: 4 },
      { type: 'character', name: '幼年嫣然', id: 5 },
    ],
  },
  {
    id: 12, episode_id: 1, panel_number: 12, title: '叶凡抬头', status: 'pending',
    shot_type: '特写', camera_angle: '仰视', camera_movement: '推进', duration: 2.0,
    image_url: '',
    current_version: 0,
    action_description: '叶凡从回忆中抽离,猛然抬起头,眼中原有的茫然逐渐被一丝决然取代。',
    dialogue: '', mood: '转折', emotion: '坚决', narration: '命运的齿轮,从此刻开始转动。',
    image_prompt: 'close-up face looking up, eyes changing from despair to determination, dramatic rim lighting',
    video_prompt: 'slow push in on face, eye lighting change, epic music cue',
    associations: [{ type: 'character', name: '叶凡', id: 2 }],
  },
];

/* Selected panel version history mock */
const MOCK_VERSIONS: PanelVersion[] = [
  {
    id: 31, panel_id: 3, version_number: 3, label: '最终版',
    image_url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=160&h=90&fit=crop',
    prompt: 'masterpiece, highly detailed, fantasy ancient Chinese palace, elder man standing on throne, holding gold scroll, cinematic lighting',
    model_used: 'FLUX.1-dev', inference_time: 4.2, created_at: '2026-03-12T12:30:00Z', is_latest: true,
  },
  {
    id: 30, panel_id: 3, version_number: 2, label: '调色版',
    image_url: 'https://images.unsplash.com/photo-1541698444083-023c97d3f4b6?w=160&h=90&fit=crop',
    prompt: 'ancient Chinese palace, elder man on throne, blue tone, cinematic',
    model_used: 'FLUX.1-dev', inference_time: 3.8, created_at: '2026-03-12T11:15:00Z', is_latest: false,
  },
  {
    id: 29, panel_id: 3, version_number: 1, label: '初稿',
    image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=160&h=90&fit=crop',
    prompt: 'old man throne ancient palace dramatic',
    model_used: 'SD-XL', inference_time: 5.1, created_at: '2026-03-12T09:45:00Z', is_latest: false,
  },
  {
    id: 28, panel_id: 3, version_number: 0, label: '测试',
    image_url: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?w=160&h=90&fit=crop',
    prompt: 'Chinese elder announcement court',
    model_used: 'SD-1.5', inference_time: 6.3, created_at: '2026-03-12T08:00:00Z', is_latest: false,
  },
];

/* Episode meta */
const EPISODE_META = {
  projectTitle: '万古第一废体',
  episodeTitle: '第一集：退婚大典',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function AssocIcon({ type }: { type: PanelAssociation['type'] }) {
  if (type === 'character') return <User className="w-3.5 h-3.5" />;
  if (type === 'location') return <MapPin className="w-3.5 h-3.5" />;
  return <Package className="w-3.5 h-3.5" />;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium text-txt-muted uppercase tracking-wide flex items-center gap-2 mb-3">
      <span className="w-4 h-[2px] bg-accent flex-shrink-0" />
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export default function StoryboardEditor() {
  const { id, eid } = useParams();
  const navigate = useNavigate();

  const [selectedPanelId, setSelectedPanelId] = useState<number>(3);
  const [activeVersionId, setActiveVersionId] = useState<number>(31);
  const [imagePromptOpen, setImagePromptOpen] = useState(false);
  const [videoPromptOpen, setVideoPromptOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const selectedPanel = MOCK_PANELS.find((p) => p.id === selectedPanelId) ?? MOCK_PANELS[0];
  const totalDuration = MOCK_PANELS.reduce((sum, p) => sum + p.duration, 0);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => setIsRegenerating(false), 3000);
  };

  const activeVersion = MOCK_VERSIONS.find((v) => v.id === activeVersionId) ?? MOCK_VERSIONS[0];

  /* Only show versions for the selected (generating) panel */
  const showVersionHistory = selectedPanel.id === 3;

  /* -------------------------------- render -------------------------------- */
  return (
    <AppLayout layout="header-only">
      {/* ── Inner header: nav tabs + actions ── */}
      <div className="flex items-center justify-between border-b border-bdr bg-white px-6 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-6">
          {/* Logo / brand */}
          <div className="flex items-center gap-2 mr-2">
            <Film className="w-5 h-5 text-accent" />
            <span className="font-semibold text-sm text-txt-primary hidden sm:inline">分镜编辑器</span>
          </div>
          {/* Nav tabs */}
          <nav className="hidden md:flex gap-1" aria-label="编辑器导航">
            {[
              { label: '项目', to: `/projects/${id}` },
              { label: '素材库', to: `/projects/${id}/assets` },
              { label: '分镜编辑器', to: `/projects/${id}/episodes/${eid}/storyboard`, active: true },
              { label: '导出', to: '#' },
            ].map((tab) => (
              <Link
                key={tab.label}
                to={tab.to}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  tab.active
                    ? 'border-b-2 border-accent text-accent pb-[5px]'
                    : 'text-txt-secondary hover:text-accent hover:bg-surface-subtle'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索分镜..."
              aria-label="搜索分镜"
              className="bg-surface-subtle border border-bdr rounded-lg pl-9 pr-4 py-1.5 text-sm w-44 focus:ring-1 focus:ring-accent outline-none text-txt-primary placeholder-txt-muted"
            />
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-1.5 bg-txt-primary text-white text-sm font-medium rounded-full transition-colors hover:bg-txt-primary/90"
            aria-label="保存"
          >
            <Save className="w-3.5 h-3.5" />
            保存
          </button>
          <button
            className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted transition-colors"
            aria-label="设置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Main split area (h-screen minus outer header + inner header) ── */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════
            LEFT PANEL — Panel grid / timeline (w-[40%])
        ════════════════════════════════════════════════════ */}
        <aside
          className="w-full lg:w-[40%] lg:min-w-[300px] border-r border-bdr flex flex-col bg-white max-h-[45vh] lg:max-h-none"
          aria-label="分镜列表"
        >
          {/* Breadcrumb + toolbar */}
          <div className="px-4 pt-3 pb-3 border-b border-bdr space-y-3 flex-shrink-0 bg-white">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs text-txt-muted overflow-hidden" aria-label="面包屑">
              <Link to="/projects" className="hover:text-accent transition-colors truncate">
                项目
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link to={`/projects/${id}`} className="hover:text-accent transition-colors truncate">
                {EPISODE_META.projectTitle}
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{EPISODE_META.episodeTitle}</span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-accent font-medium flex-shrink-0">分镜脚本</span>
            </nav>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-light text-accent text-xs font-medium rounded-full transition-colors hover:bg-accent/20"
                  aria-label="自动规划分镜"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  自动规划
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-subtle text-txt-primary text-xs font-medium rounded-full transition-colors hover:bg-bdr"
                  aria-label="插入新分镜"
                >
                  <Plus className="w-3.5 h-3.5" />
                  插入分镜
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-txt-muted">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wide">总分镜</span>
                  <span className="font-medium text-txt-primary">{MOCK_PANELS.length}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] uppercase tracking-wide">总时长</span>
                  <span className="font-medium text-txt-primary">{totalDuration.toFixed(1)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable panel grid */}
          <div className="flex-1 overflow-y-auto lg:overflow-y-auto overflow-x-auto custom-scrollbar p-4 bg-canvas">
            <div className="flex lg:grid lg:grid-cols-2 gap-3" role="listbox" aria-label="分镜面板列表">
              {MOCK_PANELS.map((panel) => {
                const isSelected = panel.id === selectedPanelId;
                const isActiveGenerating = isRegenerating && panel.id === selectedPanelId;
                const isGeneratingStatus = panel.status === 'generating' && !isRegenerating;

                return (
                  <button
                    key={panel.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => setSelectedPanelId(panel.id)}
                    className={`group relative text-left rounded-xl p-2 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent flex-shrink-0 w-40 lg:w-auto ${
                      isSelected
                        ? 'bg-white border-accent ring-2 ring-accent/30'
                        : 'bg-white border-bdr hover:border-accent/60 hover:bg-surface-subtle'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-lg mb-2 overflow-hidden bg-surface-subtle relative">
                      {panel.image_url ? (
                        <img
                          src={panel.image_url}
                          alt={panel.title}
                          className={`w-full h-full object-cover transition-opacity ${
                            isActiveGenerating ? 'opacity-40' : 'opacity-100'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center border border-dashed border-bdr">
                          <ImageIcon className="w-5 h-5 text-txt-muted" />
                        </div>
                      )}

                      {/* Generating overlay */}
                      {(isActiveGenerating || isGeneratingStatus) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]/30">
                          <Loader2 className="w-7 h-7 text-accent animate-spin" />
                        </div>
                      )}

                      {/* Shot-type badge overlay */}
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-accent text-white text-[9px] font-medium rounded">
                        {panel.shot_type}
                      </span>
                    </div>

                    {/* Panel meta */}
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0 flex-1">
                        {/* Number badge */}
                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-accent text-white' : 'bg-accent-light text-accent'
                          }`}
                        >
                          P{panel.panel_number}
                        </span>
                        <p className="text-[11px] mt-1 font-medium text-txt-primary line-clamp-1">
                          {panel.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-txt-muted" />
                          <span className="text-[11px] text-txt-muted">
                            {panel.duration}s
                          </span>
                        </div>
                      </div>

                      {/* Status icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {panel.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-status-completed" aria-label="已完成" />
                        )}
                        {(panel.status === 'generating' || isActiveGenerating) && (
                          <Loader2 className="w-4 h-4 text-accent animate-spin" aria-label="生成中" />
                        )}
                        {panel.status === 'pending' && !isActiveGenerating && (
                          <Clock className="w-4 h-4 text-txt-muted" aria-label="等待中" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════
            RIGHT PANEL — Panel detail editor (flex-1)
        ════════════════════════════════════════════════════ */}
        <main
          className="flex-1 flex flex-col overflow-hidden bg-canvas"
          aria-label="分镜详情编辑器"
        >
          {/* Detail header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-bdr bg-white flex-shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-accent text-white text-xs font-medium rounded-lg">
                P{selectedPanel.panel_number}
              </span>
              <h2 className="font-semibold text-txt-primary text-base">{selectedPanel.title}</h2>
              <StatusBadge status={selectedPanel.status} size="sm" />
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted transition-colors"
                aria-label="复制分镜"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-surface-subtle text-txt-muted hover:text-status-failed transition-colors"
                aria-label="删除分镜"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable detail body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-5 pb-8">

              {/* ── Large preview image ── */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-subtle group">
                {selectedPanel.image_url ? (
                  <img
                    src={
                      showVersionHistory ? activeVersion.image_url : selectedPanel.image_url
                    }
                    alt={selectedPanel.title}
                    className={`w-full h-full object-cover transition-opacity ${
                      isRegenerating ? 'opacity-30' : 'opacity-100'
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-txt-muted">
                    <ImageIcon className="w-14 h-14" />
                    <p className="text-sm">尚未生成图片</p>
                  </div>
                )}

                {/* Regen overlay */}
                {isRegenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1A1A]/30 gap-3">
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-sm text-white font-medium">生成中...</p>
                  </div>
                )}

                {/* Hover controls */}
                {selectedPanel.image_url && !isRegenerating && (
                  <div className="absolute inset-0 bg-[#1A1A1A]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      aria-label="播放"
                    >
                      <Play className="w-6 h-6 text-white" />
                    </button>
                    <button
                      className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      aria-label="全屏"
                    >
                      <Maximize2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}

                {/* Camera badge */}
                {selectedPanel.camera_angle && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A]/60 rounded-lg text-xs text-white">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{selectedPanel.camera_angle}</span>
                  </div>
                )}
              </div>

              {/* ── Action buttons — tight to preview image ── */}
              <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                <button
                  className="flex items-center gap-1.5 px-4 py-1.5 border border-bdr rounded-full text-sm font-medium text-txt-primary transition-colors hover:bg-surface-subtle disabled:opacity-50"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  aria-label="重新生成图片"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? '生成中...' : '重新生成'}
                </button>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-txt-primary text-white text-sm font-medium rounded-full transition-colors hover:bg-txt-primary/90"
                    aria-label="生成视频"
                  >
                    <Video className="w-3.5 h-3.5" />
                    生成视频
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-light text-accent text-sm font-medium rounded-full transition-colors hover:bg-accent/20"
                    aria-label="批准此分镜"
                  >
                    <Check className="w-3.5 h-3.5" />
                    批准
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-4 py-1.5 border border-bdr rounded-full text-sm font-medium text-txt-primary transition-colors hover:bg-surface-subtle"
                    aria-label="试听配音"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    试听配音
                  </button>
                </div>
              </div>

              {/* ── Shot design — generous separation from actions ── */}
              <div className="mt-8">
                <SectionHeading>镜头设计</SectionHeading>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                      景别
                    </label>
                    <select
                      className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent appearance-none"
                      defaultValue={selectedPanel.shot_type}
                    >
                      <option>全景</option>
                      <option>远景</option>
                      <option>中景</option>
                      <option>近景</option>
                      <option>特写</option>
                      <option>大特写</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                      角度
                    </label>
                    <select
                      className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent appearance-none"
                      defaultValue={selectedPanel.camera_angle ?? '平视'}
                    >
                      <option>平视</option>
                      <option>俯视</option>
                      <option>仰视</option>
                      <option>鸟瞰</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                      运镜
                    </label>
                    <select
                      className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent appearance-none"
                      defaultValue={selectedPanel.camera_movement ?? '固定'}
                    >
                      <option>固定</option>
                      <option>推进</option>
                      <option>拉远</option>
                      <option>摇移</option>
                      <option>跟踪</option>
                      <option>环绕</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                      时长
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="30"
                        defaultValue={selectedPanel.duration}
                        aria-label="分镜时长（秒）"
                        className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent pr-7"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-muted font-medium pointer-events-none">
                        s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Panel metadata — tight to shot design (related group) ── */}
              <div className="mt-5">
                <SectionHeading>内容描述</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                        动作描述
                      </label>
                      <textarea
                        className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2.5 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent resize-none"
                        rows={3}
                        defaultValue={selectedPanel.action_description ?? ''}
                        placeholder="描述画面中的动作..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                          氛围
                        </label>
                        <input
                          type="text"
                          className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                          defaultValue={selectedPanel.mood ?? ''}
                          placeholder="如：紧张、温馨"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                          情绪
                        </label>
                        <input
                          type="text"
                          className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                          defaultValue={selectedPanel.emotion ?? ''}
                          placeholder="如：威严、悲伤"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                        对白
                      </label>
                      <textarea
                        className="w-full bg-surface-subtle border-l-4 border-l-accent/50 border border-bdr rounded-lg px-3 py-2.5 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent resize-none italic"
                        rows={3}
                        defaultValue={selectedPanel.dialogue ?? ''}
                        placeholder="无对白..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-txt-muted uppercase tracking-wide block">
                        旁白 / 音效
                      </label>
                      <input
                        type="text"
                        className="w-full bg-surface-subtle border border-bdr rounded-lg px-3 py-2 text-sm text-txt-primary outline-none focus:ring-1 focus:ring-accent"
                        defaultValue={selectedPanel.narration ?? ''}
                        placeholder="描述旁白或特殊音效..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Associations — generous separation (new group) ── */}
              <div className="mt-8">
                <SectionHeading>关联资产</SectionHeading>
                <div className="flex flex-wrap gap-2" role="list" aria-label="关联资产列表">
                  {(selectedPanel.associations ?? []).map((assoc, i) => (
                    <div
                      key={i}
                      role="listitem"
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                        assoc.type === 'character'
                          ? 'bg-accent-light text-accent'
                          : assoc.type === 'location'
                          ? 'bg-status-completed/10 text-status-completed'
                          : 'bg-surface-subtle text-txt-secondary'
                      }`}
                    >
                      <AssocIcon type={assoc.type} />
                      <span>{assoc.name}</span>
                      <button
                        className="hover:text-status-failed transition-colors ml-0.5"
                        aria-label={`移除 ${assoc.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-bdr rounded-full text-xs text-txt-muted font-medium hover:border-accent hover:text-accent transition-colors"
                    aria-label="添加关联资产"
                  >
                    <Plus className="w-3 h-3" />
                    添加关联
                  </button>
                </div>
              </div>

              {/* ── Prompt sections — tight to associations (related) ── */}
              <div className="mt-5 space-y-3">
                {/* Image prompt */}
                <div className="rounded-xl border border-bdr overflow-hidden">
                  <button
                    onClick={() => setImagePromptOpen(!imagePromptOpen)}
                    className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-surface-subtle transition-colors"
                    aria-expanded={imagePromptOpen}
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium uppercase tracking-wider text-txt-primary">
                        图片生成提示词
                      </span>
                    </div>
                    {imagePromptOpen ? (
                      <ChevronUp className="w-4 h-4 text-txt-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-txt-muted" />
                    )}
                  </button>
                  {imagePromptOpen && (
                    <div className="p-4 bg-surface-subtle">
                      <textarea
                        className="w-full bg-white border border-bdr rounded-lg p-3 text-xs text-txt-secondary resize-none focus:ring-1 focus:ring-accent outline-none leading-relaxed font-mono"
                        rows={4}
                        defaultValue={selectedPanel.image_prompt ?? ''}
                        aria-label="图片生成提示词"
                      />
                    </div>
                  )}
                </div>

                {/* Video prompt */}
                <div className="rounded-xl border border-bdr overflow-hidden">
                  <button
                    onClick={() => setVideoPromptOpen(!videoPromptOpen)}
                    className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-surface-subtle transition-colors"
                    aria-expanded={videoPromptOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium uppercase tracking-wider text-txt-primary">
                        视频动作提示词
                      </span>
                    </div>
                    {videoPromptOpen ? (
                      <ChevronUp className="w-4 h-4 text-txt-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-txt-muted" />
                    )}
                  </button>
                  {videoPromptOpen && (
                    <div className="p-4 bg-surface-subtle">
                      <textarea
                        className="w-full bg-white border border-bdr rounded-lg p-3 text-xs text-txt-secondary resize-none focus:ring-1 focus:ring-accent outline-none leading-relaxed font-mono"
                        rows={3}
                        defaultValue={selectedPanel.video_prompt ?? ''}
                        aria-label="视频动作提示词"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Version history strip — generous separation (new major group) ── */}
              {showVersionHistory && (
                <div className="mt-10">
                  <SectionHeading>版本历史</SectionHeading>
                  <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar" role="list" aria-label="版本历史">
                    {MOCK_VERSIONS.map((version) => {
                      const isActive = version.id === activeVersionId;
                      return (
                        <button
                          key={version.id}
                          role="listitem"
                          onClick={() => setActiveVersionId(version.id)}
                          aria-pressed={isActive}
                          aria-label={`版本 ${version.version_number}: ${version.label}`}
                          className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                            isActive
                              ? 'border-accent ring-2 ring-accent/30'
                              : 'border-bdr hover:border-accent/50'
                          }`}
                        >
                          <div className="relative w-32 h-[72px]">
                            <img
                              src={version.image_url}
                              alt={`版本 ${version.version_number}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {isActive && (
                              <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-accent drop-shadow-lg" />
                              </div>
                            )}
                          </div>
                          <div className={`px-2 py-1.5 text-left ${isActive ? 'bg-accent-light' : 'bg-white'}`}>
                            <p className={`text-[11px] font-medium ${isActive ? 'text-accent' : 'text-txt-secondary'}`}>
                              v{version.version_number} · {version.label}
                            </p>
                            <p className="text-[9px] text-txt-muted mt-0.5">{version.model_used}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Continue to next step ── */}
              <div className="mt-8 pt-2 flex justify-end">
                <button
                  className="flex items-center gap-1.5 px-5 py-2 bg-txt-primary text-white text-sm font-medium rounded-full transition-colors hover:bg-txt-primary/90"
                  onClick={() =>
                    navigate(`/projects/${id}/episodes/${eid}/storyboard/panels/${selectedPanel.id}/compare`)
                  }
                >
                  版本对比
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Status footer bar ── */}
      <div className="h-9 border-t border-bdr bg-white flex items-center justify-between px-3 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-4 text-[11px] font-medium text-txt-muted uppercase tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-status-completed" aria-hidden="true" />
            渲染就绪
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            GPU 24%
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] font-medium text-txt-muted uppercase tracking-wide">
          <span>Space 播放</span>
          <span>J / L 跳转</span>
          <span>S 保存</span>
        </div>
      </div>
    </AppLayout>
  );
}
