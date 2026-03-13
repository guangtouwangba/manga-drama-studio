import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'form' | 'interactive' | 'stat' | 'compact' | 'dashed' | 'comparison';
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  default: 'bg-white rounded-[24px] p-6',
  form: 'bg-white rounded-[24px] p-6',
  interactive:
    'bg-white rounded-[24px] p-6 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow cursor-pointer',
  stat: 'bg-white rounded-[24px] p-6',
  compact: 'bg-white rounded-[24px] p-5',
  dashed:
    'border-2 border-dashed border-bdr rounded-[24px] p-8 hover:border-accent/50 hover:bg-accent-light/50 transition-all cursor-pointer flex flex-col items-center justify-center',
  comparison: 'bg-white rounded-[16px] overflow-hidden',
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
