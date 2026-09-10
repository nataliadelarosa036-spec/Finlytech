import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionCardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Visual variant */
  variant?: 'default' | 'brand' | 'glass';
  /** Show a colored left accent bar */
  accent?: string;
}

export function SectionCard({
  title,
  action,
  children,
  className,
  onClick,
  variant = 'default',
  accent,
}: SectionCardProps) {
  const base = cn(
    variant === 'brand' ? 'card-brand text-white' :
      variant === 'glass' ? 'card-glass' :
        'card',
    'p-5',
    onClick && 'card-hover',
    accent && 'border-l-2',
    className,
  );

  return (
    <section
      className={base}
      onClick={onClick}
      style={accent ? { borderLeftColor: accent } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn('label', variant === 'brand' ? 'text-white/60' : '')}>{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
