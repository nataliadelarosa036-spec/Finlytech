import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ProgressBar } from '@/components/ProgressBar';
import { formatCurrency, formatPercent } from '@/utils/format';
import {
  getHealthScoreColor, getHealthScoreLabel, calculateHealthScore,
  getMonthlyIncome, getMonthlyExpenses,
  getSavingsRate, getNetWorth, getTotalLiabilities,
} from '@/utils/calculations';
import { ArrowUpRight, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HealthPageProps { embedded?: boolean; }

export function HealthPage({ embedded }: HealthPageProps = {}) {
  const navigate = useNavigate();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const debts = useStore((s) => s.debts);
  const budgets = useStore((s) => s.budgets);
  const goals = useStore((s) => s.goals);

  const income = useMemo(() => getMonthlyIncome(transactions), [transactions]);
  const expenses = useMemo(() => getMonthlyExpenses(transactions), [transactions]);
  const savingsRate = useMemo(() => getSavingsRate(income, expenses), [income, expenses]);
  const netWorth = useMemo(() => getNetWorth(accounts, debts), [accounts, debts]);
  const totalDebt = useMemo(() => getTotalLiabilities(debts), [debts]);
  const goalProgress = useMemo(() =>
    goals.length === 0 ? 50 : goals.reduce((s, g) => s + (g.current / g.target) * 100, 0) / goals.length,
    [goals]);

  // Use the single canonical health score from calculations.ts
  const healthScore = useMemo(
    () => calculateHealthScore(accounts, transactions, goals, debts, budgets),
    [accounts, transactions, goals, debts, budgets]
  );
  const { total, breakdown } = healthScore;
  const color = getHealthScoreColor(total);
  const label = getHealthScoreLabel(total);

  const budgetSpent = useMemo(() => budgets.reduce((s, b) => s + b.spent, 0), [budgets]);
  const budgetTotal = useMemo(() => budgets.reduce((s, b) => s + b.limit, 0), [budgets]);

  const areas = [
    { key: 'savings', label: 'Ahorro', value: breakdown.savings, desc: `Tasa: ${formatPercent(savingsRate, 1)}%` },
    { key: 'liquidity', label: 'Liquidez', value: breakdown.liquidity, desc: `Meses de reserva` },
    { key: 'debts', label: 'Deudas', value: breakdown.debts, desc: `Total: ${formatCurrency(totalDebt)}` },
    { key: 'budget', label: 'Presupuesto', value: breakdown.budget, desc: budgets.length > 0 ? `${budgets.filter(b => b.spent > b.limit).length} categorías excedidas` : 'Sin presupuestos' },
    { key: 'goals', label: 'Metas', value: breakdown.goals, desc: `Progreso: ${formatPercent(goalProgress, 0)}%` },
    { key: 'patterns', label: 'Patrones', value: breakdown.patterns, desc: expenses <= income ? 'Gastos controlados' : 'Gastos > ingresos' },
  ];

  const weakest = [...areas].sort((a, b) => a.value - b.value).slice(0, 3);
  const tips: Record<string, string> = {
    savings: `Aumenta tu tasa de ahorro. Actualmente en ${formatPercent(savingsRate, 1)}, meta: 20%+.`,
    liquidity: `Construye un fondo de emergencia de 3-6 meses (${formatCurrency(expenses * 4)}).`,
    debts: `Prioriza pagar la deuda con mayor tasa de interés (estrategia avalancha).`,
    budget: `Ajusta tus presupuestos. Llevas ${formatCurrency(budgetSpent)} de ${formatCurrency(budgetTotal)} este mes.`,
    goals: `Aumenta tus aportes mensuales. Progreso actual: ${formatPercent(goalProgress, 0)}.`,
    patterns: `Mantén consistencia en tus ahorros mensuales.`,
  };

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Salud financiera</h1>
        <p className="text-sm text-ink-400 mt-1">Radiografía de tus finanzas personales</p>
      </div>

      {/* Score hero */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <ProgressRing value={total} size={120} strokeWidth={9} color={color} glow>
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums font-display">{total}</p>
              <p className="text-[10px] text-ink-400">/ 100</p>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <p className="label mb-1">Tu puntaje</p>
            <p className="text-2xl font-bold font-display" style={{ color }}>{label}</p>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1.5 leading-relaxed">
              {total >= 80 ? 'Tus finanzas están en excelente forma.' :
                total >= 60 ? 'Vas bien. Hay oportunidades de mejora.' :
                  'Algunas áreas necesitan atención.'}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-brand-500" />
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {total >= 80 ? 'Estable' : total >= 60 ? 'Moderado' : 'Requiere atención'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-5 pt-5 border-t border-ink-50 dark:border-ink-800/60">
          <div className="flex justify-between text-[10px] text-ink-400 mb-1.5">
            <span>0 — Crítico</span>
            <span>50 — Regular</span>
            <span>80 — Excelente</span>
          </div>
          <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 40%, #13a8a1 75%, #059669 100%)' }}>
            <div
              className="absolute top-0 bottom-0 right-0 bg-white/80 dark:bg-ink-950/80 rounded-r-full transition-all duration-700"
              style={{ left: `${total}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 transition-all duration-700 shadow-md"
              style={{ left: `calc(${total}% - 6px)`, borderColor: color }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <SectionCard title="Desglose por área">
        <div className="space-y-4">
          {areas.map((area) => {
            const aColor = getHealthScoreColor(area.value);
            return (
              <div key={area.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">{area.label}</span>
                    <span className="text-xs text-ink-400">{area.desc}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums" style={{ color: aColor }}>{area.value}</span>
                </div>
                <ProgressBar value={area.value} color={aColor} height="h-2" glow={area.value >= 80} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Tips */}
      <SectionCard title={`Cómo subir de ${total} a ${Math.min(100, total + 10)}`}>
        <div className="space-y-3">
          {weakest.map((area, i) => (
            <div key={area.key} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">{i + 1}</span>
              </div>
              <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed">{tips[area.key]}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/wealth/debts')} className="card p-4 text-left card-hover">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center mb-2">
            <TrendingUp size={15} className="text-rose-500" />
          </div>
          <p className="text-xs text-ink-400 mb-0.5">Deuda total</p>
          <p className="text-sm font-bold text-rose-500 tabular-nums">{formatCurrency(totalDebt)}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
            Estrategia <ArrowRight size={11} />
          </div>
        </button>
        <button onClick={() => navigate('/wealth')} className="card p-4 text-left card-hover">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center mb-2">
            <ArrowUpRight size={15} className="text-brand-500" />
          </div>
          <p className="text-xs text-ink-400 mb-0.5">Progreso metas</p>
          <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{formatPercent(goalProgress, 0)}</p>
          <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
            Ver metas <ArrowRight size={11} />
          </div>
        </button>
      </div>
    </div>
  );
}
