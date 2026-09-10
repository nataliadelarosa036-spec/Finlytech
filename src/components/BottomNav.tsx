import { NavLink } from 'react-router-dom';
import { Home, Wallet, TrendingUp, BarChart2, User } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/money', label: 'Dinero', icon: Wallet, end: false },
  { to: '/wealth', label: 'Patrimonio', icon: TrendingUp, end: false },
  { to: '/insights', label: 'Análisis', icon: BarChart2, end: false },
  { to: '/profile', label: 'Perfil', icon: User, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass-nav safe-bottom">
      <div className="flex items-stretch justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex-1"
            >
              {({ isActive }) => (
                <div className={cn(
                  'h-full flex flex-col items-center justify-center gap-1 relative transition-all duration-300',
                  isActive ? 'text-amber-600 dark:text-amber-400' : 'text-ink-400 dark:text-ink-500',
                )}>
                  {isActive && (
                    <span className="absolute top-2 w-10 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-500/15" />
                  )}
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    className="relative z-10"
                    style={{ transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  <span className={cn('text-[10px] leading-none relative z-10', isActive ? 'font-bold' : 'font-medium')}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30" />
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
