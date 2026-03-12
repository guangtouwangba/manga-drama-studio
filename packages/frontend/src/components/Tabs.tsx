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
      <div className="flex gap-2 p-1 bg-slate-900 rounded-lg w-fit" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-6 py-1.5 rounded-md text-sm font-bold transition-colors ${
              activeId === tab.id
                ? 'bg-slate-800 shadow-sm text-primary'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
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
      <div className="flex bg-slate-800/50 p-1 rounded-lg border border-border-dark" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeId === tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-sm font-bold rounded transition-colors ${
              activeId === tab.id
                ? 'bg-primary text-white'
                : 'text-slate-400 hover:text-white'
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
    <nav className="flex h-full gap-6 border-b border-slate-800" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeId === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
            activeId === tab.id
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
