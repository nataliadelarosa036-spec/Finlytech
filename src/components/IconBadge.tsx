import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface IconBadgeProps {
  icon: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconBadge({ icon, color = '#13a8a1', size = 'md', className }: IconBadgeProps) {
  const sizes = {
    xs: 'w-7 h-7 text-sm rounded-xl',
    sm: 'w-9 h-9 text-base rounded-xl',
    md: 'w-11 h-11 text-xl rounded-2xl',
    lg: 'w-14 h-14 text-2xl rounded-2xl',
  };

  return (
    <div
      className={cn('flex items-center justify-center shrink-0', sizes[size], className)}
      style={{ background: `${color}18` }}
    >
      <span role="img">{icon}</span>
    </div>
  );
}

interface IconCircleProps {
  icon: LucideIcon;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconCircle({ icon: Icon, color = '#13a8a1', size = 'md', className }: IconCircleProps) {
  const containerSizes = { xs: 'w-7 h-7 rounded-xl', sm: 'w-9 h-9 rounded-xl', md: 'w-11 h-11 rounded-2xl', lg: 'w-14 h-14 rounded-2xl' };
  const iconSizes = { xs: 13, sm: 15, md: 20, lg: 26 };

  return (
    <div
      className={cn('flex items-center justify-center shrink-0', containerSizes[size], className)}
      style={{ background: `${color}18`, color }}
    >
      <Icon size={iconSizes[size]} strokeWidth={2} />
    </div>
  );
}
