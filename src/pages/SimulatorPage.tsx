import { useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProjectionChart } from '@/components/Charts';
import { VerdictBadge } from '@/components/VerdictBadge';
import { formatCurrency } from '@/utils/format';
import { simulateScenario } from '@/utils/calculations';
import type { ScenarioType, ScenarioResult } from '@/types';
import { cn } from '@/utils/cn';
import { FlaskConical, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const SCENARIOS: { value: ScenarioType; label: string; icon: string; placeholder: string; color: string }[] = [
  { value: 'purchase', label: 'Comprar algo', icon: '🛍️', placeholder: 'Ej: 8000000', color: '#f43f5e' },
  { value: 'save_more', label: 'Ahorrar más', icon: '🐷', placeholder: 'Ej: 300000', color: '#13a8a1' },
  { value: 'pay_debt', label: 'Pagar deuda', icon: '💳', placeholder: 'Ej: 500000', color: '#f59e0b' },
  { value: 'increase_saving', label: 'Subir ahorro', icon: '📈', placeholder: 'Ej: 200000/mes', color: '#8b5cf6' },
];

const TIME_OPTIONS = [
  { label: '1m', value: 1 },
  { label: '3m', value: 3 },
  { label: '6m', value: 6 },
  { label: '1 año', value: 12 },
  { label: '3 años', value: 36 },
];

interface SimulatorPageProps { embedded?: boolean; }

export function SimulatorPage({ embedded }: SimulatorPageProps = {}) {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const darkMode = useStore((s) => s.darkMode);

  const [type, setType] = useState<ScenarioType>('purchase');
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState(12);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const currentScenario = SCENARIOS.find(s => s.value === type)!;

  const handleSimulate = () => {
    const amt = parseInt(amount.replace(/[^\d]/g, ''), 10);
    if (!amt) return;
    setLoading(true);
    setTimeout(() => {
      const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const savings = transactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);
      const balance = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
      const debtPay = debts.reduce((s, d) => s + d.minPayment, 0);
      const netWorth = balance - debts.reduce((s, d) => s + d.balance, 0);
      const available = Math.max(0, balance - savings - debtPay - expenses + income);
      setResult(simulateScenario(
        { id: 'sim', type, label: '', amount: amt, months },
        { availableToSpend: available, monthlyIncome: income, monthlyExpenses: expenses, monthlySavings: savings, netWorth, goals, debts },
      ));
      setLoading(false);
    }, 350);
  };

  const netDiff = result ? result.simulatedNetWorth - result.currentNetWorth : 0;

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Simulador</h1>
        <p className="text-sm text-ink-400 mt-1">Prueba escenarios financieros antes de decidir</p>
      </div>

      {/* Scenario picker */}
      <div className="card p-5 space-y-5">
        <div>
          <p className="label mb-3">¿Qué quieres simular?</p>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setType(s.value); setResult(null); }}
                className={cn(
                  'flex items-center gap-2.5 p-3.5 rounded-2xl text-sm font-semibold transition-all text-left',
                  type === s.value
                    ? 'ring-1 text-white'
                    : 'bg-ink-50 dark:bg-ink-800/60 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700',
                )}
                style={type === s.value ? { background: s.color, boxShadow: `0 4px 16px ${s.color}40` } : {}}
              >
                <span className="text-xl">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div>
          <label className="label mb-2 block">
            {type === 'purchase' ? 'Valor de la compra ($)' :
              type === 'save_more' ? 'Ahorro extra ($)' :
                type === 'pay_debt' ? 'Abono a deuda ($)' : 'Aumento mensual ($)'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
              placeholder={currentScenario.placeholder}
              className="input pl-8 text-lg font-bold tabular-nums"
            />
          </div>
        </div>

        {/* Time horizon */}
        <div>
          <p className="label mb-2">Horizonte temporal</p>
          <div className="flex gap-2 flex-wrap">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => setMonths(t.value)}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                  months === t.value
                    ? 'bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900'
                    : 'bg-ink-50 dark:bg-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={!amount || loading}
          className="btn-primary w-full"
        >
          {loading
            ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Simulando...</span>
            : <><FlaskConical size={15} /> Simular escenario</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-scale-in">

          {/* Verdict */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${currentScenario.color}18` }}
              >
                {currentScenario.icon}
              </div>
              <div>
                <VerdictBadge verdict={result.verdict} className="mb-1">
                  {result.verdict === 'green' ? 'Escenario positivo' : result.verdict === 'yellow' ? 'Con impacto moderado' : 'Riesgo alto'}
                </VerdictBadge>
                <p className="text-xs text-ink-400">{result.summary}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-300">{result.reason}</p>
          </div>

          {/* Before vs after */}
          <SectionCard title="Comparación de patrimonio">
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/50">
                <p className="text-[11px] text-ink-400 mb-1">Situación actual</p>
                <p className="text-lg font-bold tabular-nums font-display">{formatCurrency(result.currentNetWorth)}</p>
              </div>
              <div
                className="p-4 rounded-2xl"
                style={{ background: result.verdict === 'green' ? 'rgba(19,168,161,0.08)' : result.verdict === 'yellow' ? 'rgba(245,158,11,0.08)' : 'rgba(244,63,94,0.08)' }}
              >
                <p className="text-[11px] text-ink-400 mb-1">Simulada ({months}m)</p>
                <p className="text-lg font-bold tabular-nums font-display text-brand-600 dark:text-brand-400">
                  {formatCurrency(result.simulatedNetWorth)}
                </p>
              </div>
            </div>

            {/* Net difference */}
            <div className={cn(
              'flex items-center gap-2 p-3 rounded-xl mb-5',
              netDiff >= 0 ? 'bg-emerald-500/8' : 'bg-rose-500/8',
            )}>
              {netDiff >= 0
                ? <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                : <TrendingDown size={15} className="text-rose-500 shrink-0" />}
              <p className={cn('text-sm font-bold tabular-nums', netDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                {netDiff >= 0 ? '+' : ''}{formatCurrency(netDiff)} en {months} {months === 1 ? 'mes' : 'meses'}
              </p>
            </div>

            <ProjectionChart data={result.projection} dark={darkMode} />
          </SectionCard>

          <button onClick={() => setResult(null)} className="btn-secondary w-full">
            Probar otro escenario
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
