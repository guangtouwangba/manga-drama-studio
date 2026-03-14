import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import type { Character, Scene } from '../api/types';
import { listCharacters, createCharacter } from '../api/characters';
import { listScenes, createScene } from '../api/scenes';
import { listProps, createProp } from '../api/props';
import {
  Plus,
  Search,
  Filter,
  User,
  MapPin,
  Package,
  ChevronDown,
  Eye,
  Clock,
  Ruler,
  UserRound,
  Camera,
  Tag,
  Sword,
  Loader2,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Extended local types
// ---------------------------------------------------------------------------

type CharacterAsset = Character & { status: string; tags: string[] };
type SceneAsset = Scene & { status: string; tags: string[] };

interface PropAsset {
  id: number;
  project_id: number;
  name: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  status: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Filter option lists
// ---------------------------------------------------------------------------

const CHARACTER_FILTERS = ['全部', '主角', '配角', '龙套', '男', '女'];
const SCENE_FILTERS = ['全部', '远景', '近景', '特写'];
const PROP_FILTERS = ['全部', '武器', '配件', '服装', '道具', '生物'];

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

function RoleLevelBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    主角: 'bg-accent-light text-accent border-accent/20',
    配角: 'bg-status-waiting/10 text-status-waiting border-status-waiting/20',
    龙套: 'bg-surface-subtle text-txt-muted border-bdr',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${
        styles[level] ?? styles['龙套']
      }`}
    >
      {level}
    </span>
  );
}

function ViewGradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    远景: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    近景: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    特写: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${
        styles[grade] ?? 'bg-surface-subtle text-txt-muted border-bdr'
      }`}
    >
      {grade}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Asset card — Character
// ---------------------------------------------------------------------------

function CharacterCard({ char, isFeatured = false }: { char: CharacterAsset; isFeatured?: boolean }) {
  if (isFeatured) {
    return (
      <Card
        variant="interactive"
        className="p-0 overflow-hidden flex flex-col md:flex-row bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
        tabIndex={0}
        role="article"
        aria-label={`角色：${char.name}`}
      >
        {/* Thumbnail — left 40% on md+ */}
        <div className="relative aspect-[4/3] md:aspect-auto md:w-[40%] overflow-hidden bg-surface-subtle shrink-0">
          <img
            src={char.thumbnail_url}
            alt={`${char.name} 角色缩略图`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2">
            <StatusBadge status={char.status} size="sm" />
          </div>
          <div className="absolute top-2 left-2">
            <RoleLevelBadge level={char.role_level} />
          </div>
        </div>

        {/* Body — right 60% on md+ */}
        <div className="p-4 md:p-5 flex flex-col gap-2 flex-1 md:w-[60%]">
          {/* Name row */}
          <div>
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-semibold text-txt-primary text-base truncate">{char.name}</h3>
              <span className="text-xs text-txt-muted shrink-0 truncate">{char.name_en}</span>
            </div>
            <p className="text-xs text-txt-secondary mt-1.5 line-clamp-3 leading-relaxed">
              {char.bio}
            </p>
          </div>

          {/* Meta pills */}
          <div className="flex items-center gap-3 text-[11px] text-txt-muted mt-auto pt-1">
            <span className="flex items-center gap-1">
              <UserRound className="w-3 h-3" aria-hidden="true" />
              {char.gender}
            </span>
            {char.age !== undefined && (
              <span className="flex items-center gap-1">
                {char.age} 岁
              </span>
            )}
            {char.height && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3" aria-hidden="true" />
                {char.height}
              </span>
            )}
            {char.appearances !== undefined && (
              <span className="flex items-center gap-1 ml-auto shrink-0">
                <Eye className="w-3 h-3" aria-hidden="true" />
                {char.appearances} 次
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {char.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-subtle text-txt-muted text-[11px] rounded"
              >
                <Tag className="w-2.5 h-2.5" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>

          {/* Footer timestamp */}
          {char.updated_at && (
            <div className="text-[11px] text-txt-muted flex items-center gap-1 pt-2 border-t border-bdr">
              <Clock className="w-2.5 h-2.5" aria-hidden="true" />
              更新于 {char.updated_at}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="interactive"
      className="p-0 overflow-hidden flex flex-col bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      tabIndex={0}
      role="article"
      aria-label={`角色：${char.name}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle shrink-0">
        <img
          src={char.thumbnail_url}
          alt={`${char.name} 角色缩略图`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={char.status} size="sm" />
        </div>
        <div className="absolute top-2 left-2">
          <RoleLevelBadge level={char.role_level} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Name row */}
        <div>
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-txt-primary text-sm truncate">{char.name}</h3>
            <span className="text-[11px] text-txt-muted shrink-0 truncate">{char.name_en}</span>
          </div>
          <p className="text-xs text-txt-secondary mt-1 line-clamp-2 leading-relaxed">
            {char.bio}
          </p>
        </div>

        {/* Meta pills */}
        <div className="flex items-center gap-3 text-[11px] text-txt-muted mt-auto pt-1">
          <span className="flex items-center gap-1">
            <UserRound className="w-3 h-3" aria-hidden="true" />
            {char.gender}
          </span>
          {char.age !== undefined && (
            <span className="flex items-center gap-1">
              {char.age} 岁
            </span>
          )}
          {char.height && (
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3" aria-hidden="true" />
              {char.height}
            </span>
          )}
          {char.appearances !== undefined && (
            <span className="flex items-center gap-1 ml-auto shrink-0">
              <Eye className="w-3 h-3" aria-hidden="true" />
              {char.appearances} 次
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {char.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-subtle text-txt-muted text-[11px] rounded"
            >
              <Tag className="w-2.5 h-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>

        {/* Footer timestamp */}
        {char.updated_at && (
          <div className="text-[11px] text-txt-muted flex items-center gap-1 pt-2 border-t border-bdr">
            <Clock className="w-2.5 h-2.5" aria-hidden="true" />
            更新于 {char.updated_at}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Asset card — Scene
// ---------------------------------------------------------------------------

function SceneCard({ scene }: { scene: SceneAsset }) {
  const isWideShot = scene.view_grade === '远景';

  return (
    <Card
      variant="interactive"
      className="p-0 overflow-hidden flex flex-col bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      tabIndex={0}
      role="article"
      aria-label={`场景：${scene.name}`}
    >
      {/* Thumbnail — wider aspect for 远景 (wide shot) scenes */}
      <div className={`relative overflow-hidden bg-surface-subtle shrink-0 ${isWideShot ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
        {scene.thumbnail_url ? (
          <img
            src={scene.thumbnail_url}
            alt={`${scene.name} 场景缩略图`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-12 h-12 text-txt-muted" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={scene.status} size="sm" />
        </div>
        <div className="absolute top-2 left-2">
          <ViewGradeBadge grade={scene.view_grade} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-txt-primary text-sm truncate">{scene.name}</h3>
          {scene.description && (
            <p className="text-xs text-txt-secondary mt-1 line-clamp-2 leading-relaxed">
              {scene.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-txt-muted mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Camera className="w-3 h-3" aria-hidden="true" />
            {scene.view_grade}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {scene.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-subtle text-txt-muted text-[11px] rounded"
            >
              <Tag className="w-2.5 h-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Asset card — Prop
// ---------------------------------------------------------------------------

function PropCard({ prop }: { prop: PropAsset }) {
  return (
    <Card
      variant="interactive"
      className="p-0 overflow-hidden flex flex-col bg-white rounded-xl hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
      tabIndex={0}
      role="article"
      aria-label={`道具：${prop.name}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle shrink-0">
        {prop.thumbnail_url ? (
          <img
            src={prop.thumbnail_url}
            alt={`${prop.name} 道具缩略图`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-txt-muted" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={prop.status} size="sm" />
        </div>
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border bg-white text-txt-secondary border-bdr">
            {prop.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-txt-primary text-sm truncate">{prop.name}</h3>
          {prop.description && (
            <p className="text-xs text-txt-secondary mt-1 line-clamp-2 leading-relaxed">
              {prop.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-txt-muted mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Sword className="w-3 h-3" aria-hidden="true" />
            {prop.category}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {prop.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-subtle text-txt-muted text-[11px] rounded"
            >
              <Tag className="w-2.5 h-2.5" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create-new dashed card
// ---------------------------------------------------------------------------

function CreateNewCard({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Card
      variant="dashed"
      className="min-h-[240px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-bdr rounded-xl"
      tabIndex={0}
      role="button"
      aria-label={label}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className="w-12 h-12 rounded-full bg-accent-light border border-accent/20 flex items-center justify-center">
        <Plus className="w-6 h-6 text-accent" aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-txt-muted">{label}</span>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Create-asset modal
// ---------------------------------------------------------------------------

interface CreateAssetModalProps {
  activeTab: ActiveTab;
  projectId: number;
  onClose: () => void;
  onCreated: () => void;
}

function CreateAssetModal({ activeTab, projectId, onClose, onCreated }: CreateAssetModalProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [viewGrade, setViewGrade] = useState('远景');
  const [category, setCategory] = useState('武器');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const titleMap: Record<ActiveTab, string> = {
    characters: '新建角色',
    scenes: '新建场景',
    props: '新建道具',
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('请填写名称');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (activeTab === 'characters') {
        await createCharacter(projectId, { name: name.trim(), name_en: nameEn.trim() });
      } else if (activeTab === 'scenes') {
        await createScene(projectId, { name: name.trim(), view_grade: viewGrade });
      } else {
        await createProp(projectId, { name: name.trim(), category });
      }
      onCreated();
      onClose();
    } catch {
      setError('创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/30 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label={titleMap[activeTab]}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.08)] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading text-txt-primary">{titleMap[activeTab]}</h2>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full flex items-center justify-center text-txt-muted hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name — shared across all tabs */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="asset-name" className="text-sm font-medium text-txt-secondary">
              名称 <span className="text-status-failed" aria-hidden="true">*</span>
            </label>
            <input
              id="asset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                activeTab === 'characters' ? '例：叶云舟' :
                activeTab === 'scenes' ? '例：古镇街道' :
                '例：龙泉宝剑'
              }
              autoFocus
              className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
            />
          </div>

          {/* Characters: English name */}
          {activeTab === 'characters' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="asset-name-en" className="text-sm font-medium text-txt-secondary">
                英文名
              </label>
              <input
                id="asset-name-en"
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="例：Ye Yunzhou"
                className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
              />
            </div>
          )}

          {/* Scenes: view grade */}
          {activeTab === 'scenes' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="asset-view-grade" className="text-sm font-medium text-txt-secondary">
                景别
              </label>
              <select
                id="asset-view-grade"
                value={viewGrade}
                onChange={(e) => setViewGrade(e.target.value)}
                className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="远景">远景</option>
                <option value="近景">近景</option>
                <option value="特写">特写</option>
              </select>
            </div>
          )}

          {/* Props: category */}
          {activeTab === 'props' && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="asset-category" className="text-sm font-medium text-txt-secondary">
                分类
              </label>
              <select
                id="asset-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none appearance-none cursor-pointer"
              >
                <option value="武器">武器</option>
                <option value="配件">配件</option>
                <option value="服装">服装</option>
                <option value="道具">道具</option>
                <option value="生物">生物</option>
              </select>
            </div>
          )}

          {/* Inline error */}
          {error && (
            <p className="text-sm text-status-failed" role="alert">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={submitting}>
              取消
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  创建中…
                </span>
              ) : '创建'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter dropdown
// ---------------------------------------------------------------------------

function FilterDropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`当前筛选：${value}`}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-bdr text-sm text-txt-secondary hover:border-accent/40 transition-colors"
      >
        <Filter className="w-4 h-4 text-txt-muted" aria-hidden="true" />
        <span className="hidden sm:inline">{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-txt-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            aria-label="筛选选项"
            className="absolute right-0 top-full mt-1 z-20 min-w-[8rem] bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden py-1"
          >
            {options.map((opt) => (
              <li key={opt} role="option" aria-selected={opt === value}>
                <button
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    opt === value
                      ? 'text-accent bg-accent-light'
                      : 'text-txt-secondary hover:bg-surface-subtle'
                  }`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-txt-muted"
      role="status"
      aria-live="polite"
    >
      <Package className="w-14 h-14 mb-4 opacity-20" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

type ActiveTab = 'characters' | 'scenes' | 'props';

export default function AssetWarehouse() {
  // Project id from route /projects/:id/assets
  const { id: projectId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('全部');

  const [characters, setCharacters] = useState<CharacterAsset[]>([]);
  const [scenes, setScenes] = useState<SceneAsset[]>([]);
  const [props, setProps] = useState<PropAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  function loadAssets(pid: number) {
    setLoading(true);
    Promise.all([
      listCharacters(pid).then(res => res.data).catch(() => []),
      listScenes(pid).then(res => res.data).catch(() => []),
      listProps(pid).then(res => res.data).catch(() => []),
    ]).then(([chars, scns, prps]) => {
      // Map API response to local types (add status/tags fields for UI compatibility)
      setCharacters(chars.map((c: any) => ({
        ...c,
        status: 'active',
        tags: [c.role_level, ...(c.visual_keywords || [])].filter(Boolean),
        bio: c.personality || c.base_appearance,
        age: undefined,
        height: undefined,
        appearances: c.appearances?.length ?? 0,
        thumbnail_url: c.reference_image || undefined,
        profile_image_url: c.reference_image || undefined,
      })));
      setScenes(scns.map((s: any) => ({
        ...s,
        status: 'active',
        tags: [s.view_grade].filter(Boolean),
        thumbnail_url: undefined,
      })));
      setProps(prps.map((p: any) => ({
        ...p,
        status: 'active',
        tags: [p.category, ...(p.visual_keywords || [])].filter(Boolean),
        thumbnail_url: undefined,
      })));
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!projectId) return;
    loadAssets(Number(projectId));
  }, [projectId]);

  // Reset search + filter whenever the tab changes
  function handleTabChange(tab: string) {
    setActiveTab(tab as ActiveTab);
    setFilterValue('全部');
    setSearchQuery('');
  }

  // ----- Filtered lists -----

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return characters.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.includes(searchQuery) ||
        c.name_en.toLowerCase().includes(q) ||
        (c.bio ?? '').toLowerCase().includes(q);
      const matchesFilter =
        filterValue === '全部' ||
        c.role_level === filterValue ||
        c.gender === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterValue, characters]);

  const filteredScenes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return scenes.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.includes(searchQuery) ||
        (s.description ?? '').toLowerCase().includes(q);
      const matchesFilter = filterValue === '全部' || s.view_grade === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterValue, scenes]);

  const filteredProps = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return props.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.includes(searchQuery) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.category.includes(searchQuery);
      const matchesFilter = filterValue === '全部' || p.category === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterValue, props]);

  const currentFilterOptions =
    activeTab === 'characters'
      ? CHARACTER_FILTERS
      : activeTab === 'scenes'
      ? SCENE_FILTERS
      : PROP_FILTERS;

  const newAssetLabel =
    activeTab === 'characters' ? '新建角色' : activeTab === 'scenes' ? '新建场景' : '新建道具';

  const resultCount =
    activeTab === 'characters'
      ? filteredCharacters.length
      : activeTab === 'scenes'
      ? filteredScenes.length
      : filteredProps.length;

  const totalCount =
    activeTab === 'characters'
      ? characters.length
      : activeTab === 'scenes'
      ? scenes.length
      : props.length;

  const unitLabel =
    activeTab === 'characters' ? '个角色' : activeTab === 'scenes' ? '个场景' : '个道具';

  return (
    <AppLayout layout="sidebar" sidebarContext="project">
      {/* ------------------------------------------------------------------ */}
      {/* Sticky page header                                                   */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-10 bg-white border-b border-bdr">
        {/* Title + controls row */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-lg bg-accent-light border border-accent/20 flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Package className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-txt-primary leading-tight">资产仓库</h1>
              <p className="text-xs text-txt-muted leading-tight hidden sm:block">角色 · 场景 · 道具</p>
            </div>
          </div>

          {/* Right: search + filter + create */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search — hidden on very small screens */}
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="搜索资产"
                placeholder="搜索资产..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-bdr rounded-xl pl-9 pr-4 py-2 text-sm w-44 focus:w-56 transition-all focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-txt-primary placeholder-txt-muted"
              />
            </div>

            <FilterDropdown
              options={currentFilterOptions}
              value={filterValue}
              onChange={setFilterValue}
            />

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" aria-hidden="true" />}
              aria-label={newAssetLabel}
              onClick={() => setShowCreateModal(true)}
            >
              <span className="hidden sm:inline">{newAssetLabel}</span>
            </Button>
          </div>
        </div>

        {/* Tabs row */}
        <div className="px-6">
          <Tabs
            tabs={[
              {
                id: 'characters',
                label: '角色',
                count: characters.length,
                icon: <User className="w-4 h-4" aria-hidden="true" />,
              },
              {
                id: 'scenes',
                label: '场景',
                count: scenes.length,
                icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
              },
              {
                id: 'props',
                label: '道具',
                count: props.length,
                icon: <Package className="w-4 h-4" aria-hidden="true" />,
              },
            ]}
            activeId={activeTab}
            onChange={handleTabChange}
            variant="underline"
          />
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                              */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-1 overflow-y-auto px-6 pt-3 pb-6">
        {/* Mobile search */}
        <div className="sm:hidden mb-4 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="搜索资产"
            placeholder="搜索资产..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-bdr rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none text-txt-primary placeholder-txt-muted"
          />
        </div>

        {/* Loading state */}
        {loading ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-txt-muted"
            role="status"
            aria-live="polite"
            aria-label="正在加载资产"
          >
            <Loader2 className="w-10 h-10 mb-3 animate-spin opacity-40" aria-hidden="true" />
            <p className="text-sm">正在加载...</p>
          </div>
        ) : (
          <>
            {/* Results summary bar */}
            <div
              className="mb-3 text-xs text-txt-secondary flex items-center gap-1.5"
              aria-live="polite"
              aria-atomic="true"
            >
              <span>
                共 {resultCount}{resultCount !== totalCount ? `/${totalCount}` : ''} {unitLabel}
              </span>
              {filterValue !== '全部' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>筛选：{filterValue}</span>
                  <button
                    onClick={() => setFilterValue('全部')}
                    className="text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-accent rounded"
                    aria-label="清除筛选条件"
                  >
                    清除
                  </button>
                </>
              )}
              {searchQuery && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>搜索："{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-accent rounded"
                    aria-label="清除搜索内容"
                  >
                    清除
                  </button>
                </>
              )}
            </div>

            {/* ---- Characters grid ---- */}
            {activeTab === 'characters' && (
              <section aria-label="角色资产列表">
                {filteredCharacters.length === 0 ? (
                  <EmptyState label="没有符合条件的角色" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredCharacters.map((char) => {
                      const isFeatured = char.role_level === '主角';
                      return (
                        <div key={char.id} className={isFeatured ? 'md:col-span-2' : ''}>
                          <CharacterCard char={char} isFeatured={isFeatured} />
                        </div>
                      );
                    })}
                    <CreateNewCard label="新建角色" onClick={() => setShowCreateModal(true)} />
                  </div>
                )}
              </section>
            )}

            {/* ---- Scenes grid ---- */}
            {activeTab === 'scenes' && (
              <section aria-label="场景资产列表">
                {filteredScenes.length === 0 ? (
                  <EmptyState label="没有符合条件的场景" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredScenes.map((scene) => (
                      <div key={scene.id}>
                        <SceneCard scene={scene} />
                      </div>
                    ))}
                    <CreateNewCard label="新建场景" onClick={() => setShowCreateModal(true)} />
                  </div>
                )}
              </section>
            )}

            {/* ---- Props grid ---- */}
            {activeTab === 'props' && (
              <section aria-label="道具资产列表">
                {filteredProps.length === 0 ? (
                  <EmptyState label="没有符合条件的道具" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredProps.map((prop) => (
                      <div key={prop.id}>
                        <PropCard prop={prop} />
                      </div>
                    ))}
                    <CreateNewCard label="新建道具" onClick={() => setShowCreateModal(true)} />
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* Create-asset modal */}
      {showCreateModal && projectId && (
        <CreateAssetModal
          activeTab={activeTab}
          projectId={Number(projectId)}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => loadAssets(Number(projectId))}
        />
      )}
    </AppLayout>
  );
}
