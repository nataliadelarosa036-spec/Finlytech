import type { Category, Account, User } from '@/types';

export const defaultUser: User = {
  id: '',
  name: 'Usuario',
  email: '',
  currency: 'COP',
  locale: 'es-CO',
  avatarColor: '#D4AF37',
  mode: 'simple',
  monthlyIncomeGoal: 0,
};

export const defaultCategories: Category[] = [
  { id: 'c1', name: 'Alimentación', icon: '🍔', color: '#f97316', kind: 'expense' },
  { id: 'c2', name: 'Domicilios', icon: '🛵', color: '#fb923c', kind: 'expense' },
  { id: 'c3', name: 'Transporte', icon: '🚗', color: '#3b82f6', kind: 'expense' },
  { id: 'c4', name: 'Vivienda', icon: '🏠', color: '#8b5cf6', kind: 'expense' },
  { id: 'c5', name: 'Servicios', icon: '📱', color: '#06b6d4', kind: 'expense' },
  { id: 'c6', name: 'Entretenimiento', icon: '🎬', color: '#ec4899', kind: 'expense' },
  { id: 'c7', name: 'Salud', icon: '💊', color: '#ef4444', kind: 'expense' },
  { id: 'c8', name: 'Educación', icon: '📚', color: '#14b8a6', kind: 'expense' },
  { id: 'c9', name: 'Ropa', icon: '👕', color: '#a855f7', kind: 'expense' },
  { id: 'c10', name: 'Restaurantes', icon: '🍽️', color: '#f59e0b', kind: 'expense' },
  { id: 'c11', name: 'Salario', icon: '💰', color: '#10b981', kind: 'income' },
  { id: 'c12', name: 'Freelance', icon: '💻', color: '#059669', kind: 'income' },
  { id: 'c13', name: 'Inversiones', icon: '📈', color: '#047857', kind: 'income' },
  { id: 'c14', name: 'Ahorro', icon: '🐷', color: '#065f46', kind: 'income' },
];

export const defaultAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Cuenta Principal',
    type: 'checking',
    balance: 0,
    institution: 'Mi Banco',
    color: '#D4AF37',
    includedInNetWorth: true,
  },
];
