import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Wallet, TrendingUp, BarChart2, User, Plus,
  ArrowLeftRight, LayoutGrid, CreditCard,
  Target, AlertCircle, BarChart, Repeat,
  Sparkles, Heart, FlaskConical, HelpCircle, Download,
} from 'lucide-react';
import { useStore } from '@/state/store';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { useState } from 'react';
import { TransactionSheet } from './TransactionSheet';
import logo from '@/logo/logofynlytech.png';

const NAV = [
  {
    section: null,
    items: [
      { to: '/', label: 'Inicio', icon: Home, end: true },
    ],
  },
  {
    section: 'Dinero',
    root: '/money',
    items: [
      { to: '/money', label: 'Movimientos', icon: ArrowLeftRight, end: true },
      { to: '/money/plan', label: 'Plan', icon: LayoutGrid },
      { to: '/money/cards', label: 'Tarjetas', icon: CreditCard },
    ],
  },
  {
    section: 'Patrimonio',
    root: '/wealth',
    items: [
      { to: '/wealth', label: 'Metas', icon: Target, end: true },
      { to: '/wealth/debts', label: 'Deudas', icon: AlertCircle },
      { to: '/wealth/investments', label: 'Inversiones', icon: BarChart },
      { to: '/wealth/subscriptions', label: 'Suscripciones', icon: Repeat },
    ],
  },
  {
    section: 'Análisis',
    root: '/insights',
    items: [
      { to: '/insights', label: 'Copiloto', icon: Sparkles, end: true },
      { to: '/insights/health', label: 'Salud', icon: Heart },
      { to: '/insights/net-worth', label: 'Patrimonio', icon: TrendingUp },
      { to: '/insights/simulator', label: 'Simulador', icon: FlaskConical },
      { to: '/insights/affordability', label: '¿Puedo?', icon: HelpCircle },
      { to: '/insights/export', label: 'Exportar', icon: Download },
    ],
  },
];

export function Sidebar() {
  const user = useStore((s) => s.user);
  const accounts = useStore((s) => s.accounts);
  const location = useLocation();
  const [showAdd, setShowAdd] = useState(false);

  const totalBalance = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((s, a) => s + a.balance, 0);

  return (
    <aside className="hidden lg:flex flex-col w-[15.5rem] shrink-0 h-screen sticky top-0 bg-white dark:bg-ink-950 border-r border-ink-100 dark:border-ink-800/50 px-3 py-5">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 mb-6">
        <img src={logo} alt="Finlytech" className="h-8 w-auto object-contain" />
      </div>

      {/* Balance */}
      <div className="mx-1 mb-5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/[0.08] to-amber-500/[0.03] border border-amber-500/10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1">Saldo total</p>
        <p className="text-lg font-bold tabular-nums font-display text-amber-600 dark:text-amber-400 tracking-tight">
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-[10px] text-ink-400 mt-0.5">{accounts.length} cuentas</p>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
        {NAV.map((group) => (
          <div key={group.section ?? 'main'}>
            {group.section && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-400">
                {group.section}
              </p>
            )}
            <nav className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                // active if exact match OR starts with item.to (for sub-routes)
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname === item.to || location.pathname.startsWith(item.to + '/');

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                        : 'text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800/50 hover:text-ink-800 dark:hover:text-ink-100',
                    )}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    {item.label}
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Profile at bottom of nav */}
        <nav className="flex flex-col gap-0.5">
          <NavLink
            to="/profile"
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200',
              isActive
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800/50 hover:text-ink-800 dark:hover:text-ink-100',
            )}
          >
            <User size={16} strokeWidth={2} className="shrink-0" />
            Perfil
          </NavLink>
        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800/50 space-y-3">
        <button onClick={() => setShowAdd(true)} className="btn-primary w-full py-2.5 text-[13px]">
          <Plus size={15} />
          Registrar movimiento
        </button>
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}bb)` }}
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-none truncate">{user.name}</p>
            <p className="text-[10px] text-ink-400 mt-0.5 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <TransactionSheet open={showAdd} onClose={() => setShowAdd(false)} />
    </aside>
  );
}
