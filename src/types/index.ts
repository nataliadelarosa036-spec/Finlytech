export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'debt'
  | 'payment'
  | 'saving'
  | 'investment';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export type DebtStrategy = 'snowball' | 'avalanche';

export type AffordabilityVerdict = 'green' | 'yellow' | 'red';

export type InsightType = 'positive' | 'warning' | 'info' | 'tip';

export type ScenarioType =
  | 'purchase'
  | 'save_more'
  | 'pay_debt'
  | 'increase_saving'
  | 'custom';

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  locale: string;
  avatarColor: string;
  mode: 'simple' | 'advanced';
  monthlyIncomeGoal: number;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
  color: string;
  includedInNetWorth: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: 'income' | 'expense';
  parent?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: Category;
  account: Account;
  date: string;
  note?: string;
  recurring?: boolean;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  spent: number;
  period: 'monthly';
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  targetDate: string;
  monthlyContribution: number;
  color: string;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  interestRate: number;
  minPayment: number;
  dueDate: string;
  type: 'card' | 'loan' | 'other';
}

export interface Card {
  id: string;
  name: string;
  number: string;
  limit: number;
  balance: number;
  dueDate: string;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  period: 'monthly' | 'yearly';
  nextCharge: string;
  category: string;
  emoji: string;
  active: boolean;
  monthsUnused?: number;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  invested: number;
  currentValue: number;
  returnPct: number;
  dividends: number;
  emoji: string;
}

export interface NetWorthPoint {
  date: string;
  assets: number;
  liabilities: number;
  net: number;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  cta?: string;
  action?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  icon: string;
}

export interface Scenario {
  id: string;
  type: ScenarioType;
  label: string;
  amount: number;
  months: number;
}

export interface ScenarioResult {
  currentNetWorth: number;
  simulatedNetWorth: number;
  currentSavings: number;
  simulatedSavings: number;
  goalImpact: { goalId: string; delayMonths: number }[];
  projection: { month: number; current: number; simulated: number }[];
  summary: string;
  verdict: AffordabilityVerdict;
  reason: string;
}

export interface HealthScore {
  total: number;
  label: string;
  breakdown: {
    savings: number;
    liquidity: number;
    debts: number;
    budget: number;
    goals: number;
    patterns: number;
  };
  tips: string[];
}

export interface AutoRule {
  id: string;
  description: string;
  categoryId: string;
  accountId: string;
  type: TransactionType;
  matchMode: 'contains' | 'exact' | 'startsWith';
  active: boolean;
}

export interface CashFlowPoint {
  date: string;
  label: string;
  inflow: number;
  outflow: number;
  balance: number;
}

export interface CardStatement {
  cardId: string;
  cutoffDay: number;
  paymentDay: number;
  currentBalance: number;
  lastCutoff: string;
  nextCutoff: string;
  nextPayment: string;
  interestRate: number;
  minPaymentPct: number;
}

export interface DashboardData {
  user: User;
  availableToSpend: number;
  dailyAllowance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  healthScore: HealthScore;
  upcomingTransactions: Transaction[];
  topInsight: Insight;
  goals: Goal[];
  spendingByCategory: { category: Category; amount: number }[];
  netWorth: number;
  nextIncome: Transaction | null;
  nextPayment: Transaction | null;
  alerts: Insight[];
  cashFlow: CashFlowPoint[];
}
