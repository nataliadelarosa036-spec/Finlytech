import { useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProgressBar } from '@/components/ProgressBar';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatPercent } from '@/utils/format';
import {
  simulateDebtPayoff, buildAmortizationSchedule, getDaysUntilPayment,
  getNextPaymentDate,
} from '@/utils/calculations';
import { cn } from '@/utils/cn';
import {
  TrendingDown, Zap, Plus, Trash2, Calendar, ChevronDown,
  ChevronUp, AlertTriangle, CreditCard, Landmark, MoreHorizontal,
  CheckCircle2, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Debt } from '@/types';

interface DebtsPageProps { embedded?: boolean; }

export function DebtsPage({ embedded }: DebtsPageProps = {}) {
  const debts = useStore((s) => s.debts);
  const addDebt = useStore((s) => s.addDebt);
  const updateDebt = useStore((s) => s.updateDebt);
  const deleteDebt = useStore((s) => s.deleteDebt);
  const addTransaction = useStore((s) => s.addTransaction);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const totalMin = debts.reduce((s, d) => s + d.minPayment, 0);
  const totalOriginal = debts.reduce((s, d) => s + d.originalBalance, 0);
  const paidOff = Math.max(0, totalOriginal - totalDebt);

  const [extraPayment, setExtraPayment] = useState('100000');
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [simResult, setSimResult] = useState<ReturnType<typeof simulateDebtPayoff> | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [paySheet, setPaySheet] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Add debt form
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [origBalance, setOrigBalance] = useState('');
  const [rate, setRate] = useState('');
  const [minPay, setMinPay] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [debtType, setDebtType] = useState<'card' | 'loan' | 'other'>('loan');

  const snowball = simulateDebtPayoff(debts, 0, 'snowball');
  const avalanche = simulateDebtPayoff(debts, 0, 'avalanche');

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimResult(simulateDebtPayoff(debts, parseInt(extraPayment, 10) || 0, strategy));
      setSimulating(false);
    }, 250);
  };

  const handleAddDebt = () => {
    if (!name || !balance) return;
    const b = parseFloat(balance) || 0;
    const orig = parseFloat(origBalance) || b;
    const day = parseInt(dueDay, 10) || 30;
    const due = new Date(new Date().getFullYear(), new Date().getMonth() + 1, day)
      .toISOString().slice(0, 10);
    addDebt({
      name, balance: b, originalBalance: orig, interestRate: parseFloat(rate) || 0,
      minPayment: parseFloat(minPay) || Math.round(b * 0.05), dueDate: due, type: debtType
    });
    setName(''); setBalance(''); setOrigBalance(''); setRate('');
    setMinPay(''); setDueDay(''); setShowAdd(false);
  };

  const handlePayDebt = () => {
    if (!paySheet) return;
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) return;

    const newBalance = Math.max(0, paySheet.balance - amount);
    updateDebt(paySheet.id, { balance: newBalance });

    // Record as a debt payment transaction
    const debtCat = categories.find(c => c.kind === 'expense') ?? categories[0];
    const mainAcc = accounts[0];
    if (debtCat && mainAcc) {
      addTransaction({
        type: 'payment',
        amount,
        description: `Pago deuda: ${paySheet.name}`,
        category: debtCat,
        account: mainAcc,
        date: new Date().toISOString(),
        note: `Abono a ${paySheet.name}`,
        recurring: false,
      });
    }
    setPaySheet(null);
    setPayAmount('');
  };

  const urgencyColor = (r: number) =>
    r > 30 ? 'text-rose-500' : r > 15 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-hero font-bold font-display">Deudas</h1>
          <p className="text-sm text-ink-400 mt-1">{debts.length} deudas activas</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5">
          <Plus size={15} /> Añadir deuda
        </button>
      </div>

      {debts.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-base font-bold font-display">Sin deudas registradas</p>
            <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
              Estás libre de compromisos o aún no has registrado ninguno. Añade tus deudas para calcular tu plan de liquidación óptimo.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto py-2.5 px-5 text-sm inline-flex items-center gap-2">
            <Plus size={16} /> Añadir deuda
          </button>
        </div>
      ) : (
        <>
          {/* Summary hero */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative">
              <p className="label mb-1">Deuda total</p>
              <p className="text-[2.5rem] font-bold tracking-tight text-rose-500 font-display leading-none tabular-nums">
                {formatCurrency(totalDebt)}
              </p>
              <p className="text-sm text-ink-400 mt-2">
                Pagos mínimos: <span className="font-semibold">{formatCurrency(totalMin)}/mes</span>
              </p>
              <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-800/60">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-ink-400">Progreso de pago</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {totalOriginal > 0 ? Math.round((paidOff / totalOriginal) * 100) : 0}% pagado
                  </span>
                </div>
                <ProgressBar value={totalOriginal > 0 ? (paidOff / totalOriginal) * 100 : 0} color="#10b981" height="h-2" glow />
              </div>
            </div>
          </div>

          {/* Strategies */}
          <SectionCard title="Comparar estrategias de pago">
            <div className="grid grid-cols-2 gap-3 mb-3">
              {([
                { key: 'snowball', label: 'Bola de nieve', sub: 'Menor saldo primero', data: snowball },
                { key: 'avalanche', label: 'Avalancha', sub: 'Mayor interés primero', data: avalanche, star: true },
              ] as const).map((s) => (
                <button key={s.key} onClick={() => setStrategy(s.key)}
                  className={cn('p-4 rounded-2xl text-left transition-all',
                    strategy === s.key ? 'bg-amber-500/10 ring-1 ring-amber-500/20' : 'bg-ink-50 dark:bg-ink-800/60')}>
                  <p className="text-sm font-bold mb-0.5">{s.label}{'star' in s && s.star && <span className="ml-1 text-amber-500">★</span>}</p>
                  <p className="text-[11px] text-ink-400 mb-2">{s.sub}</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display tabular-nums">{s.data.months}</p>
                  <p className="text-[11px] text-ink-400">meses · {formatCurrency(s.data.totalInterest)} en intereses</p>
                </button>
              ))}
            </div>
            {avalanche.months < snowball.months && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Avalancha te ahorra {snowball.months - avalanche.months} meses y {formatCurrency(snowball.totalInterest - avalanche.totalInterest)} en intereses.
              </p>
            )}
          </SectionCard>

          {/* Extra payment sim */}
          <SectionCard title="Simulador de abono extra">
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold text-sm">$</span>
              <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)}
                className="input pl-8 text-lg font-bold tabular-nums" />
            </div>
            <div className="flex gap-2 mb-4">
              {[50000, 100000, 200000, 500000].map((v) => (
                <button key={v} onClick={() => setExtraPayment(String(v))}
                  className="flex-1 py-2 rounded-xl bg-ink-50 dark:bg-ink-800/60 text-[11px] font-semibold hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                  +{new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(v)}
                </button>
              ))}
            </div>
            <button onClick={handleSimulate} disabled={simulating} className="btn-primary w-full">
              <Zap size={15} /> {simulating ? 'Calculando...' : 'Simular'}
            </button>
            <AnimatePresence>
              {simResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
                    Con {formatCurrency(parseInt(extraPayment) || 0)} extra/mes — estrategia {strategy === 'avalanche' ? 'Avalancha' : 'Bola de nieve'}:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white dark:bg-ink-800 text-center">
                      <p className="text-[11px] text-ink-400 mb-1">Te liberas en</p>
                      <p className="text-2xl font-bold font-display tabular-nums">{simResult.months}</p>
                      <p className="text-[10px] text-ink-400">meses</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-ink-800 text-center">
                      <p className="text-[11px] text-ink-400 mb-1">Pagas en intereses</p>
                      <p className="text-lg font-bold text-rose-500 font-display tabular-nums">{formatCurrency(simResult.totalInterest)}</p>
                    </div>
                  </div>
                  {(strategy === 'avalanche' ? avalanche.months : snowball.months) - simResult.months > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
                      Te ahorras {(strategy === 'avalanche' ? avalanche.months : snowball.months) - simResult.months} meses vs. pago mínimo.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* Debt cards */}
          <div>
            <h3 className="label mb-3">Detalle de deudas</h3>
            <div className="space-y-3">
              {debts.map((d) => {
                const paid = d.originalBalance - d.balance;
                const paidPct = d.originalBalance > 0 ? (paid / d.originalBalance) * 100 : 0;
                const daysUntil = getDaysUntilPayment(new Date(d.dueDate).getDate());
                const nextPay = getNextPaymentDate(new Date(d.dueDate).getDate());
                const isExpanded = expandedId === d.id;
                const isUrgent = daysUntil <= 5;

                // Amortization for expanded view
                const amort = isExpanded
                  ? buildAmortizationSchedule(d.balance, d.interestRate, d.minPayment, new Date(d.dueDate).getDate(), 6)
                  : [];

                return (
                  <div key={d.id} className="card overflow-hidden">
                    {/* Urgency banner */}
                    {isUrgent && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border-b border-rose-500/15">
                        <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                        <p className="text-xs text-rose-500 font-semibold">
                          Pago en {daysUntil} día{daysUntil !== 1 ? 's' : ''} — {formatCurrency(d.minPayment)}
                        </p>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            d.type === 'card' ? 'bg-violet-500/10' : 'bg-blue-500/10')}>
                            {d.type === 'card'
                              ? <CreditCard size={18} className="text-violet-500" />
                              : <Landmark size={18} className="text-blue-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold leading-tight">{d.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                                d.interestRate > 30 ? 'bg-rose-500/10 text-rose-500' :
                                  d.interestRate > 15 ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}>
                                {d.interestRate}% EA
                              </span>
                              {nextPay.isQuincena && (
                                <span className="text-[10px] text-ink-400 flex items-center gap-1">
                                  <Calendar size={10} /> {nextPay.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <p className="text-lg font-bold tabular-nums font-display text-right">
                            {formatCurrency(d.balance)}
                          </p>
                          <button
                            onClick={() => setDeleteConfirm(d.id)}
                            className="text-ink-300 hover:text-rose-500 transition-colors mt-0.5">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Progress */}
                      <ProgressBar value={paidPct} color="#D4AF37" height="h-1.5" />
                      <div className="flex justify-between mt-1 mb-4">
                        <span className="text-[11px] text-ink-400">{Math.round(paidPct)}% pagado de {formatCurrency(d.originalBalance)}</span>
                        <span className="text-[11px] text-ink-400">Mín. {formatCurrency(d.minPayment)}/mes</span>
                      </div>

                      {/* Next payment info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/60 flex items-center gap-2">
                          <Clock size={13} className={isUrgent ? 'text-rose-500' : 'text-ink-400'} />
                          <div>
                            <p className="text-[10px] text-ink-400">Próximo pago</p>
                            <p className={cn('text-xs font-bold', isUrgent ? 'text-rose-500' : '')}>
                              {new Date(nextPay.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                              {daysUntil === 0 ? ' · Hoy' : daysUntil === 1 ? ' · Mañana' : ` · en ${daysUntil} días`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setPaySheet(d); setPayAmount(String(d.minPayment)); }}
                          className="btn-primary py-2.5 px-4 text-xs whitespace-nowrap">
                          Registrar pago
                        </button>
                      </div>

                      {/* Expand/collapse schedule */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : d.id)}
                        className="w-full flex items-center justify-between text-xs text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors pt-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {isExpanded ? 'Ocultar calendario' : 'Ver próximos 6 pagos'}
                        </span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {/* Amortization table */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                            <div className="mt-3 rounded-xl overflow-hidden border border-ink-100 dark:border-ink-800">
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="bg-ink-50 dark:bg-ink-800/80">
                                    <th className="text-left px-3 py-2 text-ink-400 font-semibold">Fecha</th>
                                    <th className="text-right px-3 py-2 text-ink-400 font-semibold">Cuota</th>
                                    <th className="text-right px-3 py-2 text-ink-400 font-semibold">Interés</th>
                                    <th className="text-right px-3 py-2 text-ink-400 font-semibold">Capital</th>
                                    <th className="text-right px-3 py-2 text-ink-400 font-semibold">Saldo</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {amort.map((row, i) => (
                                    <tr key={i} className={cn('border-t border-ink-100 dark:border-ink-800/60',
                                      row.isQuincena ? 'bg-amber-500/5' : '')}>
                                      <td className="px-3 py-2">
                                        <p className="font-semibold text-ink-700 dark:text-ink-200">
                                          {new Date(row.date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                                        </p>
                                        {row.isQuincena && (
                                          <p className="text-[9px] text-amber-600 dark:text-amber-400">{row.quincenaLabel}</p>
                                        )}
                                      </td>
                                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatCurrency(row.payment)}</td>
                                      <td className="px-3 py-2 text-right text-rose-500 tabular-nums">{formatCurrency(row.interest)}</td>
                                      <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">{formatCurrency(row.principal)}</td>
                                      <td className="px-3 py-2 text-right font-bold tabular-nums">{formatCurrency(row.balance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] text-ink-400 mt-2 px-1">
                              Intereses calculados con tasa EA mensualizada. Los primeros {amort.length} períodos se muestran.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Add debt sheet ── */}
      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Añadir deuda">
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Nombre del crédito o deuda</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Crédito de Consumo Bancolombia" className="input" />
          </div>

          <div>
            <label className="label mb-2 block">Tipo</label>
            <div className="flex gap-2">
              {(['card', 'loan', 'other'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setDebtType(t)}
                  className={cn('flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                    debtType === t ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500')}>
                  {t === 'card' ? 'Tarjeta' : t === 'loan' ? 'Préstamo' : 'Otro'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Saldo actual ($)</label>
              <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="5000000" className="input" />
            </div>
            <div>
              <label className="label mb-2 block">Saldo original ($)</label>
              <input type="number" value={origBalance} onChange={(e) => setOrigBalance(e.target.value)} placeholder="10000000" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Tasa interés (% EA)</label>
              <input type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="28.5" className="input" />
            </div>
            <div>
              <label className="label mb-2 block">Cuota mínima ($)</label>
              <input type="number" value={minPay} onChange={(e) => setMinPay(e.target.value)} placeholder="350000" className="input" />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Día de pago mensual</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20, 25, 28, 30, 'Otro'].map((d) => (
                <button key={d} type="button" onClick={() => typeof d === 'number' && setDueDay(String(d))}
                  className={cn('py-2.5 rounded-xl text-xs font-bold border transition-all',
                    dueDay === String(d) ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500')}>
                  {d === 15 ? '15 ✦' : d === 30 ? '30 ✦' : d}
                </button>
              ))}
            </div>
            {(dueDay === '15' || dueDay === '30') && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                Día {dueDay} — {dueDay === '15' ? 'Primera' : 'Segunda'} quincena
              </p>
            )}
            {dueDay === '' || dueDay === 'Otro' ? (
              <input type="number" min="1" max="31" value={dueDay === 'Otro' ? '' : dueDay}
                onChange={(e) => setDueDay(e.target.value)} placeholder="Día del mes (1-31)" className="input mt-2" />
            ) : null}
          </div>

          <button onClick={handleAddDebt} disabled={!name || !balance} className="btn-primary w-full mt-2">
            Guardar deuda
          </button>
        </div>
      </Sheet>

      {/* ── Register payment sheet ── */}
      <Sheet open={!!paySheet} onClose={() => { setPaySheet(null); setPayAmount(''); }}
        title={`Pago — ${paySheet?.name}`}
        subtitle="El pago se registra como transacción en tus movimientos">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {paySheet && [paySheet.minPayment, paySheet.minPayment * 1.5, paySheet.balance].map((v, i) => (
              <button key={i} onClick={() => setPayAmount(String(Math.round(v)))}
                className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/60 text-center hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                <p className="text-[10px] text-ink-400 mb-1">
                  {i === 0 ? 'Mínimo' : i === 1 ? 'x1.5' : 'Total'}
                </p>
                <p className="text-sm font-bold tabular-nums">{formatCurrency(Math.round(v))}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="label mb-2 block">Monto a pagar ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold">$</span>
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                className="input pl-8 text-lg font-bold tabular-nums" />
            </div>
          </div>

          {paySheet && parseFloat(payAmount) > 0 && (
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Saldo después del pago: <strong>{formatCurrency(Math.max(0, paySheet.balance - (parseFloat(payAmount) || 0)))}</strong>
              </p>
            </div>
          )}

          <button onClick={handlePayDebt} disabled={!payAmount || parseFloat(payAmount) <= 0}
            className="btn-primary w-full">
            <CheckCircle2 size={15} /> Registrar pago
          </button>
        </div>
      </Sheet>

      {/* ── Delete confirmation ── */}
      <Sheet open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Eliminar deuda">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15">
            <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta deuda? Se perderá el historial y no podrás deshacer la acción.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary w-full">
              Cancelar
            </button>
            <button
              onClick={() => { if (deleteConfirm) { deleteDebt(deleteConfirm); setDeleteConfirm(null); } }}
              className="btn w-full bg-rose-500 text-white hover:bg-rose-600 text-sm font-semibold px-4 py-3">
              Eliminar
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
