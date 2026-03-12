# Manga Drama Studio -- Frontend Implementation Spec

> Generated from 9 Stitch screen designs (HTML + screenshots).
> This document is the single source of truth for the frontend team.
> **Theme: Dark mode only.** Ignore the light-theme design-system.json -- follow the colors and patterns below.

---

## Table of Contents

1. [Dark Theme Color Palette](#1-dark-theme-color-palette)
2. [Typography](#2-typography)
3. [Tailwind Config](#3-tailwind-config)
4. [Global Layout Architecture](#4-global-layout-architecture)
5. [Shared Components](#5-shared-components)
6. [Page-by-Page Breakdown](#6-page-by-page-breakdown)
   - 6.1 Project List
   - 6.2 Project Dashboard
   - 6.3 Project Setup
   - 6.4 Asset Warehouse
   - 6.5 Script Editor
   - 6.6 Script Editor (Integrated)
   - 6.7 Storyboard Editor
   - 6.8 Storyboard Regenerate
   - 6.9 Version Comparison
7. [Interaction Patterns](#7-interaction-patterns)
8. [Responsive Behavior](#8-responsive-behavior)
9. [Accessibility Notes](#9-accessibility-notes)

---

## 1. Dark Theme Color Palette

All colors are extracted directly from the Stitch HTML source code.

### 1.1 Core Background Colors

| Token                | Hex / Class                          | Usage                                                  |
|----------------------|--------------------------------------|--------------------------------------------------------|
| `background-dark`    | `#101622`                            | Page background, sidebar background                    |
| `main-surface`       | `#0a0f1a`                            | Main content area (slightly darker than sidebar)       |
| `card-surface`       | `slate-800/50` = `rgba(30,41,59,0.5)`| Cards, stat boxes, table containers                    |
| `card-surface-solid` | `slate-900/50` = `rgba(15,23,42,0.5)`| Form sections, settings cards                          |
| `input-bg`           | `slate-800` / `slate-900`            | Input fields, select dropdowns, search bars            |
| `panel-dark`         | `#1a2234`                            | Comparison cards (version-comparison)                  |
| `hover-surface`      | `slate-800` = `#1e293b`              | Hover state for nav items, buttons                     |

### 1.2 Text Colors

| Token          | Class / Hex                    | Usage                                            |
|----------------|--------------------------------|--------------------------------------------------|
| `text-primary` | `white` / `slate-100` (#f1f5f9)| Headlines, card titles, bold values              |
| `text-secondary`| `slate-400` (#94a3b8)         | Descriptions, breadcrumb links, labels           |
| `text-muted`   | `slate-500` (#64748b)          | Timestamps, helper text, placeholder text        |
| `text-disabled`| `slate-600` (#475569)          | Disabled states, version history inactive text   |

### 1.3 Accent / Brand Colors

| Token              | Hex         | Usage                                                   |
|--------------------|-------------|---------------------------------------------------------|
| `primary`          | `#256af4`   | **THE accent.** Buttons, active nav, progress bars, links, highlights |
| `primary/90`       | `#256af4` at 90% opacity | Button hover state                       |
| `primary/20`       | `#256af4` at 20% opacity | Avatar rings, icon containers, light bg  |
| `primary/10`       | `#256af4` at 10% opacity | Active nav item bg, subtle highlights    |
| `primary/5`        | `#256af4` at 5% opacity  | Hover state for placeholder cards        |

### 1.4 Border Colors

| Token             | Class                            | Usage                                |
|-------------------|----------------------------------|--------------------------------------|
| `border-default`  | `border-slate-800` (#1e293b)     | Card borders, dividers, nav borders  |
| `border-dark`     | `#314368`                        | Version comparison panel borders     |
| `border-primary`  | `border-primary/50`              | Active card borders, hover highlights|
| `border-primary-full` | `border-primary`             | Selected/active item border          |
| `border-dashed`   | `border-dashed border-slate-800` | Placeholder/empty state borders      |

### 1.5 Status Colors

| Status       | Color                         | Usage                              |
|--------------|-------------------------------|------------------------------------|
| Success      | `emerald-500` (#10b981)       | Completed badges, check icons      |
| In Progress  | `primary` (#256af4)           | Active status dots (with animate-pulse) |
| Warning      | `amber-500` / `orange-500`    | Draft badges, warning alerts       |
| Error        | `red-500` (#ef4444)           | Notification dots, S-Rank badges   |
| Published    | `blue-500` (#3b82f6)          | Published status badge             |
| Idle         | `slate-400` (#94a3b8)         | Pending/not-started status         |
| Green active | `green-500` (#22c55e)         | "Connected" status, auto-save dot  |

### 1.6 Gradients and Glow Effects

| Effect                  | CSS                                                            | Usage                            |
|-------------------------|----------------------------------------------------------------|----------------------------------|
| Primary button shadow   | `shadow-lg shadow-primary/20`                                  | CTA buttons                      |
| Primary glow on bar     | `shadow-[0_0_10px_rgba(37,106,244,0.4)]`                      | Budget progress bar              |
| Card hover shadow       | `hover:shadow-xl dark:hover:shadow-primary/5`                  | Project cards hover              |
| Active card glow        | `shadow-[0_0_40px_rgba(37,106,244,0.15)]`                     | Selected version card            |
| Backdrop blur           | `backdrop-blur-md`                                             | Sticky headers                   |
| Image overlay gradient  | `bg-gradient-to-t from-black/60 to-transparent`               | Image hover overlays             |

---

## 2. Typography

### 2.1 Font Family

```
font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
```

- **Space Grotesk**: Primary font for Latin characters and UI
- **Noto Sans SC**: Fallback for Chinese characters
- Loaded via Google Fonts with weights: 300, 400, 500, 600, 700

### 2.2 Type Scale (from Stitch code)

| Role                 | Tailwind Classes                                                  | Usage                              |
|----------------------|-------------------------------------------------------------------|------------------------------------|
| Page title           | `text-3xl font-bold tracking-tight` (or `text-4xl font-black`)   | "My Projects", project names       |
| Section heading      | `text-lg font-bold`                                               | "Episode List", sidebar headings   |
| Card title           | `text-lg font-bold`                                               | Project card names                 |
| Body text            | `text-sm` (14px)                                                  | Descriptions, table content        |
| Small text           | `text-xs` (12px)                                                  | Labels, metadata, timestamps       |
| Micro text           | `text-[10px]` or `text-[11px]`                                    | Uppercase labels, rank badges      |
| Form label           | `text-sm font-medium`                                             | Field labels in forms              |
| Section label (caps) | `text-xs font-bold uppercase tracking-widest`                     | "PUBLISHED EPISODES", section dividers |
| Button text          | `text-sm font-bold`                                               | Button labels                      |
| Breadcrumb           | `text-sm`                                                         | Navigation breadcrumbs             |

### 2.3 Icon System

- **Library**: Google Material Symbols Outlined
- **Import**: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1`
- **Default settings**: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- **Sizes**: Default 24px; `text-[22px]` for nav; `text-[20px]` for buttons; `text-[14px]` for inline; `text-sm`/`text-xs` for tiny
- **Filled variant**: Add `fill-[1]` class (used for active nav icons)

---

## 3. Tailwind Config

```javascript
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#256af4",
        "background-light": "#f5f6f8",
        "background-dark": "#101622",
        "panel-dark": "#1a2234",
        "border-dark": "#314368",
      },
      fontFamily: {
        "display": ["Space Grotesk", "Noto Sans SC", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
    },
  },
}
```

**Important**: The border-radius scale is intentionally tighter than Tailwind defaults. `rounded-xl` = 8px, `rounded-full` = 12px. However, many components explicitly use `rounded-lg`, `rounded-xl`, `rounded-2xl` from the Stitch source which override these. Check each component spec below for the exact radius.

### 3.1 Custom CSS

```css
body {
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Custom scrollbar for panels */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #314368;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 106, 244, 0.4);
}

/* Editor entity highlights */
.editor-highlight {
  background-color: rgba(37, 106, 244, 0.15);
  border-bottom: 2px solid #256af4;
  color: #60a5fa;
  padding: 0 2px;
  cursor: pointer;
}
```

---

## 4. Global Layout Architecture

The app uses **three distinct layout patterns** depending on the page context.

### 4.1 Layout Pattern A: Sidebar + Content (Project List, Asset Warehouse, Script Editor)

```
+------------------+------------------------------------------+
|                  |                                          |
|    Sidebar       |       Main Content Area                  |
|    w-64          |       flex-1                             |
|    fixed-height  |       overflow-y-auto                    |
|                  |                                          |
+------------------+------------------------------------------+
```

**Structure**:
```html
<div class="flex h-screen overflow-hidden">
  <aside class="w-64 flex-shrink-0 border-r border-slate-800 bg-background-dark flex flex-col">
    <!-- Logo, Nav, Footer -->
  </aside>
  <main class="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1a]">
    <!-- Header + Content -->
  </main>
</div>
```

### 4.2 Layout Pattern B: Top Header + Sidebar + Content (Project Dashboard)

```
+------------------------------------------------------------+
|  Header Bar (full width, sticky)                           |
+------------------+-----------------------------------------+
|                  |                                         |
|    Sidebar       |       Main Content                     |
|    w-64          |       (centered, max-w-7xl)            |
|                  |                                         |
+------------------+-----------------------------------------+
```

**Structure**:
```html
<div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
  <header class="flex items-center justify-between border-b border-slate-800 bg-background-dark px-6 py-3 sticky top-0 z-50">
    <!-- Logo + Search + Actions + Avatar -->
  </header>
  <div class="flex flex-1">
    <aside class="hidden lg:flex w-64 flex-col border-r border-slate-800 p-4 gap-2">
      <!-- Nav items -->
    </aside>
    <main class="flex-1 flex flex-col p-6 gap-6 max-w-7xl mx-auto w-full">
      <!-- Content -->
    </main>
  </div>
</div>
```

### 4.3 Layout Pattern C: Top Header Only (Project Setup, Storyboard, Version Comparison)

```
+------------------------------------------------------------+
|  Header Bar (full width, sticky)                           |
+------------------------------------------------------------+
|                                                            |
|           Content Area (centered, max-w-4xl or 7xl)        |
|                                                            |
+------------------------------------------------------------+
|  Footer (optional)                                         |
+------------------------------------------------------------+
```

### 4.4 Layout Pattern D: Top Header + Split Panels (Storyboard Editor)

```
+------------------------------------------------------------+
|  Top Navigation Bar                                        |
+-------------------------+----------------------------------+
|                         |                                  |
|   Left Panel (40%)      |    Right Detail Panel (60%)      |
|   Panel grid            |    Panel details                 |
|   overflow-y-auto       |    overflow-y-auto               |
|                         |                                  |
+-------------------------+----------------------------------+
|  Status Footer Bar                                         |
+------------------------------------------------------------+
```

### 4.5 Sidebar Navigation

The sidebar appears on Layout Patterns A and B. Navigation items vary by context:

**Project List Sidebar (Home)**:
| Icon              | Label  | Route         |
|-------------------|--------|---------------|
| `folder`          | Projects (active) | `/projects`   |
| `settings`        | Settings | `/settings`   |
| `description`     | Docs   | `/docs`       |

**Project Dashboard Sidebar**:
| Icon              | Label        | Route                      |
|-------------------|--------------|----------------------------|
| `dashboard`       | Overview (active) | `/projects/:id`            |
| `movie`           | Episodes     | `/projects/:id/episodes`   |
| `inventory_2`     | Asset Warehouse | `/projects/:id/assets`  |
| `group`           | Team         | `/projects/:id/team`       |
| `help` (bottom)   | Help Center  | `/help`                    |

**Script Editor / Asset Warehouse Sidebar**:
| Icon              | Label        | Route                      |
|-------------------|--------------|----------------------------|
| `dashboard`       | Overview     | `/projects/:id`            |
| `movie_edit`      | Episodes (active for script) | `/projects/:id/episodes`   |
| `inventory_2`     | Asset Warehouse (active for assets) | `/projects/:id/assets` |
| `group`           | Team         | `/projects/:id/team`       |
| **divider label** | "System Controls" |                        |
| `settings`        | Preferences  | `/settings`                |

**Nav Item Classes**:
- Default: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`
- Active: `flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium` (some variants add `border border-primary/20`)

**Sidebar Footer** (varies per page):
- Storage usage indicator (project-list)
- User avatar with name and role (asset-warehouse, script-editor)

---

## 5. Shared Components

### 5.1 Button -- Primary

The main call-to-action. One per section maximum.

```
Classes: inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-lg shadow-primary/20
```

**Variants**:
| Variant      | Modification                                                  |
|--------------|---------------------------------------------------------------|
| Default      | As above                                                      |
| Small        | `px-4 py-2 text-sm`                                          |
| Extra wide   | `px-8 py-2.5`                                                |
| With icon    | Add `<span class="material-symbols-outlined text-sm">icon</span>` before/after text |
| Lifted hover | Add `hover:-translate-y-0.5 active:translate-y-0`            |

### 5.2 Button -- Secondary

For non-primary actions.

```
Classes: flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 text-sm font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors
```

### 5.3 Button -- Ghost

Text-only, no background.

```
Classes: px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors
```

### 5.4 Button -- Outline (Primary)

Border only, primary-colored.

```
Classes: flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-all border border-primary/20
```

### 5.5 Button -- Icon Only

Square icon button.

```
Classes: w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
Small: p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500
```

### 5.6 Card

The fundamental container.

```
Default: bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-5
Form section: bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm
Interactive: add hover:border-primary/50 group cursor-pointer
```

**Card Variants**:
| Variant          | Extra Classes                                                         |
|------------------|-----------------------------------------------------------------------|
| Stat card        | `p-5 rounded-2xl`                                                    |
| Project card     | `rounded-xl overflow-hidden` (with image header)                     |
| Form section     | `rounded-xl p-6 shadow-sm`                                          |
| Table container  | `rounded-2xl overflow-x-auto`                                       |
| Active/selected  | `border-2 border-primary bg-primary/10 dark:bg-primary/20`          |
| Dashed empty     | `border-2 border-dashed border-slate-800 rounded-xl`                |
| Comparison       | `bg-panel-dark border border-border-dark rounded-xl shadow-2xl`     |

### 5.7 Project Card (Home Page)

```html
<div class="group bg-background-dark rounded-xl border border-slate-800 overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl dark:hover:shadow-primary/5">
  <!-- Image header -->
  <div class="relative aspect-[16/10] overflow-hidden">
    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url(...)"></div>
    <div class="absolute top-3 left-3 flex gap-2">
      <!-- Genre badge -->
      <span class="bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">Genre</span>
      <!-- Status badge -->
      <span class="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">Status</span>
    </div>
  </div>
  <!-- Body -->
  <div class="p-4">
    <h3 class="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">Title</h3>
    <!-- Progress section -->
    <div class="space-y-3">
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>Progress label</span>
        <span class="font-bold text-slate-200">60%</span>
      </div>
      <div class="w-full bg-slate-800 h-1.5 rounded-full">
        <div class="bg-primary h-full rounded-full" style="width: 60%"></div>
      </div>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800">
        <div class="flex items-center gap-1 text-[11px] text-slate-400">
          <span class="material-symbols-outlined text-[14px]">calendar_today</span>
          <span>2023-10-24</span>
        </div>
        <button class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**Data requirements**: `id`, `title`, `genre`, `status`, `coverImage`, `progress` (0-100), `lastModified`

### 5.8 New Project Placeholder Card

```html
<div class="group border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer min-h-[340px]">
  <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
    <span class="material-symbols-outlined text-3xl">add</span>
  </div>
  <p class="mt-4 font-bold text-white">Create New Project</p>
  <p class="text-xs text-slate-400 mt-1 text-center">Start your first storyboard with AI</p>
</div>
```

### 5.9 Stat Card

```html
<div class="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Label</p>
  <div class="flex items-end justify-between">
    <p class="text-3xl font-black">98</p>
    <span class="text-slate-400 text-xs">Subtitle</span>
  </div>
</div>
```

**With progress bar variant**: Add `<div class="w-full bg-slate-700 h-1.5 rounded-full"><div class="bg-primary h-full rounded-full" style="width: XX%"></div></div>` below the value.

**With trend indicator**: Add `<span class="text-green-500 flex items-center text-xs font-bold"><span class="material-symbols-outlined text-sm">trending_up</span> +1</span>`

### 5.10 Status Badge

| Status     | Classes                                                                    |
|------------|---------------------------------------------------------------------------|
| Genre tag  | `px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20 uppercase tracking-wider` |
| Active     | `px-3 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-lg border border-green-500/20` |
| Image overlay| `bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter` |
| S-Rank     | `px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded` |
| A-Rank     | `px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] font-bold rounded` |
| Entity count| `bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold` |

### 5.11 Table Row Status Indicator

```html
<!-- Completed -->
<span class="flex items-center gap-1.5 text-green-500">
  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
  Completed
</span>

<!-- In Progress (with pulse animation) -->
<span class="flex items-center gap-1.5 text-primary">
  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
  In Progress
</span>

<!-- Not Started -->
<span class="flex items-center gap-1.5 text-slate-400">
  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
  Not Started
</span>
```

### 5.12 Progress Bar

```html
<div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
  <div class="bg-primary h-full rounded-full" style="width: {percent}%"></div>
</div>
```

**Variants**:
- Storage (sidebar): `h-1.5`
- Stat card: `h-1.5`
- Budget (with glow): Add `shadow-[0_0_10px_rgba(37,106,244,0.4)]` to inner bar
- Thick (budget page): `h-3`

### 5.13 Breadcrumb Navigation

```html
<nav class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
  <a class="hover:text-primary transition-colors" href="#">Project</a>
  <span class="material-symbols-outlined text-xs">chevron_right</span>
  <!-- or <span class="mx-2">/</span> -->
  <a class="hover:text-primary transition-colors" href="#">Sub-page</a>
  <span class="material-symbols-outlined text-xs">chevron_right</span>
  <span class="text-slate-100 font-medium">Current Page</span>
</nav>
```

### 5.14 Search Input

```html
<div class="relative">
  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">search</span>
  <input
    class="bg-slate-100 dark:bg-slate-900 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-primary outline-none"
    type="text"
    placeholder="Search..."
  />
</div>
```

### 5.15 Form Input

```html
<div class="space-y-2">
  <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Label</label>
  <input
    class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
    type="text"
    value=""
  />
</div>
```

**Select variant**: Same classes but use `<select>` element. Add custom arrow via CSS:
```css
select {
  appearance: none;
  background-image: url("data:image/svg+xml,...chevron-down-svg...");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
```

**Textarea variant**: Same classes, add `resize-none` and `rows="4"`.

### 5.16 Tab Navigation

**Underline tabs** (Asset Warehouse header):
```html
<nav class="flex h-full gap-6">
  <a class="flex items-center border-b-2 border-primary text-primary px-1 text-sm font-bold" href="#">Active Tab</a>
  <a class="flex items-center border-b-2 border-transparent text-slate-500 hover:text-slate-300 px-1 text-sm font-medium transition-colors" href="#">Inactive Tab</a>
</nav>
```

**Pill tabs** (Asset appearance states):
```html
<div class="flex gap-2 p-1 bg-slate-900 rounded-lg w-fit">
  <button class="px-6 py-1.5 rounded-md text-sm font-bold bg-slate-800 shadow-sm text-primary">Active</button>
  <button class="px-6 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">Inactive</button>
</div>
```

**Toggle button group** (Version comparison):
```html
<div class="flex bg-slate-800/50 p-1 rounded-lg border border-border-dark">
  <button class="px-4 py-2 text-sm font-bold bg-primary text-white rounded">Active</button>
  <button class="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">Inactive</button>
</div>
```

### 5.17 Version Selector Buttons

```html
<div class="flex gap-2">
  <button class="px-3 py-1 rounded bg-primary text-white text-xs font-bold uppercase">v3</button>
  <button class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase">v2</button>
  <button class="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase">v1</button>
</div>
```

### 5.18 Timeline / Activity Feed

```html
<div class="flex gap-4 relative">
  <!-- Connector line (omit on last item) -->
  <div class="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-slate-700"></div>
  <!-- Icon circle -->
  <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white z-10 shrink-0">
    <span class="material-symbols-outlined text-[14px]">bolt</span>
  </div>
  <!-- Content -->
  <div class="flex flex-col gap-1">
    <p class="text-sm font-bold">Event title</p>
    <p class="text-xs text-slate-500">Description . timestamp</p>
  </div>
</div>
```

**Icon colors by event type**:
- Pipeline success: `bg-primary`
- Approval: `bg-green-500`
- Upload: `bg-slate-700 text-slate-400`
- Warning: `bg-orange-500`

### 5.19 Asset Tag / Association Chip

```html
<!-- Primary association -->
<div class="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full text-xs font-medium text-primary">
  <span class="material-symbols-outlined text-sm">person</span>
  <span>Character: Name</span>
  <span class="material-symbols-outlined text-xs cursor-pointer">close</span>
</div>

<!-- Default association -->
<div class="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium">
  <span class="material-symbols-outlined text-sm">inventory_2</span>
  <span>Prop: Name</span>
  <span class="material-symbols-outlined text-xs cursor-pointer">close</span>
</div>

<!-- Add button -->
<button class="px-3 py-1.5 border border-dashed border-slate-400 rounded-full text-xs text-slate-500 font-medium hover:border-primary hover:text-primary transition-colors flex items-center gap-1">
  <span class="material-symbols-outlined text-sm">add</span>
  <span>Add</span>
</button>
```

### 5.20 Attribute Pill (Character Details)

```html
<span class="flex items-center gap-2 text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
  <span class="material-symbols-outlined text-sm">male</span> Male
</span>
```

### 5.21 Section Label

Uppercase divider label used for content sections:

```html
<h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
  <span class="w-4 h-[2px] bg-primary"></span> Section Title
</h3>
```

### 5.22 Collapsible / Accordion Panel

```html
<div class="rounded-xl border border-slate-800 overflow-hidden">
  <button class="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">edit_square</span>
      <span class="text-sm font-bold uppercase tracking-wider">Title</span>
    </div>
    <span class="material-symbols-outlined text-slate-400">expand_more</span>
  </button>
  <div class="p-4 bg-background-dark/50">
    <!-- Content -->
  </div>
</div>
```

### 5.23 Quick Action Card

```html
<button class="flex flex-1 min-w-[200px] items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800 hover:border-primary/50 group">
  <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white">
    <span class="material-symbols-outlined">brush</span>
  </div>
  <div class="text-left">
    <p class="font-bold text-sm">Title</p>
    <p class="text-xs text-slate-500">Description</p>
  </div>
</button>
```

**Icon color variants**: `bg-primary/10 text-primary`, `bg-orange-500/10 text-orange-500`, `bg-purple-500/10 text-purple-500`

### 5.24 Notification Badge (Header)

```html
<button class="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-800 hover:bg-slate-700 relative">
  <span class="material-symbols-outlined text-xl">notifications</span>
  <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background-dark"></span>
</button>
```

### 5.25 User Avatar

```html
<!-- Image avatar -->
<div class="h-10 w-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
  <img class="w-full h-full object-cover" src="..." alt="User" />
</div>

<!-- Initials avatar -->
<div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
  SY
</div>

<!-- Character initial (square) -->
<div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
  Name
</div>
```

### 5.26 Data Table

```html
<div class="overflow-x-auto bg-slate-800/50 border border-slate-800 rounded-2xl">
  <table class="w-full text-left text-sm">
    <thead>
      <tr class="border-b border-slate-800">
        <th class="px-6 py-4 font-bold text-slate-500 uppercase text-xs">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
        <td class="px-6 py-4">Content</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.27 Storyboard Panel Thumbnail

```html
<!-- Default state -->
<div class="group relative bg-slate-800/50 rounded-xl p-2 border-2 border-transparent hover:border-primary/50 transition-all cursor-pointer">
  <div class="aspect-video rounded-lg mb-2 overflow-hidden bg-slate-700">
    <img class="w-full h-full object-cover" src="..." alt="..." />
  </div>
  <div class="flex justify-between items-start">
    <div>
      <span class="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">P1</span>
      <p class="text-[11px] mt-1 font-medium line-clamp-1">Panel title</p>
      <span class="text-[10px] text-slate-500">Shot type | 2.5s</span>
    </div>
    <span class="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
  </div>
</div>

<!-- Active/selected state -->
<div class="group relative bg-primary/20 rounded-xl p-2 border-2 border-primary transition-all cursor-pointer">
  ...same structure, but panel number uses bg-primary text-white
  status icon uses text-primary and sync icon
</div>

<!-- Empty/pending state -->
<div class="group relative bg-slate-800/50 rounded-xl p-2 border-2 border-transparent hover:border-primary/50 transition-all cursor-pointer">
  <div class="aspect-video rounded-lg mb-2 overflow-hidden bg-slate-700 flex items-center justify-center border border-dashed border-slate-500">
    <span class="material-symbols-outlined text-slate-500">image_not_supported</span>
  </div>
  ...panel number in bg-slate-700 text-slate-400
  status icon hourglass_empty text-slate-500
</div>
```

### 5.28 Auto-Save Indicator

```html
<div class="flex items-center gap-2">
  <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
  <span class="text-xs text-slate-500">Auto-saved (14:20)</span>
</div>
```

### 5.29 Storage Usage Widget (Sidebar Footer)

```html
<div class="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
  <div class="flex justify-between items-center mb-2">
    <span class="text-xs font-medium text-slate-400">Storage</span>
    <span class="text-xs font-bold text-primary">85%</span>
  </div>
  <div class="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
    <div class="bg-primary h-full" style="width: 85%"></div>
  </div>
</div>
```

### 5.30 Image Preview with Hover Overlay

```html
<div class="aspect-video rounded-xl bg-slate-900 overflow-hidden relative group border border-slate-800">
  <img class="w-full h-full object-cover" src="..." alt="..." />
  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
    <button class="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full">
      <span class="material-symbols-outlined text-white">play_arrow</span>
    </button>
    <button class="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full">
      <span class="material-symbols-outlined text-white">fullscreen</span>
    </button>
  </div>
</div>
```

### 5.31 Asset Detail Drawer (Slide-out Panel)

```html
<aside class="fixed right-0 top-0 h-full w-[400px] bg-background-dark border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300"
  :class="open ? 'translate-x-0' : 'translate-x-full'">
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="p-6 border-b border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">Icon</div>
        <div>
          <h3 class="font-bold">Title</h3>
          <p class="text-xs text-slate-500">Subtitle</p>
        </div>
      </div>
      <button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-500">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <!-- Scrollable body -->
    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <!-- Content sections -->
    </div>
    <!-- Footer actions -->
    <div class="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
      <button class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-lg transition-colors">Secondary</button>
      <button class="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">Primary</button>
    </div>
  </div>
</aside>
```

---

## 6. Page-by-Page Breakdown

---

### 6.1 Project List

**Route**: `/projects`
**Layout**: Pattern A (Sidebar + Content)

#### Structure

```
Sidebar (w-64)                    Main Content (flex-1, bg-[#0a0f1a])
+---------------------------+     +---------------------------------------+
| Logo: "AI Manga Editor"  |     | Sticky Header (backdrop-blur)         |
|   "Creator Studio"       |     |   Title: "My Projects"                |
|                           |     |   Subtitle                            |
| Nav:                      |     |   [+ New Project] button              |
|   [*] Projects            |     +---------------------------------------+
|   [ ] Settings            |     |                                       |
|   [ ] Docs                |     | Grid: 1/2/3/4 columns responsive     |
|                           |     |   [Card] [Card] [Card] [Card]         |
|                           |     |   [+ New Placeholder Card]            |
|                           |     |                                       |
| Footer:                   |     |                                       |
|   Storage: 85% bar        |     |                                       |
+---------------------------+     +---------------------------------------+
```

#### Sections

1. **Sticky Header**
   - `sticky top-0 z-10 bg-[#0a0f1a]/80 backdrop-blur-md px-8 py-6`
   - Title: `text-3xl font-bold text-white tracking-tight`
   - Subtitle: `text-slate-400 text-sm mt-1`
   - CTA Button: Primary button with `add` icon

2. **Project Grid**
   - `px-8 pb-12`
   - Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
   - Each card = Project Card component (5.7)
   - Last item = New Project Placeholder (5.8)

#### Data Requirements
```typescript
interface Project {
  id: string;
  title: string;
  genre: string;          // "Xianxuan", "Wuxia", etc.
  status: "draft" | "in_progress" | "published";
  coverImageUrl: string;
  progress: number;       // 0-100
  lastModifiedDate: string;
}
```

#### Responsive Behavior
- `xl` (>=1280px): 4 columns
- `lg` (>=1024px): 3 columns
- `md` (>=768px): 2 columns
- Default: 1 column
- Sidebar hidden below `lg` (implement hamburger menu)

---

### 6.2 Project Dashboard

**Route**: `/projects/:id`
**Layout**: Pattern B (Top Header + Sidebar + Content)

#### Structure

```
+-------------------------------------------------------------+
| Header: Icon + "Project Dashboard" | Search | Settings |   |
|                                    | Notif  | Avatar   |   |
+------------------+------------------------------------------+
| Sidebar (w-64)   | Breadcrumb: Projects > Title             |
|                  |                                          |
| [*] Overview     | Title Section:                          |
| [ ] Episodes     |   H1: "Project Name" (text-4xl)         |
| [ ] Assets       |   Tags: [Genre] [Status] "Ep 05"        |
| [ ] Team         |   Buttons: [Settings] [+ New Episode]   |
|                  |                                          |
|                  | Stat Row (4 cards):                      |
| [ ] Help (bottom)|   Published | Panels | Budget | Progress|
|                  |                                          |
|                  | Quick Actions (3 buttons):               |
|                  |   Asset Editor | Pipeline | Provider    |
|                  |                                          |
|                  | Two-column (2/3 + 1/3):                  |
|                  |   Episode Table     | Activity Feed     |
+------------------+------------------------------------------+
```

#### Sections

1. **Top Header Bar**
   - Fixed/sticky, full width
   - Left: App icon (`rocket_launch`) + "Project Dashboard"
   - Center-right: Search input (hidden on mobile)
   - Right: Settings button, Notification button (with red dot), User avatar

2. **Breadcrumb**
   - `flex text-sm text-slate-400 mb-2`

3. **Project Title Section**
   - `flex flex-wrap items-end justify-between gap-4`
   - Title: `text-4xl font-black tracking-tight`
   - Tags row: Genre badge (outline) + Status badge (green) + episode count text
   - Action buttons: Secondary ("Project Settings") + Primary ("New Episode")

4. **Stats Row**
   - `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`
   - 4 stat cards: Published Episodes, Total Panels, Budget, Progress
   - Budget card has progress bar + denominator text
   - Progress card has percentage + progress bar

5. **Quick Actions Row**
   - `flex flex-wrap gap-4`
   - 3 Quick Action Cards (5.23): Asset Editor, Pipeline Monitor, Provider Settings
   - Each has icon with unique color scheme

6. **Two-Column Bottom**
   - `grid grid-cols-1 xl:grid-cols-3 gap-6`
   - Left (xl:col-span-2): Episode Table
   - Right (xl:col-span-1): Activity Feed

7. **Episode Table**
   - Header: "Episode List" + "View All" link
   - Table columns: `#`, Name, Panel Count, Status, Quick Actions
   - Quick action buttons per row: Script (description), Storyboard (view_carousel), Review (rule)
   - Status indicators use dot + text pattern (5.11)

8. **Activity Feed**
   - Header: "Recent Activity"
   - Timeline component (5.18) with 4 event types
   - Bottom: "View All Pipeline Records" button (full-width secondary)

#### Data Requirements
```typescript
interface ProjectDashboard {
  id: string;
  title: string;
  genre: string;
  status: string;
  currentEpisode: number;
  stats: {
    publishedEpisodes: number;
    totalPanels: number;
    budgetUsed: number;
    budgetTotal: number;
    overallProgress: number;
  };
  episodes: Episode[];
  recentActivity: ActivityEvent[];
}

interface Episode {
  id: string;
  number: number;
  title: string;
  panelCount: number;
  status: "completed" | "in_progress" | "not_started";
}

interface ActivityEvent {
  id: string;
  type: "pipeline" | "approval" | "upload" | "warning";
  title: string;
  description: string;
  timestamp: string;
}
```

---

### 6.3 Project Setup

**Route**: `/projects/:id/settings`
**Layout**: Pattern C (Top Header + Centered Content)

#### Structure

```
+-------------------------------------------------------------+
| Header: Icon + "Project Setup" | Notification | User Menu   |
+-------------------------------------------------------------+
| Breadcrumb: Projects > Title > Settings                      |
|                                                              |
| max-w-4xl centered                                           |
|                                                              |
| [Section 1: Basic Info]                                      |
|   Title input | Genre select                                 |
|   Description textarea                                       |
|                                                              |
| [Section 2: Output Config]                                   |
|   Resolution select | Default panels | Style prefix          |
|                                                              |
| [Section 3: AI Model Config]                                 |
|   Writer model | Artist model                                |
|   Video model  | Consistency model                           |
|                                                              |
| [Section 4: Budget Control]                                  |
|   Budget limit input                                         |
|   Usage progress bar                                         |
|                                                              |
| [Footer: Reset / Save buttons]                               |
+-------------------------------------------------------------+
| Footer: Copyright                                            |
+-------------------------------------------------------------+
```

#### Sections

1. **Header**: Icon (`settings_suggest`) in primary-colored square + "Project Setup" + notification + user menu

2. **Breadcrumb**: Projects > Project Name > Settings

3. **Form Sections** (4 sections, each in a card):

   **Section 1 -- Basic Info** (icon: `info`)
   - 2-column grid on md+
   - Fields: Project Title (text input), Genre (select), Description (textarea spanning full width)

   **Section 2 -- Output Config** (icon: `output`)
   - 3-column grid on md+
   - Fields: Resolution (select: 1080x1920, 1920x1080, 1024x1024), Default Panel Count (number input), Style Prefix (text input)

   **Section 3 -- AI Model Config** (icon: `smart_toy`)
   - 2-column grid on md+
   - Fields: Writer Model (select), Artist Model (select), Video Model (select), Character Consistency Model (select)
   - Each label has an icon prefix

   **Section 4 -- Budget Control** (icon: `payments`)
   - Header right: "Real-time sync" badge
   - Budget limit input with currency prefix
   - Usage progress bar with label: "Used / Total"
   - Helper text about 80% warning threshold

4. **Footer Actions**
   - `flex items-center justify-end gap-4 pt-4 border-t border-slate-800`
   - Ghost button: "Reset"
   - Primary button: "Save Settings" with save icon

5. **Page Footer**: Copyright text centered

#### Data Requirements
```typescript
interface ProjectSettings {
  title: string;
  genre: string;
  description: string;
  resolution: string;
  defaultPanelCount: number;
  stylePrefix: string;
  writerModel: string;
  artistModel: string;
  videoModel: string;
  consistencyModel: string;
  budgetLimit: number;
  budgetUsed: number;
}
```

---

### 6.4 Asset Warehouse

**Route**: `/projects/:id/assets`
**Layout**: Pattern A (Sidebar + Content) with internal split panel

#### Structure

```
Sidebar (w-64)  | Header + Tabs                    | Search + New Asset
                | [Characters] [Scenes] [Props]    |
                +----------------------------------+---------------------------+
                | Asset List (35%)                  | Asset Detail (65%)        |
                |                                   |                           |
                | Filter bar: "All Characters (24)" |  Name + Edit btn         |
                |                                   |  Attribute pills          |
                | [Active Card - highlighted]       |  Bio text                |
                | [Card 2 - grayscale thumb]        |                           |
                | [Card 3 - grayscale thumb]        |  Appearance State tabs   |
                |                                   |  [Daily] [Battle] [Awake]|
                |                                   |                           |
                |                                   |  Visual Reference Grid   |
                |                                   |  [Front] [Side] [Back]   |
                |                                   |                           |
                |                                   |  Prompt Settings         |
                |                                   |  - Anchor prompts        |
                |                                   |  - LORA weight slider    |
                |                                   |  - Negative prompts      |
                +----------------------------------+---------------------------+
```

#### Left Panel: Asset List

- Header: count label + filter button
- `overflow-y-auto custom-scrollbar p-4 space-y-3`
- **Active card**: `p-3 bg-primary/10 border border-primary/50 rounded-xl flex gap-3`
  - Thumbnail: `w-20 h-20 rounded-lg border border-primary/20`
  - Name (bold) + Rank badge + description + metadata (appearances, last updated)
- **Inactive card**: `p-3 bg-slate-900/30 border border-slate-800 rounded-xl flex gap-3`
  - Thumbnail: `grayscale group-hover:grayscale-0 transition-all`
  - On hover: `hover:border-primary/30`

#### Right Panel: Asset Detail

- `overflow-y-auto custom-scrollbar bg-background-dark/30`
- `max-w-4xl mx-auto p-8 space-y-10`

**Sub-sections**:

1. **Identity header**: Name (text-3xl) + edit button + profile image (w-40 h-40 rounded-xl)
2. **Attribute pills**: Gender, Age, Height in rounded-full pill badges
3. **Bio text**: `text-slate-400 leading-relaxed text-sm`
4. **Appearance States**: Pill tab group for Daily/Battle/Awakened
5. **Visual Reference Grid**: `grid grid-cols-3 gap-4` with aspect-[3/4] images + hover overlay labels
6. **Prompt Settings**: Form section with anchor prompt textarea, LORA weight slider + range input, negative prompt select, "Update Global Config" button

#### Data Requirements
```typescript
interface CharacterAsset {
  id: string;
  name: string;
  nameEn: string;
  rank: "S-Rank" | "A-Rank" | "B-Rank";
  gender: string;
  age: number;
  height: string;
  description: string;
  bio: string;
  appearances: number;
  lastUpdated: string;
  profileImageUrl: string;
  thumbnailUrl: string;
  appearanceStates: AppearanceState[];
  referenceImages: { url: string; label: string }[];
  promptSettings: {
    anchorPrompt: string;
    loraWeight: number;
    negativePromptPreset: string;
  };
}
```

---

### 6.5 Script Editor

**Route**: `/projects/:id/episodes/:episodeId/script`
**Layout**: Pattern A (Sidebar + Content) with internal split (70/30)

#### Structure

```
Sidebar (w-64) | Top Header (breadcrumb + actions)                     |
               +---------------------------------------+---------------+
               | Editor Area (70%)                      | Metadata (30%)|
               |                                        |               |
               | Episode Synopsis section               | Stats: 3 boxes|
               |   [Synopsis textarea]                  | Words|Time|Est|
               |                                        |               |
               | Script Body                            | Character     |
               |   Scene Heading (border-l-4 primary)   | Entity list   |
               |   Stage direction (italic)             | [Avatar] Name |
               |   Character name [highlighted]         |               |
               |   Dialogue (centered)                  | Scene Library |
               |   Action description                   | [Grid 2-col]  |
               |                                        |               |
               |   Scene Heading 2 (border-l-4 gray)    | Mini-map      |
               |   Stage direction                      | Timeline dots |
               |                                        |               |
               +---------------------------------------+---------------+
               | Bottom Control Bar                                     |
               |   Undo | Redo | Auto-saved    Draft | Regen | Next >> |
               +-------------------------------------------------------+
```

#### Key Sections

1. **Top Header** (h-16)
   - Breadcrumb: Projects > Project > Episode > "Script Editor"
   - Right: "Auto Generate Script" outline-primary button, notification, help icons

2. **Episode Synopsis** (collapsible top panel)
   - Label: "Episode Synopsis" with `description` icon
   - "Smart Optimize" link
   - Textarea: `h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm resize-none`

3. **Script Body**
   - Background: `bg-white dark:bg-background-dark/20`
   - Content wrapper: `max-w-3xl mx-auto space-y-8`
   - **Scene heading**: `bg-slate-800 px-4 py-2 rounded font-bold text-sm tracking-widest border-l-4 border-primary`
   - **Stage direction**: `italic text-slate-500 text-sm leading-relaxed`
   - **Character name**: `text-center font-bold text-sm text-slate-500 uppercase tracking-widest` with highlighted bracket tags
   - **Dialogue**: `text-center leading-relaxed max-w-md mx-auto`
   - **Action description**: `py-2 text-sm leading-relaxed`
   - **Entity highlights** (clickable): `.editor-highlight` class (blue underline + bg)

4. **Right Metadata Panel** (30%)
   - **Stats grid** (3 boxes): Word count, Duration, Estimated panels
   - **Character entities**: Avatar initial + name + rank badge
   - **Scene library**: 2-column grid with placeholder images + scene names
   - **Mini-map timeline**: Vertical line with dots for scene markers

5. **Bottom Control Bar** (h-20)
   - `border-t border-slate-800 bg-background-dark shadow-2xl`
   - Left: Undo, Redo buttons + auto-save indicator
   - Right: "Save Draft" ghost, "Regenerate" secondary, "Next: Storyboard Planning" primary with arrow

#### Data Requirements
```typescript
interface ScriptEditorData {
  episodeId: string;
  synopsis: string;
  scenes: Scene[];
  metadata: {
    wordCount: number;
    estimatedDuration: string;
    estimatedPanels: number;
  };
  characters: { id: string; name: string; rank: string; initial: string }[];
  locations: { id: string; name: string; thumbnailUrl?: string }[];
}

interface Scene {
  id: string;
  number: number;
  location: string;
  timeOfDay: string;
  intOrExt: string;
  stageDirection: string;
  blocks: (DialogueBlock | ActionBlock)[];
}
```

---

### 6.6 Script Editor (Integrated)

**Route**: `/projects/:id/episodes/:episodeId/script` (same page, with asset panel open)
**Layout**: Same as 6.5 but with an additional slide-out drawer and sync status

#### Differences from 6.5

1. **Asset sync status bar** below metadata stats:
   - `px-6 py-2 border-b border-slate-800 flex items-center justify-between bg-emerald-500/5`
   - Green icon + "Asset Library syncing in real-time" + last update timestamp

2. **Entity list enhanced**: Add/edit buttons alongside section headers
   - `<button class="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500">`
   - "Create New Character Asset" dashed button below character list

3. **Right-side drawer** (Asset Detail Drawer, component 5.31):
   - Opens when clicking a character entity highlight
   - 400px wide, slides from right
   - Shows: Character basics, personality, appearance description, reference image grid
   - Footer: "View in Asset Library" + "Update & Sync" buttons

4. **Bottom bar enhanced**:
   - Additional "Generate Assets" button
   - "Next: Storyboard Planning" + "Update Storyboard" buttons

---

### 6.7 Storyboard Editor

**Route**: `/projects/:id/episodes/:episodeId/storyboard`
**Layout**: Pattern D (Top Nav + Split Panel 40/60 + Status Footer)

#### Structure

```
+-------------------------------------------------------------+
| Top Nav: Icon "Storyboard Editor" | Tabs | Search | Save    |
+-------------------------+-----------------------------------+
| Left (40%)              | Right (60%)                       |
|                         |                                   |
| Breadcrumb trail        | Panel header: P3 Title  [del][dup]|
| [Auto Plan] [Insert]    |                                   |
| Stats: 20 panels, 38.5s | Image Preview (aspect-video)     |
|                         | Hover: play + fullscreen          |
| Grid (2-col):           |                                   |
| [P1 thumb] [P2 thumb]  | Version selector: v3 v2 v1       |
| [P3 active] [P4 empty] | Action buttons: Generate | Video  |
|                         |                                   |
|                         | Shot Design (4-col grid):         |
|                         | Shot type | Angle | Motion | Dur  |
|                         |                                   |
|                         | Content (2-col):                  |
|                         | Action desc | Dialogue            |
|                         | Mood + Emotion | Narration/SFX    |
|                         |                                   |
|                         | Associations (tag chips)          |
|                         |                                   |
|                         | Prompt sections (collapsible):    |
|                         | Image prompt | Video prompt       |
+-------------------------+-----------------------------------+
| Status: Render ready | GPU 24% | Keyboard shortcuts         |
+-------------------------------------------------------------+
```

#### Top Navigation Bar

- `flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-background-dark/50 backdrop-blur-md`
- Left: `movie_edit` icon + "Storyboard Editor" + horizontal nav tabs (Projects, Assets, Storyboard Editor, Export)
- Right: Search input + Save button (primary) + Settings icon button

#### Left Panel: Panel Grid

1. **Breadcrumb**: Compact inline breadcrumb
2. **Action bar**: "Auto Plan" (outline primary) + "Insert Panel" (secondary) buttons + panel count + total duration
3. **Grid**: `grid grid-cols-2 gap-4` with Panel Thumbnail components (5.27)

#### Right Panel: Panel Details

1. **Panel header**: `p-4 border-b border-slate-800`
   - Panel number badge + title
   - Delete + Duplicate icon buttons

2. **Image preview**: Full-width aspect-video with hover overlay (play + fullscreen)

3. **Version selector**: Row of version buttons (5.17) + generation action buttons

4. **Shot design**: `grid grid-cols-4 gap-4`
   - Shot type select (Wide/Medium/Close/Extreme)
   - Angle select (Eye Level/High/Low)
   - Camera movement select (Static/Zoom/Pan)
   - Duration number input with "s" suffix

5. **Content section**: `grid grid-cols-2 gap-6`
   - Left: Action description textarea + Mood/Emotion inputs (2-col sub-grid)
   - Right: Dialogue textarea (with `border-l-4 border-primary/50`) + Narration/SFX input

6. **Associations**: Asset tag chips (5.19) with add button

7. **Prompt sections**: Two collapsible accordions (5.22) for image and video prompts

#### Status Footer

- `h-10 border-t border-slate-800 bg-background-dark text-[10px] font-bold text-slate-500 uppercase tracking-widest`
- Left: Render status + GPU usage
- Right: Keyboard shortcut hints

#### Data Requirements
```typescript
interface StoryboardPanel {
  id: string;
  number: number;
  title: string;
  imageUrl?: string;
  videoUrl?: string;
  status: "completed" | "generating" | "pending";
  currentVersion: number;
  versions: PanelVersion[];
  shotDesign: {
    shotType: string;
    angle: string;
    cameraMovement: string;
    duration: number;
  };
  content: {
    actionDescription: string;
    dialogue: string;
    mood: string;
    emotion: string;
    narration: string;
  };
  associations: {
    type: "character" | "prop" | "location";
    name: string;
    id: string;
  }[];
  prompts: {
    imagePrompt: string;
    videoPrompt: string;
  };
}
```

---

### 6.8 Storyboard Regenerate

**Route**: `/projects/:id/episodes/:episodeId/storyboard` (same page, regeneration mode)
**Layout**: Same as 6.7

#### Differences from 6.7

This is the same Storyboard Editor page but with the regeneration UI active in the right panel.

1. **Panel header enhanced**: Adds "Regenerate All" button:
   - `flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold`
   - Icon: `autorenew`

2. **Generation buttons expanded**: Each generation type (Image, Video, Audio) now has both a "Generate" primary button and a "Regenerate" outline button:
   - Generate: `bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20`
   - Regenerate: `bg-transparent border border-primary/50 text-primary hover:bg-primary/10 rounded-lg text-sm font-bold`
   - Video generate: `bg-slate-800 text-white border border-slate-700`
   - Video regenerate: `bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800`

3. **Active panel thumbnail**: Shows loading overlay with pulsing refresh icon:
   - `absolute inset-0 flex items-center justify-center bg-black/40`
   - `material-symbols-outlined text-white text-3xl animate-pulse: refresh`

This is a UI state, not a separate page. Implement as conditional rendering within the storyboard editor.

---

### 6.9 Version Comparison

**Route**: `/projects/:id/episodes/:episodeId/storyboard/panels/:panelId/compare`
**Layout**: Pattern C (Top Header + Centered Content, scrollable)

#### Structure

```
+-------------------------------------------------------------+
| Header: Icon "Storyboard Editor" | Tabs | Save | Avatar     |
+-------------------------------------------------------------+
| Breadcrumb: Project > Scene 4 > Panel 12 Comparison         |
|                                                              |
| Title: "Compare Iterations"                                  |
| Subtitle text                                                |
| Toggle: [Side-by-side] [Overlay]                             |
|                                                              |
| Two-column comparison grid:                                  |
| +---------------------------+  +---------------------------+ |
| | V1: Original Concept     |  | V3: Enhanced Lighting     | |
| | [Timestamp]               |  | [LATEST VERSION badge]    | |
| |                           |  |                           | |
| | [Image preview]           |  | [Image preview]           | |
| |                           |  |                           | |
| | AI Prompt text            |  | AI Prompt (highlighted)   | |
| |                           |  |                           | |
| | Model + Inference time    |  | Model + Inference time    | |
| |                           |  |                           | |
| | [Select as Final] outline |  | [Select as Final] filled  | |
| +---------------------------+  +---------------------------+ |
|                                                              |
| Version History (horizontal scroll):                         |
| [V1] [V2] [V3 active] [+ New]                               |
+-------------------------------------------------------------+
```

#### Sections

1. **Header Bar**: Same pattern as Storyboard Editor but with "Versions" tab active

2. **Title Section**:
   - Breadcrumb: Project > Scene > Panel Comparison
   - Title: `text-3xl md:text-4xl font-bold tracking-tight`
   - Description: `text-slate-400 mt-1 max-w-2xl`
   - View toggle: Side-by-side / Overlay pill group

3. **Comparison Grid**: `grid grid-cols-1 lg:grid-cols-2 gap-8`

   **Standard Version Card** (V1):
   - `bg-panel-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl`
   - Header: Version badge (bg-slate-700) + label + timestamp
   - Image: `aspect-video` with hover zoom + fullscreen button overlay
   - Prompt: `bg-slate-900/50 p-4 rounded-lg border border-border-dark/50 text-slate-300 text-sm`
   - Specs: Model name + Inference time in 2-column grid
   - Action: Outline "Select as Final" button

   **Active/Latest Version Card** (V3):
   - `bg-panel-dark border-2 border-primary rounded-xl shadow-[0_0_40px_rgba(37,106,244,0.15)]`
   - "Latest Version" corner badge: `absolute top-0 right-0 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg`
   - Header bg: `bg-primary/10`
   - Version badge: `bg-primary text-white`
   - Prompt shows highlighted diffs: `<span class="text-primary font-semibold">changed text</span>`
   - Prompt bg: `bg-primary/5 p-4 rounded-lg border border-primary/20`
   - Action: Filled primary "Select as Final" with star icon

4. **Version History Timeline**:
   - `mt-12 border-t border-border-dark pt-8`
   - Title: "Version History" with `history` icon
   - Horizontal scroll: `flex gap-4 overflow-x-auto pb-4`
   - Version thumbnail: `min-w-[120px] aspect-[4/3] bg-slate-800 border border-border-dark rounded-lg flex flex-col items-center justify-center`
   - Active: `border-2 border-primary` with primary-colored text
   - Add new: `border border-dashed border-border-dark` with plus icon

#### Data Requirements
```typescript
interface VersionComparison {
  panelId: string;
  panelNumber: number;
  sceneName: string;
  versions: PanelVersion[];
  selectedVersionId?: string;
}

interface PanelVersion {
  id: string;
  versionNumber: number;
  label: string;
  imageUrl: string;
  prompt: string;
  promptHighlights?: string[];  // diff segments
  modelUsed: string;
  inferenceTime: number;        // seconds
  createdAt: string;
  isLatest: boolean;
}
```

---

## 7. Interaction Patterns

### 7.1 Navigation

- **Sidebar navigation**: Click to navigate between project-level pages
- **Top tab navigation**: Used in storyboard editor for sub-section switching
- **Breadcrumbs**: All pages include breadcrumbs; each segment is a clickable link except the current page

### 7.2 Hover Effects

| Element              | Hover Behavior                                                  |
|----------------------|-----------------------------------------------------------------|
| Project card         | Border turns `primary/50`, shadow appears, image zooms 110%    |
| Nav item             | Background becomes `slate-800`                                 |
| Primary button       | Opacity to 90%, shadow intensifies                             |
| Quick action card    | Border turns `primary/50`, icon container fills with solid color|
| Table row            | Background becomes `slate-800/80`                              |
| Panel thumbnail      | Border turns `primary/50`                                      |
| Image preview        | Overlay fades in with play/fullscreen buttons                  |
| Asset thumbnail      | Grayscale filter removes (`group-hover:grayscale-0`)           |
| Reference image      | Gradient overlay with label fades in                           |

### 7.3 Active/Selected States

| Element              | Active State                                                    |
|----------------------|-----------------------------------------------------------------|
| Nav item             | `bg-primary/10 text-primary` + optional `border border-primary/20` |
| Tab (underline)      | `border-b-2 border-primary text-primary font-bold`             |
| Tab (pill)           | `bg-slate-800 shadow-sm text-primary`                          |
| Panel thumbnail      | `bg-primary/20 border-2 border-primary`                        |
| Version card         | `border-2 border-primary` + glow shadow                        |
| Asset list item      | `bg-primary/10 border border-primary/50`                       |
| Version button       | `bg-primary text-white`                                        |

### 7.4 Loading States

| Context              | Pattern                                                        |
|----------------------|----------------------------------------------------------------|
| Panel generating     | Overlay with `bg-black/40` + pulsing `refresh` icon            |
| Status dot           | `animate-pulse` on the colored dot                             |
| Auto-save            | Green dot with `animate-pulse`                                 |

### 7.5 Transitions

All interactive elements use `transition-colors` or `transition-all` for smooth state changes. Image zoom uses `transition-transform duration-500`. Drawer slide uses `transition-transform duration-300`.

---

## 8. Responsive Behavior

### 8.1 Breakpoints (Tailwind Defaults)

| Breakpoint | Min Width | Usage                                      |
|------------|-----------|---------------------------------------------|
| Default    | 0px       | Single column, sidebar hidden               |
| `md`       | 768px     | 2-column grids, form grids                  |
| `lg`       | 1024px    | Sidebar visible, 3-column project grid      |
| `xl`       | 1280px    | 4-column project grid, 3-column dashboard   |

### 8.2 Sidebar Behavior

- **lg and up**: Visible as `w-64` fixed sidebar
- **Below lg**: Hidden (`hidden lg:flex`). Implement a hamburger menu to toggle.

### 8.3 Split Panel Behavior

- **Script Editor (70/30)**: Below lg, stack vertically (metadata below editor)
- **Asset Warehouse (35/65)**: Below lg, stack vertically (list above detail)
- **Storyboard Editor (40/60)**: Below lg, full-width panel list with detail as overlay/modal

### 8.4 Project Grid

- `grid-cols-1` -> `md:grid-cols-2` -> `lg:grid-cols-3` -> `xl:grid-cols-4`

### 8.5 Stat Cards

- `grid-cols-1` -> `md:grid-cols-2` -> `lg:grid-cols-4`

### 8.6 Version Comparison

- `grid-cols-1` -> `lg:grid-cols-2`

---

## 9. Accessibility Notes

### 9.1 Current Implementation Gaps (to fix)

- Many interactive `<div>` elements should be `<button>` or `<a>` elements
- Add `aria-label` to icon-only buttons
- Add `aria-current="page"` to active navigation items
- Add `role="tablist"`, `role="tab"`, `role="tabpanel"` to tab components
- Add `aria-selected` to active tabs and selected panels
- Form inputs need associated `<label>` elements (use `htmlFor`)
- Color-only status indicators need text alternatives
- Auto-save status should be announced to screen readers via `aria-live="polite"`

### 9.2 Keyboard Navigation

- All interactive elements must be focusable and operable via keyboard
- Tab order should follow visual reading order
- Escape should close drawers and modals
- Storyboard editor should support arrow key navigation between panels
- Bottom bar mentions shortcuts: Space (play), J/L (jump), S (save)

### 9.3 Focus Management

- Add `focus:ring-2 focus:ring-primary/50 focus:border-primary` to all interactive elements
- When drawer opens, focus should move to the drawer
- When drawer closes, focus should return to the triggering element

---

## Appendix A: Complete Material Symbols Icon Reference

All icons used across the 9 screens:

| Icon Name              | Usage Context                                  |
|------------------------|------------------------------------------------|
| `folder`               | Projects nav item                              |
| `settings`             | Settings nav/button                            |
| `description`          | Docs nav, Script action                        |
| `add`                  | New project/episode/asset buttons              |
| `calendar_today`       | Date display                                   |
| `more_horiz`           | Card action menus                              |
| `rocket_launch`        | Dashboard header icon                          |
| `search`               | Search inputs                                  |
| `notifications`        | Notification bell                              |
| `dashboard`            | Overview nav item                              |
| `movie` / `movie_edit` | Episodes nav item / Storyboard icon            |
| `inventory_2`          | Asset Warehouse nav item                       |
| `group`                | Team nav item                                  |
| `help`                 | Help center nav item / help button             |
| `trending_up`          | Stat trend indicator                           |
| `brush`                | Asset editor quick action                      |
| `account_tree`         | Pipeline monitor / mini-map                    |
| `hub`                  | Provider settings                              |
| `view_carousel`        | Storyboard quick action                        |
| `rule`                 | Review/audit action                            |
| `bolt`                 | Pipeline success event                         |
| `check`                | Approval event                                 |
| `upload`               | Upload event                                   |
| `warning`              | Warning event                                  |
| `settings_suggest`     | Project setup header                           |
| `person`               | User icon / character association               |
| `chevron_right`        | Breadcrumb separator                           |
| `info`                 | Basic info section icon                        |
| `output`               | Output config section icon                     |
| `smart_toy`            | AI model section icon                          |
| `edit_note`            | Writer model label icon                        |
| `palette`              | Artist model label / generate image            |
| `face`                 | Consistency model label                        |
| `payments`             | Budget section icon                            |
| `save`                 | Save buttons                                   |
| `male`                 | Gender attribute                               |
| `cake`                 | Age attribute                                  |
| `height`               | Height attribute                               |
| `edit`                 | Edit button                                    |
| `visibility`           | Appearance count                               |
| `history`              | Last updated / version history                 |
| `filter_list`          | Filter button                                  |
| `auto_awesome`         | App logo icon (script editor)                  |
| `movie_edit`           | Episodes nav active                            |
| `magic_button`         | Auto-generate script                           |
| `person_search`        | Character entities section                     |
| `location_on`          | Scene/location section                         |
| `undo` / `redo`        | Editor undo/redo                               |
| `refresh`              | Regenerate action                              |
| `arrow_forward`        | Next step button                               |
| `cloud_done`           | Asset sync status                              |
| `person_add`           | Create new character                           |
| `close`                | Close drawer/modal                             |
| `zoom_in`              | Fullscreen/zoom image                          |
| `portrait`             | Placeholder image                              |
| `add_photo_alternate`  | Add reference image                            |
| `auto_fix_high`        | Auto-plan storyboard                           |
| `add_box`              | Insert panel                                   |
| `check_circle`         | Panel completed status                         |
| `sync`                 | Panel generating status                        |
| `hourglass_empty`      | Panel pending status                           |
| `image_not_supported`  | No image placeholder                           |
| `delete`               | Delete action                                  |
| `content_copy`         | Duplicate action                               |
| `play_arrow`           | Play video                                     |
| `fullscreen`           | Fullscreen view                                |
| `volume_up`            | Audio/voiceover                                |
| `edit_square`          | Image prompt section                           |
| `movie_creation`       | Video prompt section                           |
| `expand_more`          | Accordion expand                               |
| `autorenew`            | Regenerate all                                 |
| `model_training`       | Model info                                     |
| `timer`                | Inference time                                 |
| `star`                 | Select as final (preferred)                    |
| `grid_view`            | Project breadcrumb icon                        |
| `add_circle`           | New version                                    |

---

## Appendix B: Route Map

| Route                                                    | Page                | Layout |
|----------------------------------------------------------|---------------------|--------|
| `/projects`                                              | Project List        | A      |
| `/projects/:id`                                          | Project Dashboard   | B      |
| `/projects/:id/settings`                                 | Project Setup       | C      |
| `/projects/:id/assets`                                   | Asset Warehouse     | A+Split|
| `/projects/:id/episodes/:epId/script`                    | Script Editor       | A+Split|
| `/projects/:id/episodes/:epId/storyboard`                | Storyboard Editor   | D      |
| `/projects/:id/episodes/:epId/storyboard/panels/:pId/compare` | Version Comparison | C |

---

## Appendix C: Design Tokens Quick Reference

For the Tailwind config, here is the complete token set:

```javascript
// tailwind.config.ts
export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#256af4",
        "background-dark": "#101622",
        "background-light": "#f5f6f8",
        "panel-dark": "#1a2234",
        "border-dark": "#314368",
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Noto Sans SC"', "sans-serif"],
      },
    },
  },
};
```

The app exclusively uses Tailwind's built-in `slate` color palette for grays (slate-100 through slate-900) combined with the custom `primary` and `background-dark` tokens defined above. No additional gray palette is needed.

---

*End of specification. This document covers all 9 screens from the Stitch design files. The frontend developer should be able to implement every page, component, and interaction from this spec alone without referencing the original Stitch HTML or screenshots.*
