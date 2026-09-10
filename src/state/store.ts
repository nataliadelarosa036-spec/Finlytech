import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Account,
  Transaction,
  Budget,
  Goal,
  Debt,
  Card,
  Subscription,
  Investment,
  Insight,
  AppNotification,
  HealthScore,
  NetWorthPoint,
  AutoRule,
  CardStatement,
  Category,
} from '@/types';
import { defaultUser, defaultCategories, defaultAccounts } from '@/data/defaultCategories';
import { uid } from '@/utils/format';

interface AppState {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  cards: Card[];
  subscriptions: Subscription[];
  investments: Investment[];
  notifications: AppNotification[];
  categories: Category[];
  autoRules: AutoRule[];
  cardStatements: CardStatement[];
  darkMode: boolean;

  // Persisted preferences
  notifPrefs: {
    upcomingPayments: boolean;
    goalProgress: boolean;
    unusualSpending: boolean;
    weeklyReport: boolean;
    budgetAlerts: boolean;
  };
  a11yPrefs: {
    largeText: boolean;
    reduceMotion: boolean;
    highContrast: boolean;
  };

  // actions
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  setUser: (user: Partial<User>) => void;
  syncWithAuthUser: (authUser: { id: string; name: string; email: string; avatarColor?: string; mode?: 'simple' | 'advanced' } | null) => void;
  setMode: (mode: 'simple' | 'advanced') => void;
  setNotifPrefs: (prefs: Partial<AppState['notifPrefs']>) => void;
  setA11yPrefs: (prefs: Partial<AppState['a11yPrefs']>) => void;

  // Accounts
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Goals
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // Debts
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Cards
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  payCard: (cardId: string, amount: number) => void;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  cancelSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;

  // Investments
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, updates: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'date'>) => void;

  // Auto rules
  addAutoRule: (rule: Omit<AutoRule, 'id'>) => void;
  toggleAutoRule: (id: string) => void;
  deleteAutoRule: (id: string) => void;

  // Reset
  resetStore: () => void;
}

const initialData = {
  user: defaultUser,
  accounts: defaultAccounts,
  transactions: [] as Transaction[],
  budgets: [] as Budget[],
  goals: [] as Goal[],
  debts: [] as Debt[],
  cards: [] as Card[],
  subscriptions: [] as Subscription[],
  investments: [] as Investment[],
  notifications: [] as AppNotification[],
  categories: defaultCategories,
  autoRules: [] as AutoRule[],
  cardStatements: [] as CardStatement[],
  darkMode: false,
  notifPrefs: {
    upcomingPayments: true,
    goalProgress: true,
    unusualSpending: true,
    weeklyReport: false,
    budgetAlerts: true,
  },
  a11yPrefs: {
    largeText: false,
    reduceMotion: false,
    highContrast: false,
  },
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialData,

      setDarkMode: (value) => set({ darkMode: value }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      setUser: (userUpdates) =>
        set((s) => ({
          user: { ...s.user, ...userUpdates },
        })),

      syncWithAuthUser: (authUser) =>
        set((s) => {
          if (!authUser) return { user: defaultUser };
          return {
            user: {
              ...s.user,
              id: authUser.id,
              name: authUser.name || s.user.name,
              email: authUser.email || s.user.email,
              avatarColor: authUser.avatarColor || s.user.avatarColor || '#D4AF37',
              mode: authUser.mode || s.user.mode || 'simple',
            },
          };
        }),

      setMode: (mode) => set((s) => ({ user: { ...s.user, mode } })),

      setNotifPrefs: (prefs) =>
        set((s) => ({ notifPrefs: { ...s.notifPrefs, ...prefs } })),

      setA11yPrefs: (prefs) =>
        set((s) => {
          const next = { ...s.a11yPrefs, ...prefs };
          // Apply large text immediately
          document.documentElement.style.fontSize = next.largeText ? '17px' : '';
          // Apply high contrast
          next.highContrast
            ? document.documentElement.classList.add('high-contrast')
            : document.documentElement.classList.remove('high-contrast');
          return { a11yPrefs: next };
        }),

      // ── Accounts ──────────────────────────────────────────────────────────
      addAccount: (account) =>
        set((s) => ({
          accounts: [...s.accounts, { ...account, id: uid() }],
        })),

      updateAccount: (id, updates) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
        })),

      // ── Transactions ──────────────────────────────────────────────────────
      addTransaction: (tx) =>
        set((s) => {
          const newTx = { ...tx, id: uid() };

          // 1. Update account balance
          const updatedAccounts = s.accounts.map((acc) => {
            if (acc.id !== tx.account.id) return acc;
            const delta =
              tx.type === 'income' ? tx.amount :
                tx.type === 'expense' ? -tx.amount :
                  tx.type === 'saving' ? -tx.amount :
                    tx.type === 'investment' ? -tx.amount : -tx.amount;
            return { ...acc, balance: Math.max(0, acc.balance + delta) };
          });

          // 2. Auto-update budget.spent for expense transactions
          const updatedBudgets = tx.type === 'expense'
            ? s.budgets.map((b) =>
              b.category.id === tx.category.id
                ? { ...b, spent: b.spent + tx.amount }
                : b
            )
            : s.budgets;

          // 3. Check budget alerts (>80% and >100%)
          const newNotifications = [...s.notifications];
          if (tx.type === 'expense') {
            const matchingBudget = updatedBudgets.find((b) => b.category.id === tx.category.id);
            if (matchingBudget) {
              const pct = matchingBudget.limit > 0
                ? (matchingBudget.spent / matchingBudget.limit) * 100
                : 0;
              const alreadyAlerted80 = s.notifications.some(
                (n) => n.id.startsWith(`budget-80-${matchingBudget.id}`)
              );
              const alreadyAlerted100 = s.notifications.some(
                (n) => n.id.startsWith(`budget-100-${matchingBudget.id}`)
              );
              if (pct >= 100 && !alreadyAlerted100) {
                newNotifications.unshift({
                  id: `budget-100-${matchingBudget.id}-${Date.now()}`,
                  title: `Presupuesto superado: ${matchingBudget.category.name}`,
                  body: `Excediste tu presupuesto de ${matchingBudget.category.name} este mes.`,
                  date: new Date().toISOString(),
                  read: false,
                  icon: '⚠️',
                });
              } else if (pct >= 80 && !alreadyAlerted80) {
                newNotifications.unshift({
                  id: `budget-80-${matchingBudget.id}-${Date.now()}`,
                  title: `Alerta presupuesto: ${matchingBudget.category.name}`,
                  body: `Llevas el ${Math.round(pct)}% de tu presupuesto de ${matchingBudget.category.name}.`,
                  date: new Date().toISOString(),
                  read: false,
                  icon: '📊',
                });
              }
            }
          }

          // 4. Apply matching auto-rules
          let finalTx = { ...newTx };
          const activeRules = s.autoRules.filter((r) => r.active);
          for (const rule of activeRules) {
            const desc = tx.description.toLowerCase();
            const match =
              rule.matchMode === 'contains' ? desc.includes(rule.description.toLowerCase()) :
                rule.matchMode === 'startsWith' ? desc.startsWith(rule.description.toLowerCase()) :
                  desc === rule.description.toLowerCase();
            if (match) {
              const ruleCategory = s.categories.find((c) => c.id === rule.categoryId);
              const ruleAccount = s.accounts.find((a) => a.id === rule.accountId);
              if (ruleCategory) finalTx = { ...finalTx, category: ruleCategory };
              if (ruleAccount) finalTx = { ...finalTx, account: ruleAccount };
              break;
            }
          }

          return {
            transactions: [finalTx, ...s.transactions],
            accounts: updatedAccounts,
            budgets: updatedBudgets,
            notifications: newNotifications,
          };
        }),

      updateTransaction: (id, updates) =>
        set((s) => {
          const old = s.transactions.find((t) => t.id === id);
          // Reverse old budget.spent if it was an expense
          let updatedBudgets = s.budgets;
          if (old?.type === 'expense') {
            updatedBudgets = updatedBudgets.map((b) =>
              b.category.id === old.category.id
                ? { ...b, spent: Math.max(0, b.spent - old.amount) }
                : b
            );
          }
          const merged = { ...old, ...updates } as Transaction;
          // Apply new budget.spent
          if (merged.type === 'expense') {
            updatedBudgets = updatedBudgets.map((b) =>
              b.category.id === merged.category.id
                ? { ...b, spent: b.spent + merged.amount }
                : b
            );
          }
          return {
            transactions: s.transactions.map((t) => (t.id === id ? merged : t)),
            budgets: updatedBudgets,
          };
        }),

      deleteTransaction: (id) =>
        set((s) => {
          const tx = s.transactions.find((t) => t.id === id);
          // Reverse budget.spent
          const updatedBudgets = tx?.type === 'expense'
            ? s.budgets.map((b) =>
              b.category.id === tx.category.id
                ? { ...b, spent: Math.max(0, b.spent - tx.amount) }
                : b
            )
            : s.budgets;
          // Reverse account balance
          const updatedAccounts = tx
            ? s.accounts.map((acc) => {
              if (acc.id !== tx.account.id) return acc;
              const delta =
                tx.type === 'income' ? -tx.amount :
                  tx.type === 'expense' ? tx.amount :
                    tx.type === 'saving' ? tx.amount :
                      tx.type === 'investment' ? tx.amount : tx.amount;
              return { ...acc, balance: Math.max(0, acc.balance + delta) };
            })
            : s.accounts;
          return {
            transactions: s.transactions.filter((t) => t.id !== id),
            budgets: updatedBudgets,
            accounts: updatedAccounts,
          };
        }),

      // ── Goals ─────────────────────────────────────────────────────────────
      addGoal: (goal) =>
        set((s) => ({
          goals: [...s.goals, { ...goal, id: uid() }],
        })),

      updateGoal: (id, updates) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (id) =>
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
        })),

      contributeToGoal: (id, amount) =>
        set((s) => {
          const goal = s.goals.find((g) => g.id === id);
          if (!goal) return {};
          const newCurrent = Math.min(goal.target, goal.current + amount);
          const isNowComplete = newCurrent >= goal.target && goal.current < goal.target;

          // Record as saving transaction
          const savingCat = s.categories.find((c) => c.kind === 'income' && c.name === 'Ahorro')
            ?? s.categories.find((c) => c.kind === 'income')
            ?? s.categories[0];
          const mainAcc = s.accounts[0];
          const newTx = mainAcc && savingCat ? [{
            id: uid(),
            type: 'saving' as const,
            amount,
            description: `Aporte a meta: ${goal.name}`,
            category: savingCat,
            account: mainAcc,
            date: new Date().toISOString(),
            note: `Meta: ${goal.name}`,
            recurring: false,
          }] : [];

          // Notification on goal completion
          const newNotifs = isNowComplete ? [{
            id: `goal-done-${id}-${Date.now()}`,
            title: `Meta alcanzada: ${goal.emoji} ${goal.name}`,
            body: `¡Felicitaciones! Lograste tu meta de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(goal.target)}.`,
            date: new Date().toISOString(),
            read: false,
            icon: '🎯',
          }] : [];

          return {
            goals: s.goals.map((g) => g.id === id ? { ...g, current: newCurrent } : g),
            transactions: [...newTx, ...s.transactions],
            notifications: [...newNotifs, ...s.notifications],
          };
        }),

      // ── Debts ─────────────────────────────────────────────────────────────
      addDebt: (debt) =>
        set((s) => ({
          debts: [...s.debts, { ...debt, id: uid() }],
        })),

      updateDebt: (id, updates) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      deleteDebt: (id) =>
        set((s) => ({
          debts: s.debts.filter((d) => d.id !== id),
        })),

      // ── Cards ─────────────────────────────────────────────────────────────
      addCard: (card) =>
        set((s) => ({
          cards: [...s.cards, { ...card, id: uid() }],
        })),

      updateCard: (id, updates) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCard: (id) =>
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
        })),

      payCard: (cardId, amount) =>
        set((s) => ({
          cards: s.cards.map((c) =>
            c.id === cardId ? { ...c, balance: Math.max(0, c.balance - amount) } : c,
          ),
        })),

      // ── Subscriptions ─────────────────────────────────────────────────────
      addSubscription: (sub) =>
        set((s) => ({
          subscriptions: [...s.subscriptions, { ...sub, id: uid() }],
        })),

      updateSubscription: (id, updates) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...updates } : sub)),
        })),

      cancelSubscription: (id) =>
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, active: false } : sub,
          ),
        })),

      deleteSubscription: (id) =>
        set((s) => ({
          subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
        })),

      // ── Investments ───────────────────────────────────────────────────────
      addInvestment: (inv) =>
        set((s) => ({
          investments: [...s.investments, { ...inv, id: uid() }],
        })),

      updateInvestment: (id, updates) =>
        set((s) => ({
          investments: s.investments.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)),
        })),

      deleteInvestment: (id) =>
        set((s) => ({
          investments: s.investments.filter((inv) => inv.id !== id),
        })),

      // ── Budgets ───────────────────────────────────────────────────────────
      addBudget: (budget) =>
        set((s) => ({
          budgets: [...s.budgets, { ...budget, id: uid() }],
        })),

      updateBudget: (id, updates) =>
        set((s) => ({
          budgets: s.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      deleteBudget: (id) =>
        set((s) => ({
          budgets: s.budgets.filter((b) => b.id !== id),
        })),

      // ── Notifications ─────────────────────────────────────────────────────
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      addNotification: (notification) =>
        set((s) => ({
          notifications: [
            {
              ...notification,
              id: uid(),
              date: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        })),

      // ── Auto Rules ────────────────────────────────────────────────────────
      addAutoRule: (rule) =>
        set((s) => ({
          autoRules: [...s.autoRules, { ...rule, id: uid() }],
        })),

      toggleAutoRule: (id) =>
        set((s) => ({
          autoRules: s.autoRules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
        })),

      deleteAutoRule: (id) =>
        set((s) => ({
          autoRules: s.autoRules.filter((r) => r.id !== id),
        })),

      // ── Reset ─────────────────────────────────────────────────────────────
      resetStore: () =>
        set({
          ...initialData,
        }),
    }),
    {
      name: 'finlytech_app_state',
      partialize: (s) => ({
        user: s.user,
        accounts: s.accounts,
        transactions: s.transactions,
        budgets: s.budgets,
        goals: s.goals,
        debts: s.debts,
        cards: s.cards,
        subscriptions: s.subscriptions,
        investments: s.investments,
        notifications: s.notifications,
        categories: s.categories,
        autoRules: s.autoRules,
        cardStatements: s.cardStatements,
        darkMode: s.darkMode,
        notifPrefs: s.notifPrefs,
        a11yPrefs: s.a11yPrefs,
      }),
    }
  )
);
