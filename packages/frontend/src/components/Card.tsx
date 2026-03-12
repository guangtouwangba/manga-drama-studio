import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'form' | 'interactive' | 'stat' | 'dashed' | 'comparison';
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-800/50 rounded-2xl border border-slate-800 p-5',
  form: 'bg-slate-900/50 rounded-xl p-6 border border-slate-800 shadow-sm',
  interactive:
    'bg-slate-800/50 rounded-2xl border border-slate-800 p-5 hover:border-primary/50 group cursor-pointer transition-all',
  stat: 'bg-slate-800/50 p-5 rounded-2xl border border-slate-800',
  dashed:
    'border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer',
  comparison: 'bg-panel-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden',
};

export default function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
