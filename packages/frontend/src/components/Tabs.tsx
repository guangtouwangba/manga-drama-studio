import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pill' | 'toggle';
}

export default function Tabs({ tabs, activeId, onChange, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className="flex gap-2 p-1 bg-surface-subtle rounded-full w-fit" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeId === tab.id
                ? 'bg-white shadow-sm text-accent'
                : 'text-txt-muted hover:text-txt-secondary'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-accent-light text-accent text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'toggle') {
    return (
      <div className="flex bg-surface-subtle p-1 rounded-full border border-bdr" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
              activeId === tab.id
                ? 'bg-accent text-white'
                : 'text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  // underline
  return (
    <nav className="flex h-full gap-6 border-b border-bdr" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeId === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            activeId === tab.id
              ? 'border-accent text-accent font-bold'
              : 'border-transparent text-txt-muted hover:text-txt-secondary'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className="bg-accent-light text-accent text-[10px] px-2 py-0.5 rounded-full font-bold">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
