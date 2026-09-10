import { useState } from 'react';
import { Plus, Target, Trash2, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatDate, monthsUntil } from '@/utils/format';
import { getGoalProgress, getGoalRemaining, getGoalEstimatedDate } from '@/utils/calculations';
import { cn } from '@/utils/cn';
import type { Goal } from '@/types';

const emojiOptions = ['🇯🇵', '🚨', '💻', '🚗', '🏠', '💍', '🎓', '🏖️', '📱', '🎨', '🎸', '⚽', '✈️', '🏋️', '🎵'];
const colorOptions = ['#13a8a1', '#3b82f6', '#8b5cf6', '#f95d0d', '#f43f5e', '#10b981', '#f59e0b'];

interface GoalsPageProps { embedded?: boolean; }

export function GoalsPage({ embedded }: GoalsPageProps = {}) {
  const goals = useStore((s) => s.goals);
  const contributeToGoal = useStore((s) => s.contributeToGoal);
  const addGoal = useStore((s) => s.addGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const [showAdd, setShowAdd] = useState(false);
  const [contributingGoal, setContrib] = useState<Goal | null>(null);
  const [contributeAmount, setContribAmt] = useState('');

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [selectedColor, setColor] = useState(colorOptions[0]);
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthly, setMonthly] = useState('');

  const reset = () => { setName(''); setEmoji('🎯'); setTarget(''); setCurrent(''); setTargetDate(''); setMonthly(''); setColor(colorOptions[0]); };

  const handleAdd = () => {
    if (!name || !target) return;
    addGoal({
      name, emoji,
      target: parseInt(target, 10),
      current: parseInt(current, 10) || 0,
      targetDate: targetDate || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      monthlyContribution: parseInt(monthly, 10) || 100000,
      color: selectedColor,
    });
    reset();
    setShowAdd(false);
  };

  const handleContribute = () => {
    if (!contributingGoal || !contributeAmount) return;
    contributeToGoal(contributingGoal.id, parseInt(contributeAmount, 10));
    setContrib(null);
    setContribAmt('');
  };

  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-hero font-bold font-display">Metas</h1>
          <p className="text-sm text-ink-400 mt-1">{goals.length} metas activas</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary py-2.5 px-4 text-sm">
          <Plus size={15} />
          Nueva meta
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="card p-5 flex items-center gap-5">
          <ProgressRing
            value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
            size={80}
            strokeWidth={6}
            color="#13a8a1"
            glow
          >
            <div className="text-center">
              <p className="text-sm font-bold tabular-nums font-display">
                {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
              </p>
            </div>
          </ProgressRing>
          <div>
            <p className="label mb-1">Progreso total</p>
            <p className="text-lg font-bold tabular-nums font-display">{formatCurrency(totalSaved)}</p>
            <p className="text-xs text-ink-400 mt-0.5">de {formatCurrency(totalTarget)} en todas las metas</p>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = getGoalProgress(goal);
          const remaining = getGoalRemaining(goal);
          const estDate = getGoalEstimatedDate(goal);
          const months = monthsUntil(goal.targetDate);
          const isDone = progress >= 100;

          return (
            <div key={goal.id} className="card p-5">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `${goal.color}18` }}
                >
                  {goal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold truncate">{goal.name}</p>
                    {isDone && <span className="pill bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">✓ Alcanzada</span>}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5 tabular-nums">
                    {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                  </p>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-ink-300 hover:text-rose-500 transition-colors shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-1">
                <ProgressBar value={progress} color={goal.color} height="h-2.5" glow={progress >= 80} />
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-xs text-ink-400">
                  {isDone ? '🎉 Completada' : `${formatCurrency(remaining)} restantes`}
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ color: goal.color }}>
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-ink-50 dark:border-ink-800/60">
                <Stat label="Fecha objetivo" value={formatDate(goal.targetDate)} />
                <Stat label="Fecha estimada" value={formatDate(estDate)} highlight />
                <Stat label="Aporte mensual" value={formatCurrency(goal.monthlyContribution)} />
                <Stat label="Tiempo restante" value={months > 0 ? `${months} meses` : 'Alcanzada'} />
              </div>

              <button
                onClick={() => setContrib(goal)}
                className="btn-secondary w-full mt-4 py-2.5 text-sm"
                disabled={isDone}
              >
                <Plus size={14} />
                Hacer aporte
              </button>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="card p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 flex items-center justify-center mx-auto">
              <Target size={28} className="text-brand-500" />
            </div>
            <p className="text-sm font-semibold text-ink-600 dark:text-ink-300">Sin metas aún</p>
            <p className="text-xs text-ink-400">Crea tu primera meta financiera</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto px-5 py-2.5 text-sm">
              <Plus size={15} /> Crear meta
            </button>
          </div>
        )}
      </div>

      {/* Add goal sheet */}
      <Sheet open={showAdd} onClose={() => { setShowAdd(false); reset(); }} title="Nueva meta">
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Viaje a Europa" className="input" autoFocus />
          </div>

          <div>
            <label className="label mb-2 block">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={cn('w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                    emoji === e ? 'ring-2 ring-brand-500 bg-brand-500/10' : 'bg-ink-50 dark:bg-ink-800 hover:bg-ink-100 dark:hover:bg-ink-700',
                  )}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Color</label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn('w-8 h-8 rounded-full transition-all', selectedColor === c ? 'ring-2 ring-offset-2 ring-ink-400 scale-110' : '')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Objetivo ($)</label>
              <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="5000000" className="input" />
            </div>
            <div>
              <label className="label mb-2 block">Ahorrado ($)</label>
              <input type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="0" className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Fecha objetivo</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label mb-2 block">Aporte mensual</label>
              <input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="350000" className="input" />
            </div>
          </div>

          <button onClick={handleAdd} disabled={!name || !target} className="btn-primary w-full">
            Crear meta
          </button>
        </div>
      </Sheet>

      {/* Contribute sheet */}
      <Sheet
        open={!!contributingGoal}
        onClose={() => { setContrib(null); setContribAmt(''); }}
        title={contributingGoal ? `Aportar a ${contributingGoal.name}` : ''}
      >
        {contributingGoal && (
          <div className="space-y-4">
            <div className="text-center py-3">
              <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-3"
                style={{ background: `${contributingGoal.color}18` }}>
                {contributingGoal.emoji}
              </div>
              <ProgressBar value={getGoalProgress(contributingGoal)} color={contributingGoal.color} height="h-2" />
              <p className="text-xs text-ink-400 mt-2">
                Faltan {formatCurrency(getGoalRemaining(contributingGoal))}
              </p>
            </div>
            <div>
              <label className="label mb-2 block">Cantidad a aportar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-bold">$</span>
                <input
                  type="number"
                  value={contributeAmount}
                  onChange={(e) => setContribAmt(e.target.value)}
                  placeholder="0"
                  className="input pl-8 text-xl font-bold tabular-nums"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2">
              {[50000, 100000, 200000].map((v) => (
                <button key={v} onClick={() => setContribAmt(String(v))}
                  className="flex-1 py-2 rounded-xl bg-ink-50 dark:bg-ink-800 text-xs font-semibold hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                  +{formatCurrency(v)}
                </button>
              ))}
            </div>
            <button onClick={handleContribute} disabled={!contributeAmount} className="btn-primary w-full">
              <ArrowUpRight size={16} />
              Aportar {contributeAmount ? formatCurrency(parseInt(contributeAmount, 10) || 0) : ''}
            </button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-800/50">
      <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn('text-xs font-bold', highlight ? 'text-brand-600 dark:text-brand-400' : '')}>{value}</p>
    </div>
  );
}
