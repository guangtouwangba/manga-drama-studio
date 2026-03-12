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
    'bg-txt-primary hover:bg-[#333] active:scale-[0.98] text-white font-bold',
  secondary:
    'border border-bdr text-txt-primary font-bold hover:bg-surface-subtle',
  ghost:
    'text-txt-secondary font-medium hover:text-txt-primary',
  outline:
    'bg-accent-light text-accent font-bold border border-accent/20 hover:bg-accent/20',
  icon:
    'text-txt-secondary hover:bg-surface-subtle',
  danger:
    'bg-status-failed/10 text-status-failed font-bold border border-status-failed/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-full gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-full gap-2',
  lg: 'px-8 py-3 text-base rounded-full gap-2',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-8 h-8 rounded-full',
  md: 'w-10 h-10 rounded-full',
  lg: 'w-12 h-12 rounded-full',
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
    props.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
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
