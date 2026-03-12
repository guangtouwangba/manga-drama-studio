import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'icon' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 border border-slate-700',
  ghost:
    'text-slate-400 font-medium hover:bg-slate-800 hover:text-slate-200',
  outline:
    'bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary/20',
  icon:
    'text-slate-500 hover:bg-slate-800 hover:text-slate-200',
  danger:
    'bg-red-500/10 text-red-400 font-bold border border-red-500/20 hover:bg-red-500/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-8 py-3 text-base rounded-xl gap-2',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-lg',
  lg: 'w-12 h-12 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isIconOnly = variant === 'icon';

  const classes = [
    'inline-flex items-center justify-center transition-all cursor-pointer',
    variantClasses[variant],
    isIconOnly ? iconSizeClasses[size] : sizeClasses[size],
    props.disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}
