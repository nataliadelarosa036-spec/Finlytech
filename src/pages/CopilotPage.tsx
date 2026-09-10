import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { formatCurrency } from '@/utils/format';
import {
  getMonthlyIncome, getMonthlyExpenses, getSavingsRate,
  getSpendingByCategory, getNetWorth, getDailyAllowance,
  getAvailableToSpend, getMonthlySavings, getTotalSubscriptionsMonthly,
  generateInsights,
} from '@/utils/calculations';
import { cn } from '@/utils/cn';
import { Sparkles, AlertTriangle, Lightbulb, Info, ArrowRight, Send, User, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { InsightType } from '@/types';

/* ── Rule-based chat engine ────────────────────────────────────────────────── */
function generateAnswer(q: string, ctx: {
  income: number; expenses: number; savingsRate: number;
  available: number; dailyAllowance: number; netWorth: number;
  topCategory: string; monthlySubscriptions: number; debtTotal: number;
}): string {
  const t = q.toLowerCase();
  const fmt = formatCurrency;
  if (t.match(/ahorr|guardar|save/))
    return `Con ingresos de ${fmt(ctx.income)}, el ideal es ahorrar ≥20% (${fmt(ctx.income * 0.2)}/mes). Tu tasa actual es ${ctx.savingsRate.toFixed(1)}%. ${ctx.savingsRate >= 20 ? '¡Excelente! Mantén ese ritmo.' : 'Puedes mejorar reduciendo gastos variables.'}`;
  if (t.match(/gastar|disponible|cuanto|puedo/))
    return `Tienes ${fmt(ctx.available)} disponibles. Eso es ${fmt(ctx.dailyAllowance)} diarios hasta fin de mes. No lo superes para mantener tus metas en camino.`;
  if (t.match(/deuda|préstamo|pagar/))
    return `Tu deuda total es ${fmt(ctx.debtTotal)}. La estrategia avalancha (pagar primero la de mayor interés) te ahorrará más dinero. Considera destinar ${fmt(ctx.income * 0.1)} extra/mes a deudas.`;
  if (t.match(/suscripci|netflix|spotify/))
    return `Gastas ${fmt(ctx.monthlySubscriptions)}/mes en suscripciones (${fmt(ctx.monthlySubscriptions * 12)}/año). Revisa cuáles no usas; cancelar 2-3 podría ahorrarte ${fmt(ctx.monthlySubscriptions * 0.4 * 12)}/año.`;
  if (t.match(/invert|bolsa|acciones|cripto|etf/))
    return `Antes de invertir asegura un fondo de emergencia (~${fmt(ctx.expenses * 4)}). Con eso cubierto, fondos indexados (S&P 500) son buena opción para largo plazo con bajo costo.`;
  if (t.match(/patrimonio|neto|riqueza/))
    return `Tu patrimonio neto es ${fmt(ctx.netWorth)}. Para acelerarlo: reduce deudas caras, aumenta ahorro e invierte el excedente de forma consistente.`;
  if (t.match(/presupuest|gasto|categoria/))
    return `Tu mayor gasto es en ${ctx.topCategory}. Aplica la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro e inversión.`;
  if (t.match(/emerg|fondo|imprevisto/))
    return `Fondo de emergencia ideal: 3-6 meses de gastos. En tu caso: entre ${fmt(ctx.expenses * 3)} y ${fmt(ctx.expenses * 6)}. Guárdalo en cuenta de ahorros de fácil acceso.`;
  if (t.match(/hola|ayuda|qué pued|que pued/))
    return `¡Hola! Puedo ayudarte con:\n• ¿Cuánto puedo gastar hoy?\n• ¿Cómo mejorar mi ahorro?\n• ¿Cómo pagar mis deudas?\n• ¿Debo invertir?\n• Análisis de gastos y presupuesto\n\n¿Qué necesitas saber?`;
  return `Con ${fmt(ctx.available)} disponibles, tasa de ahorro ${ctx.savingsRate.toFixed(1)}% y patrimonio de ${fmt(ctx.netWorth)}, tu situación es ${ctx.savingsRate >= 15 ? 'saludable' : 'mejorable'}. ¿Quieres profundizar en algún área?`;
}

interface Message { id: string; role: 'user' | 'assistant'; text: string; }

const insightIcons: Record<InsightType, { icon: React.ElementType; bg: string; text: string }> = {
  positive: { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', text: 'text-amber-500' },
  info: { icon: Info, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  tip: { icon: Lightbulb, bg: 'bg-violet-500/10', text: 'text-violet-500' },
};

const QUICK = ['¿Cuánto puedo gastar hoy?', '¿Cómo mejorar mi ahorro?', '¿Cómo pago mis deudas?', '¿Debo invertir?'];

interface CopilotPageProps { embedded?: boolean; }

export function CopilotPage({ embedded }: CopilotPageProps = {}) {
  const navigate = useNavigate();
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const subscriptions = useStore((s) => s.subscriptions);
  const accounts = useStore((s) => s.accounts);
  const userName = useStore((s) => s.user.name);

  // All calculations memoized to avoid stale renders
  const income = useMemo(() => getMonthlyIncome(transactions), [transactions]);
  const expenses = useMemo(() => getMonthlyExpenses(transactions), [transactions]);
  const savings = useMemo(() => getMonthlySavings(transactions), [transactions]);
  const savingsRate = useMemo(() => getSavingsRate(income, expenses), [income, expenses]);
  const byCategory = useMemo(() => getSpendingByCategory(transactions), [transactions]);
  const topCategory = byCategory[0];
  const netWorth = useMemo(() => getNetWorth(accounts, debts), [accounts, debts]);
  const debtTotal = useMemo(() => debts.reduce((s, d) => s + d.balance, 0), [debts]);
  const debtPay = useMemo(() => debts.reduce((s, d) => s + d.minPayment, 0), [debts]);
  const available = useMemo(() => getAvailableToSpend(accounts, income, expenses, savings, debtPay), [accounts, income, expenses, savings, debtPay]);
  const dailyAllowance = useMemo(() => getDailyAllowance(available), [available]);
  const monthlySubs = useMemo(() => getTotalSubscriptionsMonthly(subscriptions), [subscriptions]);
  const unusedSubs = useMemo(() => subscriptions.filter((s) => (s.monthsUnused ?? 0) >= 2 && s.active), [subscriptions]);
  const upcomingDebt = useMemo(() => [...debts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0], [debts]);

  const insights = useMemo(
    () => generateInsights(transactions, accounts, goals, debts, subscriptions),
    [transactions, accounts, goals, debts, subscriptions]
  );

  const ctx = useMemo(() => ({
    income, expenses, savingsRate, available, dailyAllowance,
    netWorth, debtTotal,
    topCategory: topCategory?.category.name || 'N/A',
    monthlySubscriptions: monthlySubs,
  }), [income, expenses, savingsRate, available, dailyAllowance, netWorth, debtTotal, topCategory, monthlySubs]);

  /* Chat state */
  const [messages, setMessages] = useState<Message[]>([{
    id: 'init', role: 'assistant',
    text: `¡Hola ${userName}! Soy tu copiloto financiero. Pregúntame cualquier cosa sobre tu dinero, metas o deudas. 💬`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setMessages(m => [...m, { id: Date.now().toString(), role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const answer = generateAnswer(q, ctx);
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', text: answer }]);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 400 + Math.random() * 300);
  };

  /* Today actions */
  const todayItems = useMemo(() => {
    const items: string[] = [];
    if (upcomingDebt) {
      const days = Math.ceil((new Date(upcomingDebt.dueDate).getTime() - Date.now()) / 86400000);
      if (days <= 7) {
        items.push(`Paga "${upcomingDebt.name}" antes del ${new Date(upcomingDebt.dueDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}.`);
      }
    }
    items.push(`Dispones de ${formatCurrency(dailyAllowance)} hoy sin afectar tus metas.`);
    if (savingsRate >= 20) {
      items.push(`Tasa de ahorro: ${savingsRate.toFixed(0)}% — por encima del 20% ideal.`);
    } else {
      items.push(`Tasa de ahorro: ${savingsRate.toFixed(0)}%. Intenta llegar al 20%.`);
    }
    if (unusedSubs.length > 0) {
      items.push(`${unusedSubs.length} suscripción${unusedSubs.length > 1 ? 'es' : ''} sin uso — ${formatCurrency(unusedSubs.reduce((s, sub) => s + sub.amount * 12, 0))}/año ahorrable.`);
    }
    return items;
  }, [upcomingDebt, dailyAllowance, savingsRate, unusedSubs]);

  /* Anomalies */
  const anomalies = useMemo((): { id: string; type: 'warning'; title: string; body: string }[] => {
    const list: { id: string; type: 'warning'; title: string; body: string }[] = [];
    if (topCategory && topCategory.amount > income * 0.3) {
      list.push({ id: 'a1', type: 'warning', title: 'Gasto elevado en categoría', body: `${topCategory.category.name} representa más del 30% de tus ingresos (${formatCurrency(topCategory.amount)}).` });
    }
    if (income > 0 && savingsRate < 10) {
      list.push({ id: 'a2', type: 'warning', title: 'Ahorro por debajo del mínimo', body: `Tasa actual: ${savingsRate.toFixed(1)}%. Lo recomendado es ≥10% del ingreso.` });
    }
    if (debtTotal > income * 3 && income > 0) {
      list.push({ id: 'a3', type: 'warning', title: 'Nivel de deuda elevado', body: `${formatCurrency(debtTotal)} supera 3 meses de ingresos. Prioriza el pago.` });
    }
    return list;
  }, [topCategory, income, savingsRate, debtTotal]);

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Copiloto</h1>
        <p className="text-sm text-ink-400 mt-1">Tu asistente financiero inteligente</p>
      </div>

      {/* Today card */}
      <div className="card p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2.5">
              ¿Qué hago hoy?
            </p>
            <div className="space-y-2.5">
              {todayItems.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">{i + 1}</span>
                  </span>
                  <p className="text-sm text-ink-700 dark:text-ink-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div>
          <h3 className="label mb-3 px-0.5">Anomalías detectadas</h3>
          <div className="space-y-2.5">
            {anomalies.map((a) => {
              const cfg = insightIcons[a.type];
              const Icon = cfg.icon;
              return (
                <div key={a.id} className="card p-4 flex items-start gap-3 border-amber-400/20">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon size={16} className={cfg.text} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{a.title}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 leading-relaxed">{a.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <p className="text-sm font-bold font-display">Chat con Finlytech</p>
          </div>
          <button
            onClick={() => setMessages([{ id: 'reset', role: 'assistant', text: '¡Empecemos de nuevo! ¿En qué puedo ayudarte?' }])}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Messages */}
        <div className="px-4 py-4 space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-brand-600 dark:text-brand-400" />
                </div>
              )}
              <div className={cn(
                'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%] whitespace-pre-line',
                msg.role === 'user'
                  ? 'gradient-brand text-white rounded-tr-sm shadow-glow-sm'
                  : 'bg-ink-50 dark:bg-ink-800/60 text-ink-700 dark:text-ink-200 rounded-tl-sm',
              )}>
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={12} className="text-ink-500" />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                <Sparkles size={12} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div className="bg-ink-50 dark:bg-ink-800/60 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-ink-50 dark:bg-ink-800 text-[11px] font-semibold text-ink-500 dark:text-ink-400 hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-all whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-ink-100 dark:border-ink-800/60 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pregúntame sobre tus finanzas..."
            className="input text-sm flex-1"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:shadow-glow-sm active:scale-95"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #13a8a1, #0d8882)' : undefined }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h3 className="label mb-3 px-0.5">Recomendaciones</h3>
        <div className="space-y-3">
          {insights.map((insight) => {
            const cfg = insightIcons[insight.type];
            const Icon = cfg.icon;
            return (
              <div key={insight.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center shrink-0', cfg.bg)}>
                    <Icon size={17} className={cfg.text} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{insight.title}</p>
                    <p className="text-sm text-ink-500 dark:text-ink-400 mt-1 leading-relaxed">{insight.body}</p>
                    {insight.action && (
                      <button
                        onClick={() => navigate(`/${insight.action}`)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 mt-3 hover:gap-2 transition-all"
                      >                        {insight.cta} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <SectionCard title="Resumen rápido">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Ingresos', value: formatCurrency(income), color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Gastos', value: formatCurrency(expenses), color: 'text-rose-500' },
            { label: 'Tasa de ahorro', value: `${savingsRate.toFixed(1)}%`, color: savingsRate >= 20 ? 'text-emerald-600 dark:text-emerald-400' : savingsRate >= 10 ? 'text-amber-500' : 'text-rose-500' },
            { label: 'Categoría top', value: `${topCategory?.category.icon} ${topCategory?.category.name}`, color: '' },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
              <p className="label mb-1">{s.label}</p>
              <p className={cn('text-sm font-bold', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
