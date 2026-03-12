interface ProgressBarProps {
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

export default function ProgressBar({
  percent,
  size = 'sm',
  glow = false,
  className = '',
}: ProgressBarProps) {
  const heightClass = size === 'lg' ? 'h-3' : size === 'md' ? 'h-2' : 'h-1.5';
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="进度"
      className={`w-full bg-[#EEEEE8] ${heightClass} rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`bg-accent h-full rounded-full transition-all duration-500 ${
          glow ? 'shadow-[0_0_10px_rgba(124,106,242,0.3)]' : ''
        }`}
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
}
