import { useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatRelativeDate } from '@/utils/format';
import { getTotalSubscriptionsMonthly, getTotalSubscriptionsYearly } from '@/utils/calculations';
import { AlertTriangle, Plus, Trash2, Pencil, PauseCircle, PlayCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import type { Subscription } from '@/types';

interface SubscriptionsPageProps { embedded?: boolean; }

const EMOJI_OPTIONS = ['📱', '🎧', '🎬', '🌐', '💪', '☁️', '🎨', '📚', '☕', '🎮', '💼', '🛒', '🎵', '📺', '🏠', '✈️'];
const CATEGORIES = ['Entretenimiento', 'Trabajo', 'Salud', 'Educación', 'Streaming', 'Música', 'Nube', 'Fitness', 'Otros'];

export function SubscriptionsPage({ embedded }: SubscriptionsPageProps = {}) {
  const subscriptions = useStore((s) => s.subscriptions);
  const addSubscription = useStore((s) => s.addSubscription);
  const updateSub = useStore((s) => s.updateSubscription);
  const cancelSub = useStore((s) => s.cancelSubscription);
  const deleteSub = useStore((s) => s.deleteSubscription);

  // Sheet state
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConf, setDeleteConf] = useState<string | null>(null);

  // Form fields (used for both add and edit)
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [category, setCategory] = useState('Entretenimiento');
  const [emoji, setEmoji] = useState('📱');
  const [nextCharge, setNextCharge] = useState('');
  const [active, setActive] = useState(true);

  const openAdd = () => {
    setEditingSub(null);
    setName(''); setAmount(''); setPeriod('monthly');
    setCategory('Entretenimiento'); setEmoji('📱');
    setNextCharge(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setActive(true);
    setShowForm(true);
  };

  const openEdit = (s: Subscription) => {
    setEditingSub(s);
    setName(s.name); setAmount(String(s.amount)); setPeriod(s.period);
    setCategory(s.category); setEmoji(s.emoji);
    setNextCharge(s.nextCharge); setActive(s.active);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name || !amount) return;
    const data = {
      name,
      amount: parseFloat(amount) || 0,
      period,
      nextCharge: nextCharge || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      category,
      emoji,
      active,
      monthsUnused: editingSub?.monthsUnused ?? 0,
    };
    if (editingSub) {
      updateSub(editingSub.id, data);
    } else {
      addSubscription(data);
    }
    setShowForm(false);
  };

  const monthly = getTotalSubscriptionsMonthly(subscriptions);
  const yearly = getTotalSubscriptionsYearly(subscriptions);
  const activeList = subscriptions.filter((s) => s.active);
  const inactive = subscriptions.filter((s) => !s.active);
  const unused = subscriptions.filter((s) => (s.monthsUnused ?? 0) >= 2 && s.active);
  const unusedSavings = unused.reduce((sum, s) => sum + (s.period === 'monthly' ? s.amount * 12 : s.amount), 0);

  // Next charge in 7 days
  const upcoming = subscriptions.filter((s) => {
    if (!s.active) return false;
    const d = new Date(s.nextCharge);
    const diff = Math.round((d.getTime() - Date.now()) / 86400000);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-hero font-bold font-display">Suscripciones</h1>
          <p className="text-sm text-ink-400 mt-1">{activeList.length} activas · {formatCurrency(monthly)}/mes</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5">
          <Plus size={15} /> Añadir
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="text-4xl">📱</div>
          <div>
            <p className="text-base font-bold font-display">Sin suscripciones</p>
            <p className="text-xs text-ink-400 mt-1 max-w-xs mx-auto">
              Registra tus suscripciones recurrentes para detectar gastos innecesarios y calcular cuánto pagas al año.
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary mx-auto py-2.5 px-5 text-sm inline-flex items-center gap-2">
            <Plus size={16} /> Añadir suscripción
          </button>
        </div>
      ) : (
        <>
          {/* Summary card */}
          <div className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #c9820a 0%, #f59e0b 100%)', boxShadow: '0 8px 32px rgba(212,175,55,0.3)' }}>
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative grid grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Mensual</p>
                <p className="text-2xl font-bold tabular-nums font-display">{formatCurrency(monthly)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Anual</p>
                <p className="text-2xl font-bold tabular-nums font-display">{formatCurrency(yearly)}</p>
              </div>
            </div>
            {/* Distribution bar */}
            <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-black/10">
              {activeList.map((s, i) => {
                const w = monthly > 0 ? (s.amount / monthly) * 100 : 0;
                return <div key={s.id} className="h-full rounded-full"
                  style={{ width: `${w}%`, background: `rgba(255,255,255,${0.9 - i * 0.12})` }} />;
              })}
            </div>
          </div>

          {/* Upcoming charge alert */}
          {upcoming.length > 0 && (
            <div className="card p-4 flex items-start gap-3 border-blue-400/20 bg-blue-500/[0.03]">
              <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Cobros próximos (7 días)</p>
                <div className="mt-1.5 space-y-1">
                  {upcoming.map((s) => {
                    const days = Math.round((new Date(s.nextCharge).getTime() - Date.now()) / 86400000);
                    return (
                      <p key={s.id} className="text-xs text-ink-500 dark:text-ink-400">
                        {s.emoji} {s.name} — {formatCurrency(s.amount)}
                        <span className="ml-1 text-blue-500 font-semibold">
                          {days === 0 ? '· Hoy' : days === 1 ? '· Mañana' : `· en ${days} días`}
                        </span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Unused warning */}
          {unused.length > 0 && (
            <div className="card p-4 border-amber-400/20 bg-amber-500/[0.03] flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold mb-0.5">{unused.length} suscripción{unused.length > 1 ? 'es' : ''} sin uso</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Cancelarlas te ahorraría <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrency(unusedSavings)}</span> al año.
                </p>
              </div>
            </div>
          )}

          {/* Active subscriptions */}
          <div>
            <h3 className="label mb-3">Activas</h3>
            <div className="space-y-2">
              {activeList.map((s) => <SubCard key={s.id} sub={s} onEdit={openEdit} onCancel={() => cancelSub(s.id)} onDelete={() => setDeleteConf(s.id)} />)}
            </div>
          </div>

          {/* Inactive subscriptions */}
          {inactive.length > 0 && (
            <div>
              <h3 className="label mb-3">Pausadas / Canceladas</h3>
              <div className="space-y-2">
                {inactive.map((s) => <SubCard key={s.id} sub={s} onEdit={openEdit} onCancel={() => updateSub(s.id, { active: true })} onDelete={() => setDeleteConf(s.id)} reactivate />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Sheet */}
      <Sheet
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingSub ? 'Editar suscripción' : 'Nueva suscripción'}
      >
        <div className="space-y-4">
          {/* Emoji picker */}
          <div>
            <label className="label mb-2 block">Icono</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button key={em} type="button" onClick={() => setEmoji(em)}
                  className={cn('w-10 h-10 rounded-xl text-xl border-2 transition-all',
                    emoji === em ? 'border-amber-500 bg-amber-500/10 scale-110' : 'border-ink-200 dark:border-ink-700')}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Netflix, Spotify, iCloud…" className="input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Monto ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="24900" className="input" />
            </div>
            <div>
              <label className="label mb-2 block">Frecuencia</label>
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="input">
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Categoría</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                    category === c ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'border-ink-200 dark:border-ink-700 text-ink-500')}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Próxima fecha de cobro</label>
            <input type="date" value={nextCharge} onChange={(e) => setNextCharge(e.target.value)} className="input" />
          </div>

          <button onClick={handleSave} disabled={!name || !amount} className="btn-primary w-full">
            {editingSub ? 'Guardar cambios' : 'Añadir suscripción'}
          </button>
        </div>
      </Sheet>

      {/* Delete confirmation */}
      <Sheet open={!!deleteConf} onClose={() => setDeleteConf(null)} title="Eliminar suscripción">
        <div className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            ¿Eliminar permanentemente esta suscripción? Usa "Pausar" si solo quieres desactivarla temporalmente.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setDeleteConf(null)} className="btn-secondary w-full">Cancelar</button>
            <button onClick={() => { if (deleteConf) { deleteSub(deleteConf); setDeleteConf(null); } }}
              className="btn w-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-3 rounded-xl">
              Eliminar
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

// ── Sub card component ──────────────────────────────────────────────────────
function SubCard({ sub, onEdit, onCancel, onDelete, reactivate = false }: {
  sub: Subscription;
  onEdit: (s: Subscription) => void;
  onCancel: () => void;
  onDelete: () => void;
  reactivate?: boolean;
}) {
  const isUnused = (sub.monthsUnused ?? 0) >= 2;
  const daysUntil = Math.round((new Date(sub.nextCharge).getTime() - Date.now()) / 86400000);
  const isUrgent = daysUntil >= 0 && daysUntil <= 3;

  return (
    <div className={cn('card p-4', !sub.active && 'opacity-60', isUnused && 'border-amber-400/20')}>
      <div className="flex items-center gap-3">
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0',
          isUnused ? 'bg-amber-500/10' : 'bg-ink-50 dark:bg-ink-800/60')}>
          {sub.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold">{sub.name}</p>
            {isUnused && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                {sub.monthsUnused}m sin uso
              </span>
            )}
            {isUrgent && sub.active && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                {daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil}d`}
              </span>
            )}
          </div>
          <p className="text-xs text-ink-400 mt-0.5">
            {sub.category} · {sub.period === 'monthly' ? 'Mensual' : 'Anual'} · {formatRelativeDate(sub.nextCharge)}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <p className="text-sm font-bold tabular-nums mr-1">{formatCurrency(sub.amount)}</p>
          <button onClick={() => onEdit(sub)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={onCancel} title={reactivate ? 'Reactivar' : 'Pausar'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
            {reactivate ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
          </button>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
