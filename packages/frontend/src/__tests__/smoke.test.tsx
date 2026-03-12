/**
 * Smoke tests – verify every page and shared component mounts without throwing.
 *
 * Pages that use useParams are wrapped in MemoryRouter with the appropriate
 * initial entry so params like :id and :eid are populated.
 *
 * The axios-based API client is vi.mock'd so network calls never actually fire;
 * every page already falls back to mock data on any API error, so the mocked
 * rejection is enough to keep tests self-contained.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mock the axios API client so no real HTTP requests are made.
// Every call rejects – pages handle this by falling back to inline mock data.
// ---------------------------------------------------------------------------
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error('network unavailable')),
    post: vi.fn().mockRejectedValue(new Error('network unavailable')),
    put: vi.fn().mockRejectedValue(new Error('network unavailable')),
    delete: vi.fn().mockRejectedValue(new Error('network unavailable')),
  },
}));

// Silence expected console.error noise from React about act() wrapping async
// state updates that happen after render in useEffect calls.
beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ---------------------------------------------------------------------------
// Lazy-import pages (after mocks are registered)
// ---------------------------------------------------------------------------
import App from '../App';
import ProjectList from '../pages/ProjectList';
import ProjectDashboard from '../pages/ProjectDashboard';
import ProjectSetup from '../pages/ProjectSetup';
import AssetWarehouse from '../pages/AssetWarehouse';
import ScriptEditor from '../pages/ScriptEditor';
import StoryboardEditor from '../pages/StoryboardEditor';

// ---------------------------------------------------------------------------
// Shared component imports
// ---------------------------------------------------------------------------
import Button from '../components/Button';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a page component in a MemoryRouter with a project-level route. */
function renderWithProjectRoute(
  element: React.ReactElement,
  path: string,
  initialEntry: string,
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

describe('App', () => {
  it('renders without crashing', () => {
    // App already contains its own BrowserRouter – render it directly.
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Page: ProjectList
// ---------------------------------------------------------------------------

describe('ProjectList page', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectList />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(container).toBeTruthy();
  });

  it('shows the page heading', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectList />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('我的项目')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Page: ProjectDashboard
// ---------------------------------------------------------------------------

describe('ProjectDashboard page', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProjectRoute(
      <ProjectDashboard />,
      '/projects/:id',
      '/projects/1',
    );
    expect(container).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Page: ProjectSetup
// ---------------------------------------------------------------------------

describe('ProjectSetup page', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProjectRoute(
      <ProjectSetup />,
      '/projects/:id/setup',
      '/projects/1/setup',
    );
    expect(container).toBeTruthy();
  });

  it('shows the page heading', () => {
    renderWithProjectRoute(
      <ProjectSetup />,
      '/projects/:id/setup',
      '/projects/1/setup',
    );
    expect(screen.getByText('项目设置')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Page: AssetWarehouse
// ---------------------------------------------------------------------------

describe('AssetWarehouse page', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProjectRoute(
      <AssetWarehouse />,
      '/projects/:id/assets',
      '/projects/1/assets',
    );
    expect(container).toBeTruthy();
  });

  it('shows the asset warehouse heading', () => {
    renderWithProjectRoute(
      <AssetWarehouse />,
      '/projects/:id/assets',
      '/projects/1/assets',
    );
    // The text appears in both the sidebar nav item and the page <h1>; query
    // the heading role explicitly to match the page title.
    expect(screen.getByRole('heading', { name: '资产仓库' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Page: ScriptEditor
// ---------------------------------------------------------------------------

describe('ScriptEditor page', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProjectRoute(
      <ScriptEditor />,
      '/projects/:id/episodes/:eid/script',
      '/projects/1/episodes/1/script',
    );
    expect(container).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Page: StoryboardEditor
// ---------------------------------------------------------------------------

describe('StoryboardEditor page', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProjectRoute(
      <StoryboardEditor />,
      '/projects/:id/episodes/:eid/storyboard',
      '/projects/1/episodes/1/storyboard',
    );
    expect(container).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------

describe('Button component', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders all variants without crashing', () => {
    const variants = ['primary', 'secondary', 'ghost', 'outline', 'danger'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument();
      unmount();
    }
  });

  it('renders as disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});

describe('Card component', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders each variant without crashing', () => {
    const variants = ['default', 'form', 'interactive', 'stat', 'dashed'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Card variant={variant}>content</Card>);
      expect(screen.getByText('content')).toBeInTheDocument();
      unmount();
    }
  });
});

describe('StatusBadge component', () => {
  it('renders completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('已完成')).toBeInTheDocument();
  });

  it('renders in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('renders draft status', () => {
    render(<StatusBadge status="draft" />);
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });

  it('falls back gracefully for unknown status', () => {
    render(<StatusBadge status="unknown_status" />);
    // Falls back to not_started config
    expect(screen.getByText('未开始')).toBeInTheDocument();
  });
});

describe('Tabs component', () => {
  const sampleTabs = [
    { id: 'tab1', label: '标签一' },
    { id: 'tab2', label: '标签二' },
    { id: 'tab3', label: '标签三' },
  ];

  it('renders underline variant', () => {
    render(
      <Tabs tabs={sampleTabs} activeId="tab1" onChange={() => {}} variant="underline" />,
    );
    expect(screen.getByRole('tab', { name: '标签一' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '标签二' })).toBeInTheDocument();
  });

  it('renders pill variant', () => {
    render(
      <Tabs tabs={sampleTabs} activeId="tab2" onChange={() => {}} variant="pill" />,
    );
    expect(screen.getByRole('tab', { name: '标签二' })).toBeInTheDocument();
  });

  it('renders toggle variant', () => {
    render(
      <Tabs tabs={sampleTabs} activeId="tab3" onChange={() => {}} variant="toggle" />,
    );
    expect(screen.getByRole('tab', { name: '标签三' })).toBeInTheDocument();
  });

  it('marks the active tab with aria-selected', () => {
    render(
      <Tabs tabs={sampleTabs} activeId="tab1" onChange={() => {}} />,
    );
    const activeTab = screen.getByRole('tab', { name: '标签一' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });
});
