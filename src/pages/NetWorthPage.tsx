import { useMemo } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { NetWorthChart } from '@/components/Charts';
import { formatCurrency, formatPercent } from '@/utils/format';
import { getTotalAssets, getTotalLiabilities, getNetWorth, generateNetWorthHistory } from '@/utils/calculations';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface NetWorthPageProps { embedded?: boolean; }

export function NetWorthPage({ embedded }: NetWorthPageProps = {}) {
  const accounts = useStore((s) => s.accounts);
  const debts = useStore((s) => s.debts);
  const darkMode = useStore((s) => s.darkMode);

  const assets = useMemo(() => getTotalAssets(accounts), [accounts]);
  const liabilities = useMemo(() => getTotalLiabilities(debts), [debts]);
  const net = useMemo(() => getNetWorth(accounts, debts), [accounts, debts]);
  const netWorthHistory = useMemo(() => generateNetWorthHistory(accounts, debts), [accounts, debts]);

  const prevNet = netWorthHistory[netWorthHistory.length - 2]?.net || net;
  const change = net - prevNet;
  const changePct = prevNet > 0 ? (change / prevNet) * 100 : 0;
  const isPositive = change >= 0;

  const assetBreakdown = [
    { label: 'Cuentas corrientes', amount: accounts.filter(a => a.type === 'checking' || a.type === 'cash').reduce((s, a) => s + a.balance, 0), color: '#13a8a1' },
    { label: 'Ahorros', amount: accounts.filter(a => a.type === 'savings').reduce((s, a) => s + a.balance, 0), color: '#3b82f6' },
    { label: 'Inversiones', amount: accounts.filter(a => a.type === 'investment').reduce((s, a) => s + a.balance, 0), color: '#8b5cf6' },
  ];

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Patrimonio</h1>
        <p className="text-sm text-ink-400 mt-1">Tu posición financiera total</p>
      </div>

      {/* Hero card */}
      <div className="card-brand rounded-3xl p-6 relative overflow-hidden noise">
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-black/10 blur-3xl" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Patrimonio neto</p>
          <p className="text-[3rem] font-bold tracking-tight font-display leading-none tabular-nums">
            {formatCurrency(net)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {isPositive
              ? <TrendingUp size={15} className="text-white/70" />
              : <TrendingDown size={15} className="text-white/70" />}
            <span className="text-sm font-bold text-white">
              {isPositive ? '+' : ''}{formatCurrency(change)}
            </span>
            <span className="text-xs text-white/60">vs mes anterior ({formatPercent(Math.abs(changePct), 1)}%)</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/15">
            <div>
              <p className="text-[11px] text-white/55 uppercase tracking-widest font-semibold mb-0.5">Activos</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(assets)}</p>
            </div>
            <div>
              <p className="text-[11px] text-white/55 uppercase tracking-widest font-semibold mb-0.5">Pasivos</p>
              <p className="text-lg font-bold tabular-nums text-white/80">{formatCurrency(liabilities)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <SectionCard title="Evolución mensual">
        <NetWorthChart data={netWorthHistory} dark={darkMode} />
        <div className="flex items-center justify-center gap-5 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-brand-500 rounded-full" />
            <span className="text-[10px] text-ink-400">Patrimonio neto</span>
          </div>
        </div>
      </SectionCard>

      {/* Assets breakdown */}
      <SectionCard title="Activos">
        <div className="space-y-4">
          {assetBreakdown.map((a) => {
            const pct = assets > 0 ? (a.amount / assets) * 100 : 0;
            return (
              <div key={a.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-sm text-ink-600 dark:text-ink-300">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-400">{formatPercent(pct, 1)}%</span>
                    <span className="text-sm font-bold tabular-nums">{formatCurrency(a.amount)}</span>
                  </div>
                </div>
                <ProgressBar value={pct} color={a.color} height="h-1.5" />
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-800/60">
            <span className="text-sm font-bold">Total activos</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(assets)}</span>
          </div>
        </div>
      </SectionCard>

      {/* Liabilities */}
      <SectionCard title="Pasivos">
        <div className="space-y-3">
          {debts.map((d) => {
            const pct = liabilities > 0 ? (d.balance / liabilities) * 100 : 0;
            return (
              <div key={d.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ink-600 dark:text-ink-300 truncate flex-1 mr-4">{d.name}</span>
                  <span className="text-sm font-bold tabular-nums text-rose-500 shrink-0">{formatCurrency(d.balance)}</span>
                </div>
                <ProgressBar value={pct} color="#f43f5e" height="h-1" />
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-800/60">
            <span className="text-sm font-bold">Total pasivos</span>
            <span className="text-base font-bold text-rose-500 tabular-nums">{formatCurrency(liabilities)}</span>
          </div>
        </div>
      </SectionCard>

      {/* Account list */}
      <SectionCard title="Cuentas">
        <div className="space-y-2.5">
          {accounts.filter(a => a.includedInNetWorth).map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: a.color }}>
                {a.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.name}</p>
                <p className="text-[11px] text-ink-400">{a.institution}</p>
              </div>
              <p className={cn('text-sm font-bold tabular-nums', a.type === 'credit' ? 'text-rose-500' : '')}>
                {formatCurrency(a.balance)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
