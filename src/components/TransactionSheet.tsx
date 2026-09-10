import { useState, useEffect } from 'react';
import { Sheet } from './Sheet';
import { useStore } from '@/state/store';
import type { TransactionType, Transaction } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

interface TransactionSheetProps {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; icon: string; color: string }[] = [
  { value: 'expense', label: 'Gasto', icon: '💸', color: '#f43f5e' },
  { value: 'income', label: 'Ingreso', icon: '💰', color: '#13a8a1' },
  { value: 'saving', label: 'Ahorro', icon: '🐷', color: '#13a8a1' },
  { value: 'investment', label: 'Inversión', icon: '📈', color: '#8b5cf6' },
  { value: 'transfer', label: 'Transferencia', icon: '🔄', color: '#3b82f6' },
  { value: 'payment', label: 'Pago', icon: '🧾', color: '#f59e0b' },
  { value: 'debt', label: 'Deuda', icon: '💳', color: '#f95d0d' },
];

export function TransactionSheet({ open, onClose, editTransaction }: TransactionSheetProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // Sync with edit transaction
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setDescription(editTransaction.description);
      setCategoryId(editTransaction.category.id);
      setAccountId(editTransaction.account.id);
      setDate(editTransaction.date.slice(0, 10));
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setCategoryId(categories[0]?.id ?? '');
      setAccountId(accounts[0]?.id ?? '');
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [editTransaction, open]);

  const filteredCategories = categories.filter((c) =>
    type === 'income' || type === 'saving' || type === 'investment'
      ? c.kind === 'income'
      : c.kind === 'expense',
  );

  // Reset category when type changes
  useEffect(() => {
    const available = categories.filter((c) =>
      type === 'income' || type === 'saving' || type === 'investment' ? c.kind === 'income' : c.kind === 'expense',
    );
    if (available.length > 0 && !available.find(c => c.id === categoryId)) {
      setCategoryId(available[0].id);
    }
  }, [type]);

  const numAmount = parseInt(amount, 10) || 0;

  const handleSubmit = () => {
    if (!numAmount || !description) return;
    const category = categories.find((c) => c.id === categoryId)!;
    const account = accounts.find((a) => a.id === accountId)!;
    const payload = { type, amount: numAmount, description, category, account, date: new Date(date).toISOString() };
    editTransaction ? updateTransaction(editTransaction.id, payload) : addTransaction(payload);
    onClose();
  };

  const selectedType = TYPE_OPTIONS.find(t => t.value === type)!;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editTransaction ? 'Editar movimiento' : 'Nuevo movimiento'}
    >
      <div className="space-y-5">

        {/* Type selector */}
        <div>
          <p className="label mb-3">Tipo</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                  type === opt.value
                    ? 'text-white shadow-sm'
                    : 'bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700',
                )}
                style={type === opt.value ? { background: opt.color, boxShadow: `0 2px 8px ${opt.color}40` } : {}}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <p className="label mb-2">Cantidad</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: selectedType.color }}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="input pl-9 text-2xl font-bold tabular-nums"
              autoFocus
            />
          </div>
          {numAmount > 0 && (
            <p className="text-xs text-ink-400 mt-1.5 tabular-nums">{formatCurrency(numAmount)}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="label mb-2">Descripción</p>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Ej: Almuerzo, Salario, Rappi..."
            className="input"
          />
        </div>

        {/* Category */}
        <div>
          <p className="label mb-2">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {filteredCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                  categoryId === c.id
                    ? 'text-white'
                    : 'bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700',
                )}
                style={categoryId === c.id ? { background: c.color, boxShadow: `0 2px 8px ${c.color}35` } : {}}
              >
                <span>{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="label mb-2">Cuenta</p>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccountId(a.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-xl text-left transition-all',
                  accountId === a.id
                    ? 'ring-1 ring-brand-500/30 bg-brand-500/8'
                    : 'bg-ink-50 dark:bg-ink-800/60 hover:bg-ink-100 dark:hover:bg-ink-700',
                )}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: a.color }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{a.name}</p>
                  <p className="text-[10px] text-ink-400 truncate">{a.institution}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <p className="label mb-2">Fecha</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!numAmount || !description}
          className="btn-primary w-full"
        >
          {editTransaction ? 'Guardar cambios' : `Registrar ${selectedType.icon} ${selectedType.label.toLowerCase()}`}
        </button>
      </div>
    </Sheet>
  );
}
