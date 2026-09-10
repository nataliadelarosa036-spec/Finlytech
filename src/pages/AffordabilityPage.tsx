import { useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { VerdictBadge } from '@/components/VerdictBadge';
import {
  checkAffordability, getMonthlyIncome, getMonthlyExpenses,
  getMonthlySavings, getAvailableToSpend,
} from '@/utils/calculations';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertTriangle, XCircle, History } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

const QUICK_EXAMPLES = [
  { label: 'Computador', amount: 3_500_000 },
  { label: 'Viaje', amount: 5_000_000 },
  { label: 'Celular', amount: 2_000_000 },
  { label: 'Moto', amount: 8_000_000 },
  { label: 'TV 65"', amount: 4_500_000 },
  { label: 'Ropa', amount: 800_000 },
];

type Result = { verdict: 'green' | 'yellow' | 'red'; reason: string; impact: string; amount: number };

interface AffordabilityPageProps { embedded?: boolean; }

export function AffordabilityPage({ embedded }: AffordabilityPageProps = {}) {
  const transactions = useStore((s) => s.transactions);
  const accounts = useStore((s) => s.accounts);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  const parseAmount = (text: string) => parseInt(text.replace(/[^\d]/g, ''), 10) || 0;

  const analyze = (amountOverride?: number) => {
    const amount = amountOverride ?? parseAmount(query);
    if (!amount) return;
    setLoading(true);
    setTimeout(() => {
      // Use the canonical calculation functions — no inline duplication
      const monthlyIncome = getMonthlyIncome(transactions);
      const monthlyExpenses = getMonthlyExpenses(transactions);
      const monthlySavings = getMonthlySavings(transactions);
      const monthlyDebtPay = debts.reduce((s, d) => s + d.minPayment, 0);
      const available = getAvailableToSpend(accounts, monthlyIncome, monthlyExpenses, monthlySavings, monthlyDebtPay);

      const res = checkAffordability(amount, {
        availableToSpend: available,
        monthlyIncome,
        monthlyExpenses,
        goals,
        debts,
      });
      const full: Result = { ...res, amount };
      setResult(full);
      setHistory((h) => [full, ...h].slice(0, 5));
      setLoading(false);
    }, 300);
  };

  const verdictMeta = {
    green: { icon: CheckCircle2, label: 'Sí, puedes comprarlo', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
    yellow: { icon: AlertTriangle, label: 'Puedes, pero con cuidado', bg: 'bg-amber-500/10', iconColor: 'text-amber-500', border: 'border-amber-500/20' },
    red: { icon: XCircle, label: 'No es recomendable ahora', bg: 'bg-rose-500/10', iconColor: 'text-rose-500', border: 'border-rose-500/20' },
  };

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">¿Puedo permitirlo?</h1>
        <p className="text-sm text-ink-400 mt-1">Analiza cualquier compra antes de decidir</p>
      </div>

      {/* Input */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="label mb-2 block">Monto a analizar ($)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold text-sm">$</span>
            <input
              type="number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && analyze()}
              placeholder="3500000"
              className="input pl-8 text-lg font-bold tabular-nums"
            />
          </div>
        </div>

        {/* Quick picks */}
        <div>
          <p className="label mb-2">Ejemplos rápidos</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setQuery(String(ex.amount)); analyze(ex.amount); }}
                className="px-3 py-1.5 rounded-xl bg-ink-50 dark:bg-ink-800 text-xs font-semibold hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                {ex.label} · {formatCurrency(ex.amount)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => analyze()}
          disabled={!query || loading}
          className="btn-primary w-full"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analizando...</>
            : 'Analizar'}
        </button>
      </div>

      {/* Result */}
      {result && (() => {
        const meta = verdictMeta[result.verdict];
        const Icon = meta.icon;
        return (
          <div className={cn('card p-5 border', meta.border)}>
            <div className="flex items-center gap-3 mb-5">
              <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0', meta.bg)}>
                <Icon size={28} className={meta.iconColor} />
              </div>
              <div>
                <p className="text-base font-bold font-display">{meta.label}</p>
                <p className="text-xs text-ink-400 mt-0.5">Para {formatCurrency(result.amount)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/50">
                <p className="label mb-1.5">Análisis</p>
                <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-300">{result.reason}</p>
              </div>
              <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/50">
                <p className="label mb-1.5">Impacto en tus finanzas</p>
                <p className="text-sm leading-relaxed text-ink-700 dark:text-ink-300">{result.impact}</p>
              </div>
            </div>

            <button onClick={() => { setResult(null); setQuery(''); }} className="btn-ghost w-full mt-4 text-xs">
              Analizar otra compra
            </button>
          </div>
        );
      })()}

      {/* History */}
      {!result && history.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <History size={13} className="text-ink-400" />
            <h3 className="label">Consultas recientes</h3>
          </div>
          <div className="space-y-2">
            {history.map((h, i) => {
              const meta = verdictMeta[h.verdict];
              const Icon = meta.icon;
              return (
                <button key={i} onClick={() => { setQuery(String(h.amount)); setResult(h); }}
                  className="card p-3 w-full flex items-center gap-3 hover:border-ink-200 dark:hover:border-ink-700 transition-colors text-left">
                  <Icon size={16} className={meta.iconColor} />
                  <span className="flex-1 text-sm font-semibold">{formatCurrency(h.amount)}</span>
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', meta.bg, meta.iconColor)}>
                    {h.verdict === 'green' ? 'OK' : h.verdict === 'yellow' ? 'Cuidado' : 'No'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && history.length === 0 && (
        <div className="card p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} className="text-brand-500" />
          </div>
          <p className="text-sm font-semibold text-ink-600 dark:text-ink-300">Ingresa un monto</p>
          <p className="text-xs text-ink-400 max-w-xs mx-auto leading-relaxed">
            Finlytech analiza si puedes realizar esa compra sin comprometer tus metas ni tu liquidez actual.
          </p>
        </div>
      )}
    </div>
  );
}
