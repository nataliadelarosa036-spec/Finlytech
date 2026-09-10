import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { Sheet } from '@/components/Sheet';
import { DonutChart } from '@/components/Charts';
import { formatCurrency, formatPercent } from '@/utils/format';
import {
  getMonthlyIncome, getMonthlyExpenses, getMonthlySavings,
  getDailyAllowance, getBudgetProgress, getBudgetRemaining,
  getBudgetProjection, getDaysInMonth, getDaysIntoMonth,
} from '@/utils/calculations';
import { cn } from '@/utils/cn';
import type { Category } from '@/types';

interface PlanPageProps { embedded?: boolean; }

export function PlanPage({ embedded }: PlanPageProps = {}) {
  const navigate = useNavigate();
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const budgets = useStore((s) => s.budgets);
  const debts = useStore((s) => s.debts);
  const categories = useStore((s) => s.categories);
  const addBudget = useStore((s) => s.addBudget);
  const deleteBudget = useStore((s) => s.deleteBudget);

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [budgetCatId, setBudgetCatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const expenseCategories = categories.filter((c) => c.kind === 'expense');
  const usedCatIds = new Set(budgets.map((b) => b.category.id));
  const availableCats = expenseCategories.filter((c) => !usedCatIds.has(c.id));

  const handleAddBudget = () => {
    const cat = categories.find((c) => c.id === budgetCatId);
    if (!cat || !budgetLimit) return;
    // Calculate current spent from transactions this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const spent = transactions
      .filter((t) => t.type === 'expense' && t.category.id === cat.id && t.date.slice(0, 7) === currentMonth)
      .reduce((s, t) => s + t.amount, 0);
    addBudget({ category: cat, limit: parseFloat(budgetLimit), spent, period: 'monthly' });
    setBudgetCatId('');
    setBudgetLimit('');
    setShowAddBudget(false);
  };

  const income = useMemo(() => getMonthlyIncome(transactions), [transactions]);
  const expenses = useMemo(() => getMonthlyExpenses(transactions), [transactions]);
  const savings = useMemo(() => getMonthlySavings(transactions), [transactions]);

  // Debt minimum payments
  const debtPayments = useMemo(() => debts.reduce((s, d) => s + d.minPayment, 0), [debts]);

  // Real account balance (non-credit)
  const totalBalance = useMemo(
    () => accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0),
    [accounts]
  );

  // Disponible = saldo real - lo que ya comprometiste (ahorro + pagos deuda)
  // No restamos expenses porque ya salieron de las cuentas
  const available = useMemo(
    () => Math.max(0, totalBalance - savings - debtPayments),
    [totalBalance, savings, debtPayments]
  );
  const dailyAllowance = getDailyAllowance(available);
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  // Distribución del ingreso (solo para el pie chart — muestra cómo se reparte el ingreso)
  const fixedExpenses = budgets.filter(b => b.category.name === 'Vivienda' || b.category.name === 'Servicios').reduce((s, b) => s + b.limit, 0);
  const variableExpenses = Math.max(0, expenses - fixedExpenses);

  const daysInMonth = getDaysInMonth();
  const daysIntoMonth = getDaysIntoMonth();
  const projectedExpenses = daysIntoMonth > 0
    ? Math.round((expenses / daysIntoMonth) * daysInMonth)
    : 0;
  const projectedSurplus = income > 0
    ? Math.max(0, income - projectedExpenses - savings - debtPayments)
    : 0;

  const donutData = [
    { name: 'Gastos fijos', value: fixedExpenses, color: '#313d56' },
    { name: 'Gastos variables', value: variableExpenses, color: '#f95d0d' },
    { name: 'Ahorro', value: savings, color: '#13a8a1' },
    { name: 'Deudas', value: debtPayments, color: '#f43f5e' },
    { name: 'Disponible', value: Math.max(0, income - expenses - savings - debtPayments), color: '#10b981' },
  ].filter(d => d.value > 0);

  const budgetPct = daysInMonth > 0 ? (daysIntoMonth / daysInMonth) * 100 : 0;

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Plan financiero</h1>
        <p className="text-sm text-ink-400 mt-1">Así se distribuye tu dinero este mes</p>
      </div>

      {/* Hero income breakdown */}
      <div className="card-brand rounded-3xl p-6 relative overflow-hidden noise">
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white/8 blur-3xl" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Saldo disponible</p>
        <p className="text-[2.5rem] font-bold tracking-tight font-display leading-none">{formatCurrency(available)}</p>
        <p className="text-sm text-white/60 mt-1">En tus cuentas, libre de compromisos</p>

        <div className="mt-5 space-y-2.5">
          {[
            { label: 'Ingresos del mes', value: income, color: 'rgba(255,255,255,0.8)' },
            { label: 'Gastos del mes', value: -expenses, color: '#f43f5e' },
            { label: 'Ahorros', value: -savings, color: '#fbbf24' },
            { label: 'Cuotas de deudas', value: -debtPayments, color: '#f87171' },
          ].filter(r => Math.abs(r.value) > 0).map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-white/80">{row.label}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: row.color }}>
                {row.value >= 0 ? '+' : ''}{formatCurrency(row.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/15 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/80">Resultado del mes</span>
          <span className={`text-xl font-bold tabular-nums font-display ${income - expenses >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {income - expenses >= 0 ? '+' : ''}{formatCurrency(income - expenses - savings - debtPayments)}
          </span>
        </div>
      </div>

      {/* Distribución + donut */}
      <SectionCard title="Distribución">
        <div className="flex items-center gap-4">
          <div className="w-40 shrink-0">
            <DonutChart data={donutData} size={160} />
          </div>
          <div className="flex-1 space-y-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-ink-500 dark:text-ink-400 flex-1">{d.name}</span>
                <span className="text-xs font-bold tabular-nums">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Daily allowance tip */}
      <div className="card p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-0.5">Sugerencia</p>
          <p className="text-sm leading-relaxed text-balance">
            Puedes gastar <span className="font-bold">{formatCurrency(dailyAllowance)}</span> diarios sin afectar tus metas.
            {savingsRate >= 20 ? ' 🎉 Tasa de ahorro excelente.' : savingsRate >= 10 ? '' : ' Considera aumentar tu ahorro mensual.'}
          </p>
        </div>
      </div>

      {/* Projection */}
      <SectionCard title="Proyección fin de mes">
        {/* Progress bar showing month */}
        <div className="mb-4">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-ink-400">Día {daysIntoMonth}</span>
            <span className="text-xs text-ink-400">Día {daysInMonth}</span>
          </div>
          <ProgressBar value={budgetPct} color="#13a8a1" height="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-ink-50 dark:bg-ink-800/60">
            <p className="text-[11px] text-ink-400 mb-1">Gastos proyectados</p>
            <p className="text-sm font-bold tabular-nums">{formatCurrency(projectedExpenses)}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">Hasta hoy: {formatCurrency(expenses)}</p>
          </div>
          <div className={cn('p-3.5 rounded-xl', projectedSurplus >= 0 ? 'bg-emerald-500/8' : 'bg-rose-500/8')}>
            <p className="text-[11px] text-ink-400 mb-1">Superávit proyectado</p>
            <p className={cn('text-sm font-bold tabular-nums', projectedSurplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
              {formatCurrency(projectedSurplus)}
            </p>
            <p className="text-[10px] text-ink-400 mt-0.5">Disponible hoy: {formatCurrency(available)}</p>
          </div>
        </div>

        {projectedExpenses > income && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-2">
            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-500 leading-relaxed">
              Al ritmo actual tus gastos superarían tus ingresos. Quedan {daysInMonth - daysIntoMonth} días.
            </p>
          </div>
        )}
      </SectionCard>

      {/* Budgets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="label px-0.5">Presupuestos por categoría</h3>
          {availableCats.length > 0 && (
            <button onClick={() => setShowAddBudget(true)}
              className="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1">
              <Plus size={12} /> Añadir
            </button>
          )}
        </div>

        {budgets.length === 0 ? (
          <div className="card p-8 text-center space-y-3">
            <p className="text-sm text-ink-400">Sin presupuestos configurados.</p>
            <p className="text-xs text-ink-500 max-w-xs mx-auto">
              Crea límites de gasto por categoría para controlar en qué se va tu dinero.
            </p>
            {availableCats.length > 0 && (
              <button onClick={() => setShowAddBudget(true)} className="btn-primary mx-auto py-2 px-4 text-xs inline-flex items-center gap-1.5">
                <Plus size={13} /> Crear primer presupuesto
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const progress = getBudgetProgress(b);
              const remaining = getBudgetRemaining(b);
              const isOver = b.spent > b.limit;
              const projected = getBudgetProjection(b, daysIntoMonth, daysInMonth);
              const willExceed = !isOver && projected > b.limit;
              const barColor = isOver ? '#f43f5e' : progress > 80 ? '#f59e0b' : b.category.color;

              return (
                <div key={b.id} className="card p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-xl">{b.category.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{b.category.name}</p>
                      <p className="text-xs text-ink-400">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</p>
                    </div>
                    <p className={cn('text-sm font-bold tabular-nums', isOver ? 'text-rose-500' : progress > 80 ? 'text-amber-500' : '')}>
                      {formatPercent(progress, 0)}%
                    </p>
                    <button onClick={() => deleteBudget(b.id)}
                      className="text-ink-300 hover:text-rose-500 transition-colors ml-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <ProgressBar value={progress} color={barColor} height="h-2" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-ink-400">
                      {isOver
                        ? <span className="text-rose-500 font-semibold">Excedido {formatCurrency(b.spent - b.limit)}</span>
                        : `${formatCurrency(remaining)} restante`}
                    </p>
                    {willExceed && (
                      <p className="text-[10px] text-amber-500 font-semibold">Proyección: {formatCurrency(projected)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={() => navigate('/insights/simulator')} className="btn-secondary w-full">
        Probar simulador financiero
        <ArrowRight size={15} />
      </button>

      {/* Add Budget Sheet */}
      <Sheet open={showAddBudget} onClose={() => setShowAddBudget(false)} title="Nuevo presupuesto">
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Categoría</label>
            {availableCats.length === 0 ? (
              <p className="text-sm text-ink-400">Ya tienes presupuestos para todas las categorías de gasto.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableCats.map((c) => (
                  <button key={c.id} type="button" onClick={() => setBudgetCatId(c.id)}
                    className={cn('flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                      budgetCatId === c.id ? 'border-amber-500 bg-amber-500/5' : 'border-ink-200 dark:border-ink-700')}>
                    <span className="text-lg">{c.icon}</span>
                    <span className="text-xs font-semibold truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="label mb-2 block">Límite mensual ($)</label>
            <input type="number" value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="500000" className="input" />
          </div>
          {budgetCatId && budgetLimit && (() => {
            const cat = categories.find((c) => c.id === budgetCatId);
            const currentSpent = transactions
              .filter((t) => t.type === 'expense' && t.category.id === budgetCatId && t.date.slice(0, 7) === new Date().toISOString().slice(0, 7))
              .reduce((s, t) => s + t.amount, 0);
            return currentSpent > 0 ? (
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Ya llevas <strong>{formatCurrency(currentSpent)}</strong> gastados en {cat?.name} este mes.
                </p>
              </div>
            ) : null;
          })()}
          <button onClick={handleAddBudget} disabled={!budgetCatId || !budgetLimit} className="btn-primary w-full">
            Crear presupuesto
          </button>
        </div>
      </Sheet>
    </div>
  );
}
