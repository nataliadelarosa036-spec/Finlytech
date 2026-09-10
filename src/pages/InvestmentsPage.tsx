import { useMemo, useState } from 'react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { DonutChart } from '@/components/Charts';
import { ProgressBar } from '@/components/ProgressBar';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatPercent } from '@/utils/format';
import { getInvestmentTotal } from '@/utils/calculations';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Info, Plus, Trash2 } from 'lucide-react';

type SortKey = 'value' | 'return' | 'gain';

interface InvestmentsPageProps { embedded?: boolean; }

const EMOJI_OPTIONS = ['📈', '🏛️', '₿', '🏢', '🌾', '🪙', '📊', '💼'];

export function InvestmentsPage({ embedded }: InvestmentsPageProps = {}) {
  const investments = useStore((s) => s.investments);
  const addInvestment = useStore((s) => s.addInvestment);
  const deleteInvestment = useStore((s) => s.deleteInvestment);
  const darkMode = useStore((s) => s.darkMode);

  const [sortBy, setSortBy] = useState<SortKey>('value');
  const [showAdd, setShowAdd] = useState(false);

  // New investment form
  const [name, setName] = useState('');
  const [type, setType] = useState('Fondo Indexado');
  const [invested, setInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [dividends, setDividends] = useState('');
  const [emoji, setEmoji] = useState('📈');

  const total = getInvestmentTotal(investments);

  const sorted = useMemo(() => {
    return [...investments].sort((a, b) =>
      sortBy === 'return' ? b.returnPct - a.returnPct :
        sortBy === 'gain' ? (b.currentValue - b.invested) - (a.currentValue - a.invested) :
          b.currentValue - a.currentValue,
    );
  }, [investments, sortBy]);

  const totalGain = total.current - total.invested;
  const totalDividends = investments.reduce((s, i) => s + i.dividends, 0);

  const donutData = investments.map((inv) => ({
    name: inv.name,
    value: inv.currentValue,
    color: inv.returnPct >= 10 ? '#10b981' : inv.returnPct >= 0 ? '#3b82f6' : '#f43f5e',
  }));

  const handleAdd = () => {
    if (!name || !invested) return;
    const inv = parseInt(invested, 10) || 0;
    const curr = parseInt(currentValue, 10) || inv;
    const retPct = inv > 0 ? ((curr - inv) / inv) * 100 : 0;
    addInvestment({
      name,
      type,
      invested: inv,
      currentValue: curr,
      returnPct: parseFloat(retPct.toFixed(1)),
      dividends: parseInt(dividends, 10) || 0,
      emoji,
    });
    setName('');
    setType('Fondo Indexado');
    setInvested('');
    setCurrentValue('');
    setDividends('');
    setShowAdd(false);
  };

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-hero font-bold font-display">Inversiones</h1>
          <p className="text-sm text-ink-400 mt-1">{investments.length} instrumentos</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary py-2.5 px-4 text-xs inline-flex items-center gap-1.5"
        >
          <Plus size={15} />
          Añadir inversión
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-3xl">
            📈
          </div>
          <div>
            <p className="text-base font-bold font-display">Sin inversiones registradas</p>
            <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
              Registra tus fondos, acciones, bonos, criptoactivos o bienes raíces para calcular el rendimiento acumulado de tu patrimonio.
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary mx-auto py-2.5 px-5 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Añadir inversión
          </button>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/25 relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-1">Valor del portfolio</p>
              <p className="text-[2.75rem] font-bold tracking-tight font-display leading-none tabular-nums">
                {formatCurrency(total.current)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {total.returnPct >= 0
                  ? <TrendingUp size={14} className="text-white/80" />
                  : <TrendingDown size={14} className="text-white/80" />}
                <span className={cn('text-sm font-bold', total.returnPct >= 0 ? 'text-white' : 'text-rose-200')}>
                  {total.returnPct >= 0 ? '+' : ''}{formatPercent(total.returnPct, 1)}%
                </span>
                <span className="text-xs text-white/60">rendimiento total</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/15">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-0.5">Invertido</p>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(total.invested)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-0.5">Ganancia</p>
                  <p className={cn('text-sm font-bold tabular-nums', totalGain >= 0 ? 'text-white' : 'text-rose-200')}>
                    {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider font-bold mb-0.5">Dividendos</p>
                  <p className="text-sm font-bold tabular-nums text-white/90">{formatCurrency(totalDividends)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution donut */}
          <SectionCard title="Distribución del portfolio">
            <div className="flex items-center gap-4">
              <div className="w-44 shrink-0">
                <DonutChart data={donutData} size={176} dark={darkMode} />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                {investments.map((inv) => {
                  const w = total.current > 0 ? (inv.currentValue / total.current) * 100 : 0;
                  const c = inv.returnPct >= 10 ? '#10b981' : inv.returnPct >= 0 ? '#3b82f6' : '#f43f5e';
                  return (
                    <div key={inv.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{inv.emoji}</span>
                          <span className="text-xs text-ink-600 dark:text-ink-300 truncate">{inv.name}</span>
                        </div>
                        <span className="text-xs font-bold tabular-nums ml-2">{formatPercent(w, 0)}%</span>
                      </div>
                      <ProgressBar value={w} color={c} height="h-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* List header + sort */}
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h3 className="label">Tus activos</h3>
              <div className="flex gap-1">
                {(['value', 'return', 'gain'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSortBy(k)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                      sortBy === k ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-ink-400 hover:text-ink-600',
                    )}
                  >
                    {k === 'value' ? 'Valor' : k === 'return' ? 'Retorno' : 'Ganancia'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {sorted.map((inv) => {
                const gain = inv.currentValue - inv.invested;
                const isPos = inv.returnPct >= 0;

                return (
                  <div key={inv.id} className="card p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{inv.emoji}</span>
                        <div>
                          <p className="text-sm font-bold">{inv.name}</p>
                          <p className="text-xs text-ink-400">{inv.type}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-base font-bold tabular-nums font-display">{formatCurrency(inv.currentValue)}</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            {isPos ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-rose-500" />}
                            <span className={cn('text-xs font-bold', isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                              {isPos ? '+' : ''}{formatPercent(inv.returnPct, 1)}%
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteInvestment(inv.id)}
                          className="text-ink-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="Eliminar inversión"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-ink-50 dark:border-ink-800/60">
                      <div>
                        <p className="text-[10px] text-ink-400">Invertido</p>
                        <p className="text-xs font-semibold tabular-nums mt-0.5">{formatCurrency(inv.invested)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-400">Ganancia/Pérdida</p>
                        <p className={cn('text-xs font-semibold tabular-nums mt-0.5', isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                          {isPos ? '+' : ''}{formatCurrency(gain)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-400">Dividendos</p>
                        <p className="text-xs font-semibold tabular-nums mt-0.5">{formatCurrency(inv.dividends)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Add Sheet */}
      <Sheet open={showAdd} onClose={() => setShowAdd(false)} title="Añadir inversión">
        <div className="space-y-4">
          <div>
            <label className="label mb-2 block">Nombre del activo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Fondo S&P 500, Bitcoin, Bonos"
              className="input"
              required
            />
          </div>

          <div>
            <label className="label mb-2 block">Tipo de inversión</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Fondo indexado, Cripto, Acciones, etc."
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label mb-2 block">Capital invertido ($)</label>
              <input
                type="number"
                value={invested}
                onChange={(e) => setInvested(e.target.value)}
                placeholder="1000000"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label mb-2 block">Valor actual ($)</label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="1200000"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label mb-2 block">Dividendos / Ganancias recibidas ($)</label>
            <input
              type="number"
              value={dividends}
              onChange={(e) => setDividends(e.target.value)}
              placeholder="0"
              className="input"
            />
          </div>

          <div>
            <label className="label mb-2 block">Icono</label>
            <div className="flex gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all',
                    emoji === em ? 'border-amber-500 bg-amber-500/10' : 'border-ink-200 dark:border-ink-700'
                  )}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleAdd} disabled={!name || !invested} className="btn-primary w-full mt-2">
            Guardar inversión
          </button>
        </div>
      </Sheet>
    </div>
  );
}
