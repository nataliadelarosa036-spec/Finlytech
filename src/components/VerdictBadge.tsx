import { cn } from '@/utils/cn';

interface VerdictBadgeProps {
  verdict: 'green' | 'yellow' | 'red';
  className?: string;
  children: React.ReactNode;
}

const config = {
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500', shadow: 'shadow-[0_0_6px_rgba(16,185,129,0.4)]' },
  yellow: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500', shadow: '' },
  red: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500', shadow: '' },
};

export function VerdictBadge({ verdict, className, children }: VerdictBadgeProps) {
  const c = config[verdict];
  return (
    <span className={cn('pill font-semibold', c.bg, c.text, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot, c.shadow)} />
      {children}
    </span>
  );
}
