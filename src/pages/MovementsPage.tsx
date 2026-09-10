import { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Trash2, Pencil, Zap, X } from 'lucide-react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { IconBadge } from '@/components/IconBadge';
import { TransactionSheet } from '@/components/TransactionSheet';
import { Sheet } from '@/components/Sheet';
import { formatCurrency, formatRelativeDate } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { Transaction } from '@/types';

type FilterType = 'all' | 'income' | 'expense';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

interface MovementsPageProps { embedded?: boolean; }

export function MovementsPage({ embedded }: MovementsPageProps = {}) {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const deleteTransaction = useStore((s) => s.deleteTransaction);
  const autoRules = useStore((s) => s.autoRules);
  const addAutoRule = useStore((s) => s.addAutoRule);
  const toggleAutoRule = useStore((s) => s.toggleAutoRule);
  const deleteAutoRule = useStore((s) => s.deleteAutoRule);

  const [showRules, setShowRules] = useState(false);
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleCat, setNewRuleCat] = useState('');
  const [newRuleAcc, setNewRuleAcc] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let r = [...transactions];
    if (search) r = r.filter((t) => t.description.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') r = r.filter((t) => t.type === filterType);
    if (filterCategory !== 'all') r = r.filter((t) => t.category.id === filterCategory);
    if (filterAccount !== 'all') r = r.filter((t) => t.account.id === filterAccount);
    r.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return r;
  }, [transactions, search, filterType, filterCategory, filterAccount, sortBy]);

  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach((t) => {
      const key = formatRelativeDate(t.date);
      map.set(key, [...(map.get(key) || []), t]);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const hasFilters = filterType !== 'all' || filterCategory !== 'all' || filterAccount !== 'all' || search;

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Movimientos</h1>
        <p className="text-sm text-ink-400 mt-1">
          {filtered.length} movimientos
        </p>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2">
        <div className="flex-1 card p-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <div>
            <p className="text-[10px] text-ink-400 leading-none">Ingresos</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              +{formatCurrency(totalIncome)}
            </p>
          </div>
        </div>
        <div className="flex-1 card p-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <div>
            <p className="text-[10px] text-ink-400 leading-none">Gastos</p>
            <p className="text-sm font-bold text-rose-500 tabular-nums mt-0.5">
              -{formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar movimiento..."
            className="input pl-10 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-xl border transition-all',
            showFilters || hasFilters
              ? 'bg-brand-500/10 border-brand-500/25 text-brand-600 dark:text-brand-400'
              : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700/60 text-ink-500',
          )}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 space-y-4 animate-slide-down">
          {/* Type pills */}
          <div>
            <p className="label mb-2">Tipo</p>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterType(v)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    filterType === v ? 'bg-brand-500 text-white' : 'bg-ink-50 dark:bg-ink-800 text-ink-500',
                  )}
                >
                  {v === 'all' ? 'Todos' : v === 'income' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="label mb-2">Categoría</p>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="input py-2 text-sm">
                <option value="all">Todas</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <p className="label mb-2">Cuenta</p>
              <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="input py-2 text-sm">
                <option value="all">Todas</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="label mb-2">Ordenar por</p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortType)} className="input py-2 text-sm">
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
              <option value="amount-desc">Mayor cantidad</option>
              <option value="amount-asc">Menor cantidad</option>
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={() => { setFilterType('all'); setFilterCategory('all'); setFilterAccount('all'); setSearch(''); }}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-5">
        {grouped.map(([date, txs]) => {
          const dayTotal = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <p className="label">{date}</p>
                {dayTotal > 0 && (
                  <p className="text-[11px] font-semibold text-rose-500 tabular-nums">
                    -{formatCurrency(dayTotal)}
                  </p>
                )}
              </div>
              <div className="card divide-y divide-ink-50 dark:divide-ink-800/50">
                {txs.map((t) => (
                  <div key={t.id} className="group flex items-center gap-3 px-4 py-3.5 hover:bg-ink-50/50 dark:hover:bg-ink-800/20 transition-colors">
                    <IconBadge icon={t.category.icon} color={t.category.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{t.description}</p>
                      <p className="text-xs text-ink-400">{t.category.name} · {t.account.name}</p>
                    </div>
                    <p className={cn(
                      'text-sm font-bold tabular-nums',
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-700 dark:text-ink-300',
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      <button
                        onClick={() => { setEditTx(t); setShowAdd(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-ink-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {transactions.length === 0 ? (
          <div className="card p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-3xl">
              💸
            </div>
            <div>
              <p className="text-base font-bold font-display">Aún no tienes movimientos</p>
              <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
                Registra tu primer ingreso o gasto para comenzar a monitorear tu dinero en tiempo real.
              </p>
            </div>
            <button
              onClick={() => { setEditTx(null); setShowAdd(true); }}
              className="btn-primary mx-auto py-2.5 px-5 text-sm inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Registrar movimiento
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-2xl mb-3">🔍</p>
            <p className="text-sm font-semibold text-ink-500">Sin resultados</p>
            <p className="text-xs text-ink-400 mt-1">Intenta con otros filtros de búsqueda</p>
          </div>
        ) : null}
      </div>

      {/* Auto rules section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-brand-500/10 flex items-center justify-center">
              <Zap size={11} className="text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="label">Reglas automáticas</h3>
          </div>
          <button onClick={() => setShowRules(true)} className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">
            Gestionar
          </button>
        </div>
        <div className="space-y-2">
          {autoRules.filter((r) => r.active).map((rule) => {
            const cat = categories.find((c) => c.id === rule.categoryId);
            const acc = accounts.find((a) => a.id === rule.accountId);
            return (
              <div key={rule.id} className="card p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Zap size={12} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">
                    {rule.matchMode === 'contains' ? 'Contiene' : rule.matchMode === 'startsWith' ? 'Empieza con' : 'Es'} "{rule.description}"
                  </p>
                  <p className="text-[11px] text-ink-400 mt-0.5">→ {cat?.icon} {cat?.name} · {acc?.name}</p>
                </div>
              </div>
            );
          })}
          {autoRules.filter((r) => r.active).length === 0 && (
            <p className="text-xs text-ink-400 px-0.5">Sin reglas activas.</p>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditTx(null); setShowAdd(true); }}
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-30 w-13 h-13 w-14 h-14 rounded-2xl gradient-brand text-white shadow-float flex items-center justify-center hover:shadow-glow active:scale-90 transition-all"
        aria-label="Agregar movimiento"
      >
        <Plus size={22} />
      </button>

      <TransactionSheet
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditTx(null); }}
        editTransaction={editTx}
      />

      {/* Auto rules sheet */}
      <Sheet open={showRules} onClose={() => setShowRules(false)} title="Reglas automáticas" subtitle="Categorizan tus movimientos automáticamente">
        <div className="space-y-4">
          <div className="space-y-2">
            {autoRules.map((rule) => {
              const cat = categories.find((c) => c.id === rule.categoryId);
              const acc = accounts.find((a) => a.id === rule.accountId);
              return (
                <div key={rule.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-800/60">
                  <button
                    onClick={() => toggleAutoRule(rule.id)}
                    className={cn('w-9 h-5 rounded-full transition-colors relative shrink-0', rule.active ? 'bg-brand-500' : 'bg-ink-200 dark:bg-ink-700')}
                  >
                    <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-all', rule.active ? 'left-[18px]' : 'left-0.5')} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{rule.matchMode === 'contains' ? 'Contiene' : rule.matchMode === 'startsWith' ? 'Empieza con' : 'Es igual a'} "{rule.description}"</p>
                    <p className="text-[11px] text-ink-400">{cat?.icon} {cat?.name} · {acc?.name}</p>
                  </div>
                  <button onClick={() => deleteAutoRule(rule.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-ink-400 hover:text-rose-500 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
            <p className="text-xs font-bold mb-3 text-ink-700 dark:text-ink-200">Crear nueva regla</p>
            <div className="space-y-3">
              <input
                type="text"
                value={newRuleDesc}
                onChange={(e) => setNewRuleDesc(e.target.value.toUpperCase())}
                placeholder="Texto a detectar (ej: SPOTIFY)"
                className="input text-sm"
              />
              <select value={newRuleCat} onChange={(e) => setNewRuleCat(e.target.value)} className="input text-sm">
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <select value={newRuleAcc} onChange={(e) => setNewRuleAcc(e.target.value)} className="input text-sm">
                <option value="">Seleccionar cuenta</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button
                onClick={() => {
                  if (!newRuleDesc || !newRuleCat || !newRuleAcc) return;
                  addAutoRule({ description: newRuleDesc, categoryId: newRuleCat, accountId: newRuleAcc, type: 'expense', matchMode: 'contains', active: true });
                  setNewRuleDesc(''); setNewRuleCat(''); setNewRuleAcc('');
                }}
                disabled={!newRuleDesc || !newRuleCat || !newRuleAcc}
                className="btn-primary w-full"
              >
                <Plus size={15} />
                Crear regla
              </button>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
