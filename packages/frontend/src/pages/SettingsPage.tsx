/**
 * SettingsPage.tsx
 *
 * Global application settings page for the AI manga production platform.
 * Persists all settings to localStorage under the key "manga-drama-settings".
 *
 * Usage:
 *   <Route path="/settings" element={<SettingsPage />} />
 */

import { useState, useCallback, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import { getProviders, updateProvider, testConnection } from '../api/providers';
import type { ProviderConfig } from '../api/types';
import {
  User,
  Monitor,
  Bell,
  HardDrive,
  ChevronRight,
  Save,
  X,
  Cpu,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SettingsForm {
  username: string;
  email: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  sidebarDefault: 'expanded' | 'collapsed';
  notifyGenComplete: boolean;
  notifyBudgetWarning: boolean;
  notifySystemUpdate: boolean;
  notifyEmail: boolean;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const defaultSettings: SettingsForm = {
  username: 'Studio User',
  email: '',
  language: 'zh-CN',
  theme: 'light',
  sidebarDefault: 'expanded',
  notifyGenComplete: true,
  notifyBudgetWarning: true,
  notifySystemUpdate: false,
  notifyEmail: false,
};

const STORAGE_KEY = 'manga-drama-settings';

function loadSettings(): SettingsForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch {
    // Corrupted data — fall back to defaults
  }
  return { ...defaultSettings };
}

// ---------------------------------------------------------------------------
// Shared input class (light theme) — matches ProjectSetup
// ---------------------------------------------------------------------------

const inputClass =
  'w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none';

const selectClass =
  inputClass + ' appearance-none cursor-pointer';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-txt-primary text-base flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {description && (
        <p className="text-xs text-txt-muted mt-0.5">{description}</p>
      )}
    </div>
  );
}

function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-txt-secondary">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-txt-muted">{hint}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-accent' : 'bg-bdr'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Notification Row
// ---------------------------------------------------------------------------

function NotificationRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-txt-primary">{label}</p>
        {description && (
          <p className="text-xs text-txt-muted mt-0.5">{description}</p>
        )}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Theme Pill Tabs
// ---------------------------------------------------------------------------

function ThemePills({
  value,
  onChange,
}: {
  value: 'light' | 'dark' | 'system';
  onChange: (v: 'light' | 'dark' | 'system') => void;
}) {
  const options: { value: 'light' | 'dark' | 'system'; label: string }[] = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'system', label: '跟随系统' },
  ];

  return (
    <div className="inline-flex rounded-xl border border-bdr p-1 bg-surface-subtle">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            value === opt.value
              ? 'bg-white text-txt-primary font-medium shadow-sm'
              : 'text-txt-muted hover:text-txt-secondary'
          }`}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/* ---------------------------------------------------------------------------
   Provider card definitions
--------------------------------------------------------------------------- */

interface ProviderDef {
  name: string;
  label: string;
  description: string;
  category: string;
  defaultBaseUrl: string;
}

const PROVIDER_DEFS: ProviderDef[] = [
  // 文本 / LLM
  { name: 'openrouter', label: 'OpenRouter', description: '文本/LLM (Gemini, Claude, GPT, DeepSeek 等)', category: '文本 / LLM', defaultBaseUrl: 'https://openrouter.ai/api/v1' },
  // 图像 / 视频 托管平台
  { name: 'fal_ai', label: 'fal.ai', description: '图像+视频模型托管 (FLUX, Kling, Seedream 等)', category: '多模型平台', defaultBaseUrl: 'https://fal.run' },
  { name: 'replicate', label: 'Replicate', description: '图像+视频模型托管 (FLUX, InstantID 等)', category: '多模型平台', defaultBaseUrl: 'https://api.replicate.com/v1' },
  // 图像生成
  { name: 'stability_ai', label: 'Stability AI', description: '图像生成 (Stable Diffusion 3.5)', category: '图像生成', defaultBaseUrl: 'https://api.stability.ai/v2beta' },
  { name: 'ideogram', label: 'Ideogram', description: '图像生成 (Ideogram V3, 文字渲染)', category: '图像生成', defaultBaseUrl: 'https://api.ideogram.ai' },
  // 视频生成
  { name: 'kling', label: 'Kling (快手)', description: '视频生成 (Kling 3.0, 角色参考)', category: '视频生成', defaultBaseUrl: 'https://api.klingai.com' },
  { name: 'runway', label: 'Runway', description: '视频生成 (Gen-4 Turbo)', category: '视频生成', defaultBaseUrl: 'https://api.runwayml.com/v1' },
  { name: 'minimax', label: 'MiniMax (海螺)', description: '视频生成 (Hailuo 2.3)', category: '视频生成', defaultBaseUrl: 'https://api.minimax.io/v1' },
  { name: 'luma', label: 'Luma', description: '视频生成 (Dream Machine)', category: '视频生成', defaultBaseUrl: 'https://api.lumalabs.ai' },
  // 综合平台
  { name: 'openai', label: 'OpenAI', description: '图像 (GPT Image 1) + 视频 (Sora 2)', category: '综合平台', defaultBaseUrl: 'https://api.openai.com/v1' },
  { name: 'google_cloud', label: 'Google Cloud', description: '图像 (Imagen 4) + 视频 (Veo 3.1)', category: '综合平台', defaultBaseUrl: '' },
  // 语音
  { name: 'fish_audio', label: 'Fish Audio', description: '语音合成 (Fish Speech 1.5)', category: '语音合成', defaultBaseUrl: 'https://api.fish.audio/v1' },
];

/* ---------------------------------------------------------------------------
   ProviderCard sub-component
--------------------------------------------------------------------------- */

function ProviderCard({
  def,
  config,
  testResult,
  onUpdate,
  onTest,
  testLoading,
}: {
  def: ProviderDef;
  config: Partial<ProviderConfig>;
  testResult: 'untested' | 'success' | 'failed';
  onUpdate: (patch: Partial<ProviderConfig>) => void;
  onTest: () => void;
  testLoading: boolean;
}) {
  const [showKey, setShowKey] = useState(false);

  const statusIcon =
    testResult === 'success' ? (
      <CheckCircle2 className="w-4 h-4 text-status-completed" aria-label="连接成功" />
    ) : testResult === 'failed' ? (
      <AlertCircle className="w-4 h-4 text-status-failed" aria-label="连接失败" />
    ) : (
      <Circle className="w-4 h-4 text-txt-muted" aria-label="未测试" />
    );

  const statusText =
    testResult === 'success' ? '连接成功' : testResult === 'failed' ? '连接失败' : '未测试';

  return (
    <Card variant="compact" className="border border-bdr flex flex-col gap-4">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-txt-primary">{def.label}</p>
          <p className="text-xs text-txt-muted">{def.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled ?? true}
          aria-label={`${def.label} 启用/禁用`}
          onClick={() => onUpdate({ enabled: !(config.enabled ?? true) })}
          className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors shrink-0 ${
            (config.enabled ?? true) ? 'bg-accent' : 'bg-bdr'
          }`}
        >
          <span
            className={`inline-block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
              (config.enabled ?? true) ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* API Key */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-txt-muted uppercase tracking-wide block">
          API 密钥
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={config.api_key ?? ''}
            onChange={(e) => onUpdate({ api_key: e.target.value })}
            placeholder="sk-..."
            aria-label={`${def.label} API密钥`}
            className="w-full bg-white border border-bdr rounded-xl px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            aria-label={showKey ? '隐藏密钥' : '显示密钥'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-secondary transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Base URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-txt-muted uppercase tracking-wide block">
          Base URL
        </label>
        <input
          type="text"
          value={config.base_url ?? def.defaultBaseUrl}
          onChange={(e) => onUpdate({ base_url: e.target.value })}
          placeholder={def.defaultBaseUrl || 'https://...'}
          aria-label={`${def.label} Base URL`}
          className="w-full bg-white border border-bdr rounded-xl px-4 py-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
        />
      </div>

      {/* Footer: test connection + status */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-txt-muted">
          {statusIcon}
          <span>{statusText}</span>
        </div>
        <button
          type="button"
          onClick={onTest}
          disabled={testLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border border-bdr text-txt-secondary hover:bg-surface-subtle transition-colors disabled:opacity-50"
        >
          {testLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          测试连接
        </button>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
   Main component
--------------------------------------------------------------------------- */

export default function SettingsPage() {
  const { id: projectId } = useParams();
  const isProjectContext = !!projectId;

  const [form, setForm] = useState<SettingsForm>(loadSettings);
  const [originalForm] = useState<SettingsForm>(loadSettings);
  const [saved, setSaved] = useState(false);

  /* Provider state */
  const [providers, setProviders] = useState<Record<string, Partial<ProviderConfig>>>({});
  const [providerLoading, setProviderLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, 'untested' | 'success' | 'failed'>>({});
  const [testLoadingMap, setTestLoadingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setProviderLoading(true);
    getProviders()
      .then((res) => {
        const map: Record<string, Partial<ProviderConfig>> = {};
        res.data.forEach((p) => { map[p.name] = p; });
        setProviders(map);
      })
      .catch(() => {
        // API unavailable — start with empty configs
      })
      .finally(() => setProviderLoading(false));
  }, []);

  const handleProviderUpdate = (name: string, patch: Partial<ProviderConfig>) => {
    setProviders((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  };

  const handleTestConnection = async (name: string) => {
    setTestLoadingMap((prev) => ({ ...prev, [name]: true }));
    try {
      const res = await testConnection(name);
      setTestResults((prev) => ({ ...prev, [name]: res.data.success ? 'success' : 'failed' }));
    } catch {
      setTestResults((prev) => ({ ...prev, [name]: 'failed' }));
    } finally {
      setTestLoadingMap((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSaveProviders = async () => {
    await Promise.allSettled(
      Object.entries(providers).map(([name, config]) => updateProvider(name, config))
    );
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(originalForm);

  const update = useCallback(<K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  function handleCancel() {
    setForm({ ...originalForm });
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    handleSaveProviders().catch(() => {});
    setSaved(true);
  }

  function handleClearCache() {
    // Only clear cached data, not our settings
    const settings = localStorage.getItem(STORAGE_KEY);
    localStorage.clear();
    if (settings) {
      localStorage.setItem(STORAGE_KEY, settings);
    }
    alert('本地缓存已清除');
  }

  function handleExportData() {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manga-drama-export.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppLayout layout="sidebar" sidebarContext={isProjectContext ? 'project' : 'home'}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white px-4 py-4 md:px-8 md:py-6 border-b border-bdr">
        <h1 className="text-display-lg text-txt-primary font-display">API 密钥配置</h1>
        <p className="text-txt-secondary text-sm mt-1">
          配置各 AI 服务商的 API 密钥与连接参数
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 text-sm text-txt-muted"
            aria-label="Breadcrumb"
          >
            {isProjectContext ? (
              <>
                <Link to="/projects" className="hover:text-accent transition-colors">
                  项目
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
                <Link to={`/projects/${projectId}`} className="hover:text-accent transition-colors">
                  项目概览
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
                <span className="text-txt-primary font-medium">API 密钥配置</span>
              </>
            ) : (
              <>
                <Link to="/projects" className="hover:text-accent transition-colors">
                  项目
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-txt-muted shrink-0" aria-hidden="true" />
                <span className="text-txt-primary font-medium">设置</span>
              </>
            )}
          </nav>

          {/* ----------------------------------------------------------------
              AI 服务配置 section — provider cards
          ---------------------------------------------------------------- */}
          <Card variant="form">
            <SectionHeader
              icon={<Cpu className="w-4 h-4 text-txt-muted" />}
              title="AI 服务配置"
              description="配置AI服务提供商的API密钥和连接信息"
            />

            {providerLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-txt-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">加载配置中...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  const categories = [...new Set(PROVIDER_DEFS.map((d) => d.category))];
                  return categories.map((cat) => (
                    <div key={cat}>
                      <p className="text-xs font-medium text-txt-muted uppercase tracking-wide mb-3">
                        {cat}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PROVIDER_DEFS.filter((d) => d.category === cat).map((def) => (
                          <ProviderCard
                            key={def.name}
                            def={def}
                            config={providers[def.name] ?? { enabled: true }}
                            testResult={testResults[def.name] ?? 'untested'}
                            onUpdate={(patch) => handleProviderUpdate(def.name, patch)}
                            onTest={() => handleTestConnection(def.name)}
                            testLoading={testLoadingMap[def.name] ?? false}
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </Card>

          {/* ----------------------------------------------------------------
              Single form card with all sections separated by dividers
          ---------------------------------------------------------------- */}
          <Card variant="form">

            {/* Section 1 — 账户信息 */}
            <SectionHeader
              icon={<User className="w-4 h-4 text-txt-muted" />}
              title="账户信息"
              description="你的个人信息与账户角色"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="用户名">
                <input
                  type="text"
                  className={inputClass}
                  value={form.username}
                  placeholder="输入用户名"
                  onChange={(e) => update('username', e.target.value)}
                  aria-label="用户名"
                />
              </FormField>

              <FormField label="邮箱">
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  placeholder="输入邮箱地址"
                  onChange={(e) => update('email', e.target.value)}
                  aria-label="邮箱"
                />
              </FormField>
            </div>

            <div className="mt-5">
              <FormField label="角色" hint="当前账户的权限级别">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-subtle rounded-xl border border-bdr">
                  <span className="text-[15px] text-txt-primary font-medium">
                    管理员
                  </span>
                  <span className="text-xs text-accent bg-accent-light px-2 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                </div>
              </FormField>
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 2 — 界面偏好 */}
            <SectionHeader
              icon={<Monitor className="w-4 h-4 text-txt-muted" />}
              title="界面偏好"
              description="自定义界面语言、主题和布局"
            />

            <div className="space-y-5">
              <FormField label="语言">
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.language}
                    onChange={(e) => update('language', e.target.value)}
                    aria-label="语言"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en">English</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>

              <FormField label="主题">
                <ThemePills
                  value={form.theme}
                  onChange={(v) => update('theme', v)}
                />
              </FormField>

              <FormField label="侧边栏默认状态">
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.sidebarDefault}
                    onChange={(e) =>
                      update(
                        'sidebarDefault',
                        e.target.value as 'expanded' | 'collapsed',
                      )
                    }
                    aria-label="侧边栏默认状态"
                  >
                    <option value="expanded">展开</option>
                    <option value="collapsed">收起</option>
                  </select>
                  <ChevronRight
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-muted rotate-90 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </FormField>
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 3 — 通知设置 */}
            <SectionHeader
              icon={<Bell className="w-4 h-4 text-txt-muted" />}
              title="通知设置"
              description="选择你希望接收的通知类型"
            />

            <div className="divide-y divide-bdr">
              <NotificationRow
                label="生成完成通知"
                description="当 AI 生成任务完成时发送通知"
                checked={form.notifyGenComplete}
                onChange={(v) => update('notifyGenComplete', v)}
              />
              <NotificationRow
                label="预算预警通知"
                description="当 API 费用接近预算上限时提醒"
                checked={form.notifyBudgetWarning}
                onChange={(v) => update('notifyBudgetWarning', v)}
              />
              <NotificationRow
                label="系统更新通知"
                description="平台有新版本或功能更新时提醒"
                checked={form.notifySystemUpdate}
                onChange={(v) => update('notifySystemUpdate', v)}
              />
              <NotificationRow
                label="邮件通知"
                description="将重要通知同步发送到你的邮箱"
                checked={form.notifyEmail}
                onChange={(v) => update('notifyEmail', v)}
              />
            </div>

            {/* Divider */}
            <div className="border-b border-bdr my-8" />

            {/* Section 4 — 数据与存储 */}
            <SectionHeader
              icon={<HardDrive className="w-4 h-4 text-txt-muted" />}
              title="数据与存储"
              description="管理本地缓存与项目数据导出"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-txt-primary">
                    缓存管理
                  </p>
                  <p className="text-xs text-txt-muted mt-0.5">
                    清除浏览器中的临时缓存数据
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCache}
                >
                  清除本地缓存
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-txt-primary">
                    导出数据
                  </p>
                  <p className="text-xs text-txt-muted mt-0.5">
                    将所有本地数据导出为 JSON 文件
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportData}
                >
                  导出所有项目数据
                </Button>
              </div>
            </div>

          </Card>

        </div>
      </div>

      {/* ----------------------------------------------------------------
          Sticky bottom action bar
      ---------------------------------------------------------------- */}
      <div className="sticky bottom-0 z-40 bg-white border-t border-bdr">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-txt-muted hidden sm:block">
            {isDirty ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                有未保存的更改
              </span>
            ) : saved ? (
              '所有设置已保存'
            ) : (
              '设置无变更'
            )}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="secondary"
              size="md"
              icon={<X className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={!isDirty}
              aria-label="取消更改"
            >
              取消
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={!isDirty}
              aria-label="保存设置"
            >
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
