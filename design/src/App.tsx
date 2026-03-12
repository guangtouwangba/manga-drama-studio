import { useState } from "react";
import {
  MoreVertical, MessageSquare, Check, X, Search, ChevronLeft, ChevronRight,
  FolderOpen, Users, Zap, TrendingUp, Inbox, Plus, Settings, Edit3,
  Copy, Trash2, Archive, Star, Bell, Package,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Tiny helpers                                                       */
/* ------------------------------------------------------------------ */

const avatar = (seed: string, size = 40) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&size=${size}`;

function ProgressRing({ pct, size = 56, stroke = 4.5 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEEEE8" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="#7C6AF2" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="rotate-90 origin-center fill-txt-primary text-[13px] font-semibold"
      >
        {pct}%
      </text>
    </svg>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${on ? "bg-accent" : "bg-[#E0E0DC]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  /* toggle states */
  const [tSlack, setTSlack] = useState(true);
  const [tMeet, setTMeet] = useState(true);
  const [tGithub, setTGithub] = useState(false);
  const [tA, setTA] = useState(true);
  const [tB, setTB] = useState(false);
  const [tC, setTC] = useState(true);

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Page container ────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        {/* page header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-small text-txt-secondary mb-1">Design System</p>
            <h1 className="text-display-lg text-txt-primary">Component Kitchen Sink</h1>
          </div>
          <p className="text-small text-txt-muted">Manga Drama Studio v1.0</p>
        </div>

        {/* ── BENTO GRID ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

          {/* ============ 1. PROFILE CARD ============ */}
          <div className="bg-white rounded-card p-6">
            <div className="flex items-start justify-between mb-5">
              <img src={avatar("christine", 80)} className="w-20 h-20 rounded-full bg-surface-subtle" alt="" />
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors">
                <MoreVertical size={18} className="text-txt-secondary" />
              </button>
            </div>
            <h2 className="text-display-sm text-txt-primary">Christine Thompson</h2>
            <p className="text-small text-txt-secondary mt-1">Project manager</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {["UI/UX Design", "Project management", "Agile methodologies"].map((t) => (
                <span key={t} className="bg-surface-subtle text-txt-primary rounded-full px-3.5 py-1.5 text-[13px] border border-bdr">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ============ 2. CALENDAR WIDGET ============ */}
          <CalendarWidget />

          {/* ============ 3. PROJECT CARD ============ */}
          <div className="bg-white rounded-card p-6">
            <div className="flex items-start justify-between mb-5">
              <ProgressRing pct={43} size={52} />
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors">
                <MoreVertical size={18} className="text-txt-secondary" />
              </button>
            </div>
            <h2 className="text-display-sm text-txt-primary">Amber website redesign</h2>
            <p className="text-body text-txt-secondary mt-2 line-clamp-2">
              In today's fast-paced digital landscape, our mission is to transform our website into a more intuitive, engaging, and user-friendly platform...
            </p>
            <div className="flex -space-x-2 mt-5">
              {["amber1", "amber2", "amber3", "amber4"].map((s) => (
                <img key={s} src={avatar(s, 36)} className="w-9 h-9 rounded-full ring-2 ring-white bg-surface-subtle" alt="" />
              ))}
            </div>
          </div>

          {/* ============ 4. NOTIFICATION LIST (spans 1 col, tall) ============ */}
          <div className="bg-white rounded-card p-6 row-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-display-sm text-txt-primary">Notifications</h2>
              <div className="flex items-center gap-2">
                <span className="text-small text-txt-secondary">Unread</span>
                <span className="bg-accent text-white rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-semibold">6</span>
              </div>
            </div>

            {/* notification items */}
            <div className="space-y-0 divide-y divide-bdr-subtle">
              {/* item with actions */}
              <div className="py-4 first:pt-0">
                <div className="flex items-start gap-3">
                  <img src={avatar("ashlynn", 40)} className="w-10 h-10 rounded-full bg-surface-subtle shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium text-txt-primary">
                      Ashlynn George <span className="text-small text-txt-muted ml-1">· 1h</span>
                    </p>
                    <p className="text-small text-txt-secondary">has invited you to access &quot;Magma project&quot;</p>
                    <div className="flex gap-2 mt-3">
                      <button className="bg-[#F0F5E4] text-txt-primary rounded-full px-4 py-2 text-[13px] font-medium hover:bg-[#E4EDD4] transition-colors flex items-center gap-1.5">
                        <Check size={14} /> Accept
                      </button>
                      <button className="bg-transparent text-txt-primary border border-bdr rounded-full px-4 py-2 text-[13px] font-medium hover:bg-surface-subtle transition-colors flex items-center gap-1.5">
                        <X size={14} /> Deny request
                      </button>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors shrink-0">
                    <MoreVertical size={16} className="text-txt-muted" />
                  </button>
                </div>
              </div>

              {/* simple items */}
              {[
                { msg: 'changed status of task in "Magma project"' },
                { msg: 'added new tasks to "Firmly project"' },
              ].map((n, i) => (
                <div key={i} className="py-4 flex items-start gap-3">
                  <img src={avatar(`ash${i}`, 40)} className="w-10 h-10 rounded-full bg-surface-subtle shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium text-txt-primary">
                      Ashlynn George <span className="text-small text-txt-muted ml-1">· 1h</span>
                    </p>
                    <p className="text-small text-txt-secondary">{n.msg}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors shrink-0">
                    <MoreVertical size={16} className="text-txt-muted" />
                  </button>
                </div>
              ))}

              {/* system notification */}
              <div className="py-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center shrink-0">
                  <Bell size={18} className="text-txt-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-small text-txt-secondary">We have updated our Terms and condition. Please review</p>
                </div>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors shrink-0">
                  <MoreVertical size={16} className="text-txt-muted" />
                </button>
              </div>
            </div>

            {/* footer */}
            <div className="flex gap-3 mt-5">
              <button className="flex-1 border border-bdr text-txt-primary rounded-full px-4 py-2.5 text-[13px] font-medium hover:bg-surface-subtle transition-colors">
                Mark all as read
              </button>
              <button className="flex-1 bg-txt-primary text-white rounded-full px-4 py-2.5 text-[13px] font-medium hover:bg-[#333] transition-colors">
                View all
              </button>
            </div>
          </div>

          {/* ============ 5. TEAM MEMBER LIST ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-4">Team Members</h2>
            <div className="divide-y divide-bdr-subtle">
              {[
                { name: "Julie Andrews", role: "Project manager", seed: "julie" },
                { name: "Kevin Conroy", role: "Project manager", seed: "kevin" },
                { name: "Jim Connor", role: "Project manager", seed: "jim" },
                { name: "Tom Kinley", role: "Project manager", seed: "tom" },
              ].map((m) => (
                <div key={m.seed} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <img src={avatar(m.seed, 44)} className="w-11 h-11 rounded-full bg-surface-subtle shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium text-txt-primary">{m.name}</p>
                    <p className="text-small text-txt-secondary">{m.role}</p>
                  </div>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors shrink-0">
                    <MessageSquare size={18} className="text-txt-muted" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ============ 6. MILESTONE CARD ============ */}
          <div className="bg-white rounded-card p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-heading text-txt-primary">Wireframes milestone</h2>
              <button className="bg-txt-primary text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-[#333] transition-colors shrink-0">
                View details
              </button>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-small text-txt-secondary">Due date:</p>
                <p className="text-body-medium text-txt-primary">March 20th</p>
              </div>
              <ProgressRing pct={39} size={48} stroke={4} />
              <div>
                <p className="text-small text-txt-secondary mb-1.5">Assignees:</p>
                <div className="flex -space-x-2">
                  {["ms1", "ms2", "ms3"].map((s) => (
                    <img key={s} src={avatar(s, 32)} className="w-8 h-8 rounded-full ring-2 ring-white bg-surface-subtle" alt="" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============ 7. INTEGRATIONS ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-4">Integrations</h2>
            <div className="space-y-4">
              {[
                { name: "Slack", desc: "Used as a main source of communication", color: "#E01E5A", icon: "S", on: tSlack, toggle: () => setTSlack(!tSlack) },
                { name: "Google Meet", desc: "Used for all types of calls", color: "#00897B", icon: "G", on: tMeet, toggle: () => setTMeet(!tMeet) },
                { name: "Github", desc: "Enables automated workflows, code synchronization", color: "#1A1A1A", icon: "H", on: tGithub, toggle: () => setTGithub(!tGithub) },
              ].map((itg) => (
                <div key={itg.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: itg.color }}>
                    {itg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-medium text-txt-primary">{itg.name}</p>
                    <p className="text-small text-txt-secondary truncate">{itg.desc}</p>
                  </div>
                  <Toggle on={itg.on} onToggle={itg.toggle} />
                </div>
              ))}
            </div>
          </div>

          {/* ============ 8. STAT CARDS ============ */}
          <div className="md:col-span-2 xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Projects", value: "24", icon: FolderOpen },
              { label: "Team Members", value: "12", icon: Users },
              { label: "Active Tasks", value: "156", icon: Zap },
              { label: "Completion Rate", value: "89%", icon: TrendingUp },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-card p-6 flex items-start justify-between">
                <div>
                  <p className="text-small text-txt-secondary">{s.label}</p>
                  <p className="text-display-sm text-txt-primary mt-1">{s.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
                  <s.icon size={20} className="text-accent" />
                </div>
              </div>
            ))}
          </div>

          {/* ============ 9. BUTTONS SHOWCASE ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <button className="bg-txt-primary text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#333] transition-colors active:scale-[0.98]">
                Primary
              </button>
              <button className="bg-transparent text-txt-primary border border-[#E0E0E0] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-surface-subtle transition-colors active:scale-[0.98]">
                Secondary
              </button>
              <button className="bg-[#F0F5E4] text-txt-primary rounded-full px-4 py-2.5 text-sm font-medium hover:bg-[#E4EDD4] transition-colors flex items-center gap-1.5 active:scale-[0.98]">
                <Check size={15} /> Accept
              </button>
              <button className="text-txt-secondary text-sm font-medium hover:text-txt-primary transition-colors">
                Ghost link
              </button>
              <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors">
                <MoreVertical size={18} className="text-txt-secondary" />
              </button>
            </div>

            <h3 className="text-body-medium text-txt-primary mt-6 mb-3">Chips / Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["Design", "Frontend", "React", "TypeScript", "Tailwind", "Figma"].map((t) => (
                <span key={t} className="bg-surface-subtle text-txt-primary rounded-full px-3.5 py-1.5 text-[13px] border border-bdr">
                  {t}
                </span>
              ))}
            </div>

            <h3 className="text-body-medium text-txt-primary mt-6 mb-3">Badges</h3>
            <div className="flex items-center gap-3">
              {[3, 12, 99].map((n) => (
                <span key={n} className="bg-accent text-white rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-semibold">
                  {n}
                </span>
              ))}
              <span className="bg-status-completed text-white rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-semibold">
                OK
              </span>
              <span className="bg-status-failed text-white rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-semibold">
                !
              </span>
            </div>
          </div>

          {/* ============ 10. INPUTS ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Form Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="text-small text-txt-secondary block mb-1.5">Text input</label>
                <input
                  type="text" placeholder="Enter project name..."
                  className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <div>
                <label className="text-small text-txt-secondary block mb-1.5">Search</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                  <input
                    type="text" placeholder="Search components..."
                    className="w-full bg-white border border-bdr rounded-xl pl-10 pr-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-small text-txt-secondary block mb-1.5">Textarea</label>
                <textarea
                  rows={3} placeholder="Write a description..."
                  className="w-full bg-white border border-bdr rounded-xl px-4 py-3 text-[15px] text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* ============ 11. PROGRESS RINGS + TOGGLES + STATUS ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Progress &amp; Status</h2>

            <p className="text-small text-txt-secondary mb-3">Progress Rings</p>
            <div className="flex items-end gap-5 mb-6">
              <ProgressRing pct={25} size={40} stroke={3.5} />
              <ProgressRing pct={64} size={56} stroke={4.5} />
              <ProgressRing pct={88} size={72} stroke={5} />
            </div>

            <p className="text-small text-txt-secondary mb-3">Toggle Switches</p>
            <div className="flex items-center gap-4 mb-6">
              <Toggle on={tA} onToggle={() => setTA(!tA)} />
              <Toggle on={tB} onToggle={() => setTB(!tB)} />
              <Toggle on={tC} onToggle={() => setTC(!tC)} />
            </div>

            <p className="text-small text-txt-secondary mb-3">Status Indicators</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Running", color: "bg-status-running" },
                { label: "Completed", color: "bg-status-completed" },
                { label: "Waiting", color: "bg-status-waiting" },
                { label: "Failed", color: "bg-status-failed" },
                { label: "Pending", color: "bg-status-pending" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 bg-surface-subtle rounded-full px-3 py-1.5 text-[13px] text-txt-primary">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* ============ 12. DROPDOWN (simulated open) ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Dropdown Menu</h2>
            <div className="relative inline-block">
              <button className="bg-txt-primary text-white rounded-full px-5 py-2.5 text-sm font-medium">
                Actions ▾
              </button>
              {/* simulated open dropdown */}
              <div className="mt-2 bg-white rounded-2xl shadow-dropdown p-2 w-52">
                {[
                  { icon: Edit3, label: "Edit" },
                  { icon: Copy, label: "Duplicate" },
                  { icon: Star, label: "Favorite" },
                  { icon: Archive, label: "Archive" },
                  { icon: Trash2, label: "Delete", danger: true },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[14px] transition-colors ${
                      item.danger
                        ? "text-status-failed hover:bg-status-failed/10"
                        : "text-txt-primary hover:bg-surface-subtle"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============ 13. MODAL PREVIEW ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Modal Preview</h2>
            {/* miniature modal representation */}
            <div className="bg-[#1A1A1A]/5 rounded-2xl p-6 flex items-center justify-center">
              <div className="bg-white rounded-card p-6 w-full max-w-[320px] shadow-modal">
                <h3 className="text-heading text-txt-primary">Create new project</h3>
                <p className="text-small text-txt-secondary mt-2">Set up a new manga drama production with AI-powered tools.</p>
                <input
                  type="text" placeholder="Project title..."
                  className="w-full bg-white border border-bdr rounded-xl px-4 py-2.5 text-[14px] text-txt-primary placeholder:text-txt-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all mt-4"
                />
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-txt-primary text-white rounded-full px-4 py-2.5 text-[13px] font-medium hover:bg-[#333] transition-colors">
                    Create
                  </button>
                  <button className="flex-1 border border-bdr text-txt-primary rounded-full px-4 py-2.5 text-[13px] font-medium hover:bg-surface-subtle transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============ 14. EMPTY STATE ============ */}
          <div className="bg-white rounded-card p-6">
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center mb-4">
                <Inbox size={28} className="text-accent" />
              </div>
              <h3 className="text-heading text-txt-primary">No episodes yet</h3>
              <p className="text-small text-txt-secondary mt-2 max-w-[240px]">
                Create your first episode to start building your manga drama.
              </p>
              <button className="mt-5 bg-txt-primary text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#333] transition-colors flex items-center gap-1.5">
                <Plus size={16} /> Create episode
              </button>
            </div>
          </div>

          {/* ============ 15. DIVIDERS & TYPOGRAPHY ============ */}
          <div className="bg-white rounded-card p-6">
            <h2 className="text-heading text-txt-primary mb-5">Typography &amp; Dividers</h2>

            <p className="text-display-lg text-txt-primary">Display Large</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-display-sm text-txt-primary">Display Small</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-heading text-txt-primary">Heading</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-body text-txt-primary">Body — The quick brown fox jumps over the lazy dog</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-body-medium text-txt-primary">Body Medium</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-small text-txt-secondary">Small — Secondary information</p>
            <div className="border-t border-bdr-subtle my-4" />
            <p className="text-caption text-txt-muted uppercase">Caption — Status Label</p>
          </div>

          {/* ============ 16. COLOR PALETTE ============ */}
          <div className="bg-white rounded-card p-6 md:col-span-2">
            <h2 className="text-heading text-txt-primary mb-5">Color Palette</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { name: "Canvas", color: "#E4F0A4" },
                { name: "Canvas Dark", color: "#D4E488" },
                { name: "Surface Subtle", color: "#F5F5F0" },
                { name: "Accent", color: "#7C6AF2" },
                { name: "Accent Light", color: "#EDE9FE" },
                { name: "Accent Dark", color: "#5B47D0" },
                { name: "Text Primary", color: "#1A1A1A" },
                { name: "Text Secondary", color: "#6B6B6B" },
                { name: "Text Muted", color: "#ABABAB" },
                { name: "Border", color: "#E8E8E4" },
                { name: "Running", color: "#7C6AF2" },
                { name: "Completed", color: "#6BBF6A" },
                { name: "Waiting", color: "#F0C850" },
                { name: "Failed", color: "#E87070" },
                { name: "Pending", color: "#CCCCCC" },
              ].map((c) => (
                <div key={c.name} className="text-center">
                  <div className="w-full aspect-square rounded-2xl border border-bdr-subtle" style={{ background: c.color }} />
                  <p className="text-caption text-txt-secondary mt-2">{c.name}</p>
                  <p className="text-caption text-txt-muted">{c.color}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* footer */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-canvas-dark/30">
          <p className="text-small text-txt-secondary">
            Built with React + Tailwind v3 + Lucide
          </p>
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-txt-muted" />
            <Package size={14} className="text-txt-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar Widget (self-contained)                                   */
/* ------------------------------------------------------------------ */

function CalendarWidget() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = 12; // March 12
  const rangeStart = 26; // highlight range
  const rangeEnd = 28;

  // Feb/March-style grid: prev month trail, current month, next month trail
  const cells: { day: number; outside: boolean }[] = [];
  // last 3 of prev month
  [29, 30, 31].forEach((d) => cells.push({ day: d, outside: true }));
  // current month
  for (let d = 1; d <= 31; d++) cells.push({ day: d, outside: false });
  // next month filler
  cells.push({ day: 1, outside: true });

  return (
    <div className="bg-white rounded-card p-6">
      <div className="flex items-center justify-between mb-5">
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors">
          <ChevronLeft size={18} className="text-txt-secondary" />
        </button>
        <h2 className="text-heading text-txt-primary">March, 2026</h2>
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-subtle transition-colors">
          <ChevronRight size={18} className="text-txt-secondary" />
        </button>
      </div>

      {/* day headers */}
      <div className="grid grid-cols-7 mb-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-caption text-txt-muted py-1.5">{d}</div>
        ))}
      </div>

      {/* day grid */}
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const isToday = !c.outside && c.day === today;
          const inRange = !c.outside && c.day >= rangeStart && c.day <= rangeEnd;
          return (
            <div
              key={i}
              className={`
                flex items-center justify-center h-10 text-[14px] font-medium rounded-xl transition-colors cursor-default
                ${c.outside ? "text-txt-muted" : "text-txt-primary"}
                ${isToday ? "!bg-accent !text-white rounded-full" : ""}
                ${inRange ? "bg-canvas/60" : ""}
                ${!c.outside && !isToday ? "hover:bg-surface-subtle" : ""}
              `}
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
