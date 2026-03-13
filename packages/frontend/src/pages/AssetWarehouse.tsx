import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Tabs from '../components/Tabs';
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import type { Character, Scene } from '../api/types';
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
// Mock data — Characters
// ---------------------------------------------------------------------------

const MOCK_CHARACTERS: CharacterAsset[] = [
  {
    id: 1,
    project_id: 1,
    name: '凌风',
    name_en: 'Ling Feng',
    role_level: '主角',
    gender: '男',
    age: 22,
    height: '182cm',
    base_appearance: 'young male, sword cultivator, long black hair tied up, sharp eyes',
    bio: '苍玄宗的天才弟子，自幼孤苦，在剑道上展现出惊人的天赋。性格沉稳内敛，但内心热血。经历了师门变故后踏上了寻找真相的道路。',
    profile_image_url:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=300&fit=crop',
    appearances: 48,
    updated_at: '2小时前',
    status: 'active',
    tags: ['主角', '剑修', '苍玄宗'],
  },
  {
    id: 2,
    project_id: 1,
    name: '苏瑶',
    name_en: 'Su Yao',
    role_level: '主角',
    gender: '女',
    age: 20,
    height: '168cm',
    base_appearance: 'young female, ice mage, elegant white robes, cool expression',
    bio: '冰灵宗首席弟子，精通冰系法术。外表冷艳高贵，实际上心地善良。与凌风在一次偶然中相遇，两人命运从此交织。',
    profile_image_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    appearances: 36,
    updated_at: '5小时前',
    status: 'active',
    tags: ['主角', '冰系', '冰灵宗'],
  },
  {
    id: 3,
    project_id: 1,
    name: '墨渊',
    name_en: 'Mo Yuan',
    role_level: '配角',
    gender: '男',
    age: 35,
    height: '190cm',
    base_appearance: 'tall male, dark robes, mysterious aura, scarred face',
    bio: '身世成谜，据传曾是正道高手，后因未知原因叛离，建立了暗影组织。实力深不可测。',
    profile_image_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    appearances: 15,
    updated_at: '1天前',
    status: 'in_progress',
    tags: ['配角', '反派', '暗影组织'],
  },
  {
    id: 4,
    project_id: 1,
    name: '小白',
    name_en: 'Xiao Bai',
    role_level: '配角',
    gender: '男',
    age: 16,
    height: '165cm',
    base_appearance: 'young teen male, casual attire, bright eyes, cheerful smile',
    bio: '凌风在旅途中收留的少年，性格活泼开朗，虽然修为不高，但总能在关键时刻发挥意想不到的作用。',
    profile_image_url:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=300&fit=crop',
    appearances: 28,
    updated_at: '2天前',
    status: 'draft',
    tags: ['配角', '搞笑担当'],
  },
  {
    id: 5,
    project_id: 1,
    name: '云霜',
    name_en: 'Yun Shuang',
    role_level: '龙套',
    gender: '女',
    age: 18,
    height: '162cm',
    base_appearance: 'young female, apprentice robe, nervous expression',
    bio: '苍玄宗的普通弟子，在第一集中为凌风指路，仅有两幕戏份。',
    profile_image_url:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=300&fit=crop',
    appearances: 2,
    updated_at: '3天前',
    status: 'completed',
    tags: ['龙套'],
  },
  {
    id: 6,
    project_id: 1,
    name: '铁山',
    name_en: 'Tie Shan',
    role_level: '配角',
    gender: '男',
    age: 45,
    height: '195cm',
    base_appearance: 'massive male, bald, battle-scarred armor, heavy weapon',
    bio: '暗影组织的守门人，力量型战士，忠心护卫墨渊。曾与凌风有过一次激烈交手。',
    profile_image_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop',
    appearances: 8,
    updated_at: '4天前',
    status: 'not_started',
    tags: ['配角', '武力担当', '暗影组织'],
  },
  {
    id: 7,
    project_id: 1,
    name: '离尘',
    name_en: 'Li Chen',
    role_level: '龙套',
    gender: '男',
    age: 60,
    height: '170cm',
    base_appearance: 'elderly male, white beard, kind eyes, sage robes',
    bio: '收留凌风的老长老，在第二集受伤退场，是凌风踏上旅途的直接契机。',
    profile_image_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    thumbnail_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop',
    appearances: 4,
    updated_at: '5天前',
    status: 'completed',
    tags: ['龙套', '师门', '苍玄宗'],
  },
];

// ---------------------------------------------------------------------------
// Mock data — Scenes
// ---------------------------------------------------------------------------

const MOCK_SCENES: SceneAsset[] = [
  {
    id: 1,
    project_id: 1,
    name: '苍玄宗山门',
    view_grade: '远景',
    description: '群山环抱中的宗门大门，云雾缭绕，气势磅礴，是主角第一次离开家园的出发地。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400&h=300&fit=crop',
    status: 'completed',
    tags: ['室外', '远景', '开篇场景'],
  },
  {
    id: 2,
    project_id: 1,
    name: '练剑场',
    view_grade: '近景',
    description: '宗门内部的修炼广场，铺着青石砖，木制人形靶散落四周，剑气留痕随处可见。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
    status: 'active',
    tags: ['室内外', '战斗场景'],
  },
  {
    id: 3,
    project_id: 1,
    name: '暗影组织密道',
    view_grade: '特写',
    description: '地下石道，壁上悬挂的火把投下忽明忽暗的红光，暗格中藏有各种机关。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=400&h=300&fit=crop',
    status: 'in_progress',
    tags: ['室内', '反派据点', '黑暗氛围'],
  },
  {
    id: 4,
    project_id: 1,
    name: '千年古战场',
    view_grade: '远景',
    description: '荒芜平原上遗留的断剑残甲，天空中乌云压顶，是凌风与墨渊最终对决的地点。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop',
    status: 'draft',
    tags: ['室外', '高潮场景', '决战地点'],
  },
  {
    id: 5,
    project_id: 1,
    name: '冰灵宗议事殿',
    view_grade: '近景',
    description: '以冰晶为建材的宏伟殿堂，常年不化，殿中布置着冰雕装饰和悬浮的灵晶阵法。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=400&h=300&fit=crop',
    status: 'not_started',
    tags: ['室内', '冰系', '冰灵宗'],
  },
  {
    id: 6,
    project_id: 1,
    name: '集市小巷',
    view_grade: '近景',
    description: '凡人世界的繁华街市，人声鼎沸，摊贩林立，是主角与小白相遇的地方。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    status: 'completed',
    tags: ['室外', '日常场景', '市井'],
  },
  {
    id: 7,
    project_id: 1,
    name: '悬崖峭壁',
    view_grade: '远景',
    description: '连绵险峰之间的一处断崖，凌风在此习得第一门剑法，风景雄壮险峻。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    status: 'active',
    tags: ['室外', '修炼场景'],
  },
  {
    id: 8,
    project_id: 1,
    name: '地下藏经阁',
    view_grade: '特写',
    description: '苍玄宗深处秘密藏经阁，存放着失传千年的古籍，是故事核心秘密的关键场所。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    status: 'in_progress',
    tags: ['室内', '剧情关键地点'],
  },
];

// ---------------------------------------------------------------------------
// Mock data — Props
// ---------------------------------------------------------------------------

const MOCK_PROPS: PropAsset[] = [
  {
    id: 1,
    project_id: 1,
    name: '无名古剑',
    category: '武器',
    description: '凌风随身携带的一把古老长剑，剑身布满细小裂纹，却极为锋利，来历不明。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    status: 'active',
    tags: ['武器', '主角专属', '剑'],
  },
  {
    id: 2,
    project_id: 1,
    name: '冰灵玉佩',
    category: '配件',
    description: '苏瑶佩戴的家传玉佩，由千年寒玉雕刻而成，内蕴冰系灵力。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    status: 'completed',
    tags: ['配件', '主角专属', '冰系'],
  },
  {
    id: 3,
    project_id: 1,
    name: '暗影令牌',
    category: '道具',
    description: '暗影组织成员的身份证明，黑色金属材质，刻有暗影组织的标志图案。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1611605698335-8441051253e0?w=400&h=300&fit=crop',
    status: 'draft',
    tags: ['道具', '暗影组织', '身份道具'],
  },
  {
    id: 4,
    project_id: 1,
    name: '苍玄宗宗服',
    category: '服装',
    description: '苍玄宗弟子的统一服装，青蓝配色，绣有宗门图腾，分内门外门两款。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop',
    status: 'active',
    tags: ['服装', '苍玄宗'],
  },
  {
    id: 5,
    project_id: 1,
    name: '灵兽幼崽',
    category: '生物',
    description: '小白从市集救下的受伤灵兽幼崽，外形似虎，身有云纹，偶尔在搞笑场景中出镜。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop',
    status: 'not_started',
    tags: ['生物', '喜剧道具'],
  },
  {
    id: 6,
    project_id: 1,
    name: '古籍密典',
    category: '道具',
    description: '藏经阁中存放的关键古籍，记载着上古大战的真相，是整个故事的核心麦高芬。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    status: 'in_progress',
    tags: ['道具', '剧情关键道具'],
  },
  {
    id: 7,
    project_id: 1,
    name: '破损面具',
    category: '配件',
    description: '墨渊早年戴过的白色面具，其中一半已破碎，是他过去身份的象征物。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=300&fit=crop',
    status: 'completed',
    tags: ['配件', '墨渊专属', '暗影组织'],
  },
  {
    id: 8,
    project_id: 1,
    name: '灵石袋',
    category: '道具',
    description: '修仙世界通用货币灵石的储存袋，频繁出现在交易场景中，有大中小三种规格。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop',
    status: 'active',
    tags: ['道具', '通用道具'],
  },
  {
    id: 9,
    project_id: 1,
    name: '飞剑',
    category: '武器',
    description: '修仙界常见的御剑飞行法器，多次出现在追逐和逃脱场景中。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1604158312642-ef2a11cb8e4e?w=400&h=300&fit=crop',
    status: 'draft',
    tags: ['武器', '飞行道具'],
  },
  {
    id: 10,
    project_id: 1,
    name: '苍玄宗令牌',
    category: '道具',
    description: '苍玄宗的身份证明令牌，玉质金边，是进出宗门重要区域的凭证。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=400&h=300&fit=crop',
    status: 'completed',
    tags: ['道具', '苍玄宗', '身份道具'],
  },
  {
    id: 11,
    project_id: 1,
    name: '药鼎',
    category: '道具',
    description: '苍玄宗炼药堂的大型炼丹鼎炉，青铜材质，上雕盘龙，偶尔出现在炼丹场景中。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1581077968324-42db3e565099?w=400&h=300&fit=crop',
    status: 'not_started',
    tags: ['道具', '炼丹', '苍玄宗'],
  },
  {
    id: 12,
    project_id: 1,
    name: '战旗',
    category: '道具',
    description: '千年古战场残留的战旗碎片，在决战场景的远景镜头中作为背景道具使用。',
    thumbnail_url:
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    status: 'draft',
    tags: ['道具', '背景道具', '高潮场景'],
  },
];

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
        className="p-0 overflow-hidden flex flex-col md:flex-row bg-white rounded-[24px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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
      className="p-0 overflow-hidden flex flex-col bg-white rounded-[24px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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
      className="p-0 overflow-hidden flex flex-col bg-white rounded-[24px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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
      className="p-0 overflow-hidden flex flex-col bg-white rounded-[24px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
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
      className="min-h-[240px] flex flex-col items-center justify-center gap-3 border-2 border-dashed border-bdr rounded-[24px]"
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
  const { id: _projectId } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValue, setFilterValue] = useState('全部');

  // Reset search + filter whenever the tab changes
  function handleTabChange(tab: string) {
    setActiveTab(tab as ActiveTab);
    setFilterValue('全部');
    setSearchQuery('');
  }

  // ----- Filtered lists -----

  const filteredCharacters = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_CHARACTERS.filter((c) => {
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
  }, [searchQuery, filterValue]);

  const filteredScenes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_SCENES.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.includes(searchQuery) ||
        (s.description ?? '').toLowerCase().includes(q);
      const matchesFilter = filterValue === '全部' || s.view_grade === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterValue]);

  const filteredProps = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return MOCK_PROPS.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.includes(searchQuery) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.category.includes(searchQuery);
      const matchesFilter = filterValue === '全部' || p.category === filterValue;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterValue]);

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
      ? MOCK_CHARACTERS.length
      : activeTab === 'scenes'
      ? MOCK_SCENES.length
      : MOCK_PROPS.length;

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
            <div className="min-w-0 hidden sm:block">
              <h1 className="text-lg font-semibold text-txt-primary leading-tight">资产仓库</h1>
              <p className="text-xs text-txt-muted leading-tight">角色 · 场景 · 道具</p>
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
                count: MOCK_CHARACTERS.length,
                icon: <User className="w-4 h-4" aria-hidden="true" />,
              },
              {
                id: 'scenes',
                label: '场景',
                count: MOCK_SCENES.length,
                icon: <MapPin className="w-4 h-4" aria-hidden="true" />,
              },
              {
                id: 'props',
                label: '道具',
                count: MOCK_PROPS.length,
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
      <main className="flex-1 overflow-y-auto px-6 py-6">
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

        {/* Results summary bar */}
        <div
          className="mb-4 text-xs text-txt-secondary flex items-center gap-1.5"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCharacters.map((char, index) => {
                  const isFeatured = char.role_level === '主角';
                  return (
                    <div key={char.id} className={`animate-fade-in-up${isFeatured ? ' md:col-span-2' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                      <CharacterCard char={char} isFeatured={isFeatured} />
                    </div>
                  );
                })}
                <CreateNewCard label="新建角色" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredScenes.map((scene, index) => (
                  <div key={scene.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <SceneCard scene={scene} />
                  </div>
                ))}
                <CreateNewCard label="新建场景" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProps.map((prop, index) => (
                  <div key={prop.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <PropCard prop={prop} />
                  </div>
                ))}
                <CreateNewCard label="新建道具" />
              </div>
            )}
          </section>
        )}
      </main>
    </AppLayout>
  );
}
