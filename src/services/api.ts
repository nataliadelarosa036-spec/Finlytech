/**
 * services/api.ts
 *
 * All data now comes from the real backend.
 * After fetching, we hydrate the Zustand store so all existing
 * calculation utilities (calculations.ts) keep working unchanged.
 */
import { http } from './apiClient';
import { useStore } from '@/state/store';
import type {
  Transaction,
  Goal,
  Budget,
  Debt,
  Insight,
  Scenario,
  ScenarioResult,
  Subscription,
  Investment,
  Account,
  User,
  NetWorthPoint,
  HealthScore,
  Category,
  DashboardData,
  Card,
} from '@/types';
import {
  buildDashboardData,
  simulateScenario as simulateFn,
  checkAffordability,
  getMonthlyIncome,
  getMonthlyExpenses,
  getMonthlySavings,
  getAvailableToSpend,
  getNetWorth,
  calculateHealthScore,
  generateInsights,
  generateNetWorthHistory,
} from '@/utils/calculations';

// ─── Types from backend ───────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface DashboardPayload {
  user: {
    id: string; name: string; email: string; currency: string; locale: string;
    mode: 'simple' | 'advanced'; monthlyIncomeGoal: number; avatarColor: string; avatarUrl?: string;
  };
  accounts: Account[];
  transactions: Array<{
    id: string; type: string; amount: number; description: string;
    category: string; account: string; date: string; note?: string; recurring?: boolean;
  }>;
  goals: Goal[];
  debts: Debt[];
  budgets: Array<{ id: string; category: string; limit: number; spent: number; period: 'monthly'; month: string }>;
  subscriptions: Subscription[];
  investments: Investment[];
  categories: Category[];
  cards: Card[];
}

// ─── Helper: hydrate raw transactions with full objects ───────────────────────
function hydrateTransactions(
  raw: DashboardPayload['transactions'],
  categories: Category[],
  accounts: Account[],
): Transaction[] {
  const catMap = new Map(categories.map(c => [c.id, c]));
  const accMap = new Map(accounts.map(a => [a.id, a]));

  return raw.map(t => ({
    id: t.id,
    type: t.type as Transaction['type'],
    amount: t.amount,
    description: t.description,
    category: catMap.get(t.category) ?? { id: t.category, name: 'Sin categoría', icon: '❓', color: '#888', kind: 'expense' as const },
    account: accMap.get(t.account) ?? { id: t.account, name: 'Cuenta', type: 'checking' as const, balance: 0, institution: '', color: '#888', includedInNetWorth: true },
    date: t.date,
    note: t.note,
    recurring: t.recurring ?? false,
  }));
}

// ─── Helper: hydrate budgets with full category objects ───────────────────────
function hydrateBudgets(
  raw: DashboardPayload['budgets'],
  categories: Category[],
): Budget[] {
  const catMap = new Map(categories.map(c => [c.id, c]));
  return raw.map(b => ({
    id: b.id,
    category: catMap.get(b.category) ?? { id: b.category, name: 'Sin categoría', icon: '❓', color: '#888', kind: 'expense' as const },
    limit: b.limit,
    spent: b.spent,
    period: b.period,
  }));
}

// ─── Load all data from backend into the store ────────────────────────────────
export async function loadDashboard(): Promise<void> {
  const res = await http.get<ApiResponse<DashboardPayload>>('/api/dashboard');
  if (!res.success) throw new Error(res.error ?? 'Error cargando dashboard');

  const { user, accounts, transactions: rawTx, goals, debts, budgets: rawBudgets,
    subscriptions, investments, categories, cards } = res.data;

  const transactions = hydrateTransactions(rawTx, categories, accounts);
  const budgets = hydrateBudgets(rawBudgets, categories);

  const store = useStore.getState();
  store.setUser({
    id: user.id, name: user.name, email: user.email,
    currency: user.currency, locale: user.locale,
    mode: user.mode, monthlyIncomeGoal: user.monthlyIncomeGoal,
    avatarColor: user.avatarColor,
  });

  useStore.setState({
    accounts,
    transactions,
    goals,
    debts,
    budgets,
    subscriptions,
    investments,
    categories,
    cards: cards ?? [],
  });
}

// ─── getDashboard — computes from local store (after loadDashboard) ───────────
export async function getDashboard(): Promise<DashboardData> {
  await loadDashboard();
  const s = useStore.getState();
  return buildDashboardData(s.user, s.accounts, s.transactions, s.goals, s.debts, s.budgets, s.subscriptions);
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export async function getTransactions(): Promise<Transaction[]> {
  return useStore.getState().transactions;
}

export async function createTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const res = await http.post<ApiResponse<{ id: string }>>('/api/transactions', {
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    category: tx.category.id,
    account: tx.account.id,
    date: tx.date,
    note: tx.note,
    recurring: tx.recurring ?? false,
  });
  if (!res.success) throw new Error(res.error ?? 'Error creando transacción');

  const full: Transaction = { ...tx, id: res.data.id };
  useStore.getState().addTransaction(tx); // local update for instant UI
  // Refresh from server to get correct account balances
  await loadDashboard();
  return full;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  const existing = useStore.getState().transactions.find(t => t.id === id);
  if (!existing) return;

  const merged = { ...existing, ...updates };
  await http.put(`/api/transactions/${id}`, {
    type: merged.type,
    amount: merged.amount,
    description: merged.description,
    category: merged.category.id,
    account: merged.account.id,
    date: merged.date,
    note: merged.note,
    recurring: merged.recurring ?? false,
  });

  useStore.getState().updateTransaction(id, updates);
  await loadDashboard();
}

export async function deleteTransaction(id: string): Promise<void> {
  await http.delete(`/api/transactions/${id}`);
  useStore.getState().deleteTransaction(id);
  await loadDashboard();
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
export async function getAccounts(): Promise<Account[]> {
  const res = await http.get<ApiResponse<Account[]>>('/api/accounts');
  if (res.success) useStore.setState({ accounts: res.data });
  return useStore.getState().accounts;
}

export async function createAccount(account: Omit<Account, 'id'>): Promise<Account> {
  const res = await http.post<ApiResponse<Account>>('/api/accounts', account);
  if (!res.success) throw new Error(res.error ?? 'Error creando cuenta');
  await getAccounts();
  return res.data;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<void> {
  const existing = useStore.getState().accounts.find(a => a.id === id);
  if (!existing) return;
  await http.put(`/api/accounts/${id}`, { ...existing, ...updates });
  await getAccounts();
}

export async function deleteAccount(id: string): Promise<void> {
  await http.delete(`/api/accounts/${id}`);
  useStore.getState().deleteAccount(id);
}

// ─── Goals ────────────────────────────────────────────────────────────────────
export async function getGoals(): Promise<Goal[]> {
  const res = await http.get<ApiResponse<Goal[]>>('/api/goals');
  if (res.success) useStore.setState({ goals: res.data });
  return useStore.getState().goals;
}

export async function createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
  const res = await http.post<ApiResponse<Goal>>('/api/goals', goal);
  if (!res.success) throw new Error(res.error ?? 'Error creando meta');
  await getGoals();
  return res.data;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
  const existing = useStore.getState().goals.find(g => g.id === id);
  if (!existing) return;
  await http.put(`/api/goals/${id}`, { ...existing, ...updates });
  await getGoals();
}

export async function deleteGoal(id: string): Promise<void> {
  await http.delete(`/api/goals/${id}`);
  useStore.getState().deleteGoal(id);
}

export async function contributeToGoal(id: string, amount: number): Promise<void> {
  await http.patch(`/api/goals/${id}/contribute`, { amount });
  await getGoals();
}

// ─── Debts ────────────────────────────────────────────────────────────────────
export async function getDebts(): Promise<Debt[]> {
  const res = await http.get<ApiResponse<Debt[]>>('/api/debts');
  if (res.success) useStore.setState({ debts: res.data });
  return useStore.getState().debts;
}

export async function createDebt(debt: Omit<Debt, 'id'>): Promise<Debt> {
  const res = await http.post<ApiResponse<Debt>>('/api/debts', debt);
  if (!res.success) throw new Error(res.error ?? 'Error creando deuda');
  await getDebts();
  return res.data;
}

export async function updateDebt(id: string, updates: Partial<Debt>): Promise<void> {
  const existing = useStore.getState().debts.find(d => d.id === id);
  if (!existing) return;
  await http.put(`/api/debts/${id}`, { ...existing, ...updates });
  await getDebts();
}

export async function deleteDebt(id: string): Promise<void> {
  await http.delete(`/api/debts/${id}`);
  useStore.getState().deleteDebt(id);
}

// ─── Budgets ──────────────────────────────────────────────────────────────────
export async function getBudgets(): Promise<Budget[]> {
  const res = await http.get<ApiResponse<Array<{ id: string; category: string; limit: number; spent: number; period: 'monthly'; month: string }>>>('/api/budgets');
  if (res.success) {
    const cats = useStore.getState().categories;
    const budgets = hydrateBudgets(res.data, cats);
    useStore.setState({ budgets });
  }
  return useStore.getState().budgets;
}

export async function createBudget(budget: Omit<Budget, 'id'>): Promise<Budget> {
  const res = await http.post<ApiResponse<{ id: string }>>('/api/budgets', {
    category: budget.category.id,
    limit: budget.limit,
  });
  if (!res.success) throw new Error(res.error ?? 'Error creando presupuesto');
  await getBudgets();
  return { ...budget, id: res.data.id };
}

export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  if (updates.limit !== undefined) {
    await http.put(`/api/budgets/${id}`, { limit: updates.limit });
  }
  await getBudgets();
}

export async function deleteBudget(id: string): Promise<void> {
  await http.delete(`/api/budgets/${id}`);
  useStore.getState().deleteBudget(id);
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscriptions(): Promise<Subscription[]> {
  const res = await http.get<ApiResponse<Subscription[]>>('/api/subscriptions');
  if (res.success) useStore.setState({ subscriptions: res.data });
  return useStore.getState().subscriptions;
}

export async function createSubscription(sub: Omit<Subscription, 'id'>): Promise<Subscription> {
  const res = await http.post<ApiResponse<Subscription>>('/api/subscriptions', sub);
  if (!res.success) throw new Error(res.error ?? 'Error creando suscripción');
  await getSubscriptions();
  return res.data;
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
  const existing = useStore.getState().subscriptions.find(s => s.id === id);
  if (!existing) return;
  await http.put(`/api/subscriptions/${id}`, { ...existing, ...updates });
  await getSubscriptions();
}

export async function cancelSubscription(id: string): Promise<void> {
  await http.patch(`/api/subscriptions/${id}/toggle`);
  await getSubscriptions();
}

export async function deleteSubscription(id: string): Promise<void> {
  await http.delete(`/api/subscriptions/${id}`);
  useStore.getState().deleteSubscription(id);
}

// ─── Investments ──────────────────────────────────────────────────────────────
export async function getInvestments(): Promise<Investment[]> {
  const res = await http.get<ApiResponse<Investment[]>>('/api/investments');
  if (res.success) useStore.setState({ investments: res.data });
  return useStore.getState().investments;
}

export async function createInvestment(inv: Omit<Investment, 'id'>): Promise<Investment> {
  const res = await http.post<ApiResponse<Investment>>('/api/investments', inv);
  if (!res.success) throw new Error(res.error ?? 'Error creando inversión');
  await getInvestments();
  return res.data;
}

export async function updateInvestment(id: string, updates: Partial<Investment>): Promise<void> {
  const existing = useStore.getState().investments.find(i => i.id === id);
  if (!existing) return;
  await http.put(`/api/investments/${id}`, { ...existing, ...updates });
  await getInvestments();
}

export async function deleteInvestment(id: string): Promise<void> {
  await http.delete(`/api/investments/${id}`);
  useStore.getState().deleteInvestment(id);
}

// ─── User ─────────────────────────────────────────────────────────────────────
export async function getUser(): Promise<User> {
  const res = await http.get<ApiResponse<User>>('/api/user/profile');
  if (res.success) useStore.getState().setUser(res.data);
  return useStore.getState().user;
}

export async function updateUser(updates: Partial<User>): Promise<void> {
  await http.patch('/api/user/profile', updates);
  useStore.getState().setUser(updates);
}

// ─── Cards ────────────────────────────────────────────────────────────────────
export async function getCards(): Promise<Card[]> {
  const res = await http.get<ApiResponse<Card[]>>('/api/cards');
  if (res.success) useStore.setState({ cards: res.data });
  return useStore.getState().cards;
}

export async function createCard(card: Omit<Card, 'id'>): Promise<Card> {
  const res = await http.post<ApiResponse<Card>>('/api/cards', card);
  if (!res.success) throw new Error(res.error ?? 'Error creando tarjeta');
  await getCards();
  return res.data;
}

export async function updateCard(id: string, updates: Partial<Card>): Promise<void> {
  const existing = useStore.getState().cards.find(c => c.id === id);
  if (!existing) return;
  await http.put(`/api/cards/${id}`, { ...existing, ...updates });
  await getCards();
}

export async function payCard(cardId: string, amount: number): Promise<void> {
  await http.patch(`/api/cards/${cardId}/pay`, { amount });
  await getCards();
}

export async function deleteCard(id: string): Promise<void> {
  await http.delete(`/api/cards/${id}`);
  useStore.getState().deleteCard(id);
}

// ─── Computed (still local using calculations.ts) ─────────────────────────────
export async function getNetWorthHistory(): Promise<NetWorthPoint[]> {
  const s = useStore.getState();
  return generateNetWorthHistory(s.accounts, s.debts);
}

export async function getHealthScore(): Promise<HealthScore> {
  const s = useStore.getState();
  return calculateHealthScore(s.accounts, s.transactions, s.goals, s.debts, s.budgets);
}

export async function getInsights(): Promise<Insight[]> {
  const s = useStore.getState();
  return generateInsights(s.transactions, s.accounts, s.goals, s.debts, s.subscriptions);
}

export async function simulateScenario(scenario: Scenario): Promise<ScenarioResult> {
  const s = useStore.getState();
  const monthlyIncome = getMonthlyIncome(s.transactions);
  const monthlyExpenses = getMonthlyExpenses(s.transactions);
  const monthlySavings = getMonthlySavings(s.transactions);
  const netWorth = getNetWorth(s.accounts, s.debts);
  const monthlyDebtPayments = s.debts.reduce((sum, d) => sum + d.minPayment, 0);
  const availableToSpend = getAvailableToSpend(s.accounts, monthlyIncome, monthlyExpenses, monthlySavings, monthlyDebtPayments);
  return simulateFn(scenario, { availableToSpend, monthlyIncome, monthlyExpenses, monthlySavings, netWorth, goals: s.goals, debts: s.debts });
}

export async function checkAffordabilityQuery(amount: number): Promise<{ verdict: 'green' | 'yellow' | 'red'; reason: string; impact: string }> {
  const s = useStore.getState();
  const monthlyIncome = getMonthlyIncome(s.transactions);
  const monthlyExpenses = getMonthlyExpenses(s.transactions);
  const monthlySavings = getMonthlySavings(s.transactions);
  const monthlyDebtPayments = s.debts.reduce((sum, d) => sum + d.minPayment, 0);
  const availableToSpend = getAvailableToSpend(s.accounts, monthlyIncome, monthlyExpenses, monthlySavings, monthlyDebtPayments);
  return checkAffordability(amount, { availableToSpend, monthlyIncome, monthlyExpenses, goals: s.goals, debts: s.debts });
}
