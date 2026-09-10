import { useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { ProgressBar } from '@/components/ProgressBar';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatPercent, formatDate } from '@/utils/format';
import { getCardUtilization, getCardAvailable, getCardMinPayment, projectCardPayoff } from '@/utils/calculations';
import { cn } from '@/utils/cn';
import { CreditCard, Calendar, TrendingDown, AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface CardsPageProps { embedded?: boolean; }

const CARD_COLORS = ['#1a1f29', '#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e'];

export function CardsPage({ embedded }: CardsPageProps = {}) {
  const cards = useStore((s) => s.cards);
  const cardStatements = useStore((s) => s.cardStatements);
  const payCard = useStore((s) => s.payCard);
  const addCard = useStore((s) => s.addCard);
  const deleteCard = useStore((s) => s.deleteCard);

  const [payingCard, setPayingCard] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // New card form
  const [name, setName] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [limit, setLimit] = useState('');
  const [balance, setBalance] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);

  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const totalAvailable = Math.max(0, totalLimit - totalBalance);
  const overallUtil = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  const utilColor = overallUtil > 70 ? '#f43f5e' : overallUtil > 40 ? '#f59e0b' : '#10b981';

  const handlePay = () => {
    const amt = parseInt(payAmount, 10);
    if (!payingCard || !amt) return;
    payCard(payingCard, amt);
    setPayingCard(null);
    setPayAmount('');
  };

  const handleAddCard = () => {
    if (!name || !limit) return;
    addCard({
      name,
      number: lastDigits ? `•••• ${lastDigits.slice(-4)}` : '•••• 0000',
      limit: parseInt(limit, 10) || 0,
      balance: parseInt(balance, 10) || 0,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      color: selectedColor,
    });
    setName('');
    setLastDigits('');
    setLimit('');
    setBalance('');
    setDueDate('');
    setSelectedColor(CARD_COLORS[0]);
    setShowAdd(false);
  };

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-hero font-bold font-display">Tarjetas</h1>
          <p className="text-sm text-ink-400 mt-1">{cards.length} tarjetas activas</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5"
        >
          <Plus size={15} />
          Añadir tarjeta
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-3xl">
            💳
          </div>
          <div>
            <p className="text-base font-bold font-display">No tienes tarjetas registradas</p>
            <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
              Añade tus tarjetas de crédito para monitorear tu cupo disponible, fechas de corte y plan de pagos.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary mx-auto py-2.5 px-5 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Añadir tarjeta
          </button>
        </div>
      ) : (
        <>
          {/* Global summary */}
          <div className="card p-5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="label mb-1">Cupo total</p>
                <p className="text-base font-bold tabular-nums font-display">{formatCurrency(totalLimit)}</p>
              </div>
              <div>
                <p className="label mb-1">Usado</p>
                <p className="text-base font-bold tabular-nums text-rose-500 font-display">{formatCurrency(totalBalance)}</p>
              </div>
              <div>
                <p className="label mb-1">Disponible</p>
                <p className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400 font-display">{formatCurrency(totalAvailable)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-ink-400">Utilización global</span>
              <span className="text-xs font-bold" style={{ color: utilColor }}>{formatPercent(overallUtil, 1)}</span>
            </div>
            <ProgressBar value={overallUtil} color={utilColor} height="h-2.5" glow={overallUtil > 70} />
            {overallUtil > 70 && (
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/15">
                <AlertCircle size={13} className="text-rose-500 shrink-0" />
                <p className="text-xs text-rose-500">Utilización alta. Reducirla mejora tu score crediticio.</p>
              </div>
            )}
            {overallUtil <= 30 && (
              <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Excelente. Utilización bajo el 30% óptimo.</p>
              </div>
            )}
          </div>

          {/* Card list */}
          <div className="space-y-4">
            {cards.map((card) => {
              const stmt = cardStatements.find((s) => s.cardId === card.id);
              const util = getCardUtilization(card);
              const available = getCardAvailable(card);
              const minPay = stmt ? getCardMinPayment(card, stmt.minPaymentPct) : getCardMinPayment(card);
              const payoff = projectCardPayoff(card.balance, stmt?.interestRate ?? 36, Math.max(50000, minPay * 2));
              const cardColor = util > 70 ? '#f43f5e' : util > 40 ? '#f59e0b' : '#10b981';

              return (
                <div key={card.id} className="card overflow-hidden">
                  {/* Card face */}
                  <div
                    className="relative p-5 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}cc 100%)` }}
                  >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

                    <div className="relative flex items-start justify-between">
                      <div>
                        <CreditCard size={22} className="text-white/70 mb-3" />
                        <p className="text-white font-bold text-base">{card.name}</p>
                        <p className="text-white/55 text-sm font-mono tracking-widest mt-0.5">{card.number}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <button
                          onClick={() => deleteCard(card.id)}
                          className="text-white/50 hover:text-white mb-2 p-1 transition-colors"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 size={15} />
                        </button>
                        <p className="text-white/55 text-[11px] uppercase tracking-widest mb-1">Saldo</p>
                        <p className="text-white text-2xl font-bold tabular-nums font-display">{formatCurrency(card.balance)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <StatCell label="Cupo total" value={formatCurrency(card.limit)} />
                      <StatCell label="Disponible" value={formatCurrency(available)} green />
                      <StatCell label="Pago mínimo" value={formatCurrency(minPay)} />
                      <StatCell label="Tasa anual" value={`${stmt?.interestRate ?? 36}% E.A.`} />
                    </div>

                    {/* Utilization bar */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-ink-400">Utilización</span>
                        <span className="text-xs font-bold" style={{ color: cardColor }}>{formatPercent(util, 1)}</span>
                      </div>
                      <ProgressBar value={util} color={cardColor} height="h-2" glow={util > 70} />
                    </div>

                    {/* Statement info */}
                    {stmt && (
                      <div className="flex items-center gap-4 pt-3 border-t border-ink-50 dark:border-ink-800/60">
                        <div className="flex items-center gap-1.5 text-xs text-ink-400">
                          <Calendar size={12} />
                          <span>Corte: día {stmt.cutoffDay}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-ink-400">
                          <Calendar size={12} />
                          <span>Pago: {formatDate(stmt.nextPayment)}</span>
                        </div>
                      </div>
                    )}

                    {/* Payoff insight */}
                    {card.balance > 0 && (
                      <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50 flex items-start gap-2">
                        <TrendingDown size={13} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
                          Pagando <span className="font-bold">{formatCurrency(minPay * 2)}/mes</span> te liberas en ~{payoff.months} meses.
                          Intereses: <span className="font-bold text-rose-500">{formatCurrency(payoff.totalInterest)}</span>.
                        </p>
                      </div>
                    )}

                    <button onClick={() => setPayingCard(card.id)} className="btn-primary w-full">
                      Registrar pago
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add card sheet */}
      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Añadir tarjeta">
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Nombre de la tarjeta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Visa Gold Bancolombia"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label mb-2 block">Últimos 4 dígitos</label>
            <input
              type="text"
              maxLength={4}
              value={lastDigits}
              onChange={(e) => setLastDigits(e.target.value)}
              placeholder="1234"
              className="input font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Cupo total ($)</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="3000000"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label mb-2 block">Saldo usado ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Fecha de vencimiento / pago</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="label mb-2 block">Color</label>
            <div className="flex gap-2">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-transform',
                    selectedColor === c ? 'scale-125 ring-2 ring-amber-500' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button onClick={handleAddCard} disabled={!name || !limit} className="btn-primary w-full mt-2">
            Guardar tarjeta
          </button>
        </div>
      </Sheet>

      {/* Pay sheet */}
      <Sheet
        open={!!payingCard}
        onClose={() => { setPayingCard(null); setPayAmount(''); }}
        title="Registrar pago"
        subtitle={cards.find(c => c.id === payingCard)?.name}
      >
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Monto a pagar</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold text-lg">$</span>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
                className="input pl-9 text-2xl font-bold tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {(() => {
            const card = cards.find((c) => c.id === payingCard);
            if (!card) return null;
            const stmt = cardStatements.find((s) => s.cardId === card.id);
            const minPay = stmt ? getCardMinPayment(card, stmt.minPaymentPct) : getCardMinPayment(card);
            return (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPayAmount(String(minPay))}
                  className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800 text-center hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                >
                  <p className="text-[10px] text-ink-400 mb-0.5">Mínimo</p>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(minPay)}</p>
                </button>
                <button
                  onClick={() => setPayAmount(String(card.balance))}
                  className="p-3 rounded-xl bg-amber-500/10 text-center hover:bg-amber-500/15 transition-colors"
                >
                  <p className="text-[10px] text-amber-500 mb-0.5">Pago total</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 tabular-nums">{formatCurrency(card.balance)}</p>
                </button>
              </div>
            );
          })()}

          <button onClick={handlePay} disabled={!payAmount} className="btn-primary w-full">
            Confirmar pago
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function StatCell({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-800/50">
      <p className="text-[10px] text-ink-400 mb-0.5">{label}</p>
      <p className={cn('text-sm font-bold tabular-nums', green ? 'text-emerald-600 dark:text-emerald-400' : '')}>{value}</p>
    </div>
  );
}
