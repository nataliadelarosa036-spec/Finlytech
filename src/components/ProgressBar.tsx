import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  height?: string;
  animated?: boolean;
  glow?: boolean;
  striped?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color = '#13a8a1',
  trackColor,
  className,
  height = 'h-2',
  animated = true,
  glow = false,
  striped = false,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        'w-full rounded-full overflow-hidden',
        height,
        className,
      )}
      style={{
        background: trackColor ?? 'rgba(19,168,161,0.08)',
      }}
    >
      <div
        className={cn(
          'rounded-full h-full',
          animated && 'transition-all duration-700 ease-out',
          glow && 'shadow-glow-sm',
          striped && 'progress-shimmer',
        )}
        style={{
          width: `${pct}%`,
          background: pct > 90
            ? `linear-gradient(90deg, ${color}, ${color}cc)`
            : color,
          boxShadow: glow ? `0 0 8px ${color}60` : undefined,
        }}
      />
    </div>
  );
}
