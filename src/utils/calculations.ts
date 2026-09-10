import type {
  Transaction,
  Budget,
  Goal,
  Debt,
  Account,
  Subscription,
  Investment,
  HealthScore,
  Scenario,
  ScenarioResult,
  AffordabilityVerdict,
  DashboardData,
  Insight,
  NetWorthPoint,
  CashFlowPoint,
} from '@/types';
import { monthsUntil, clamp } from './format';

export function getAvailableToSpend(
  accounts: Account[],
  monthlyIncome: number,
  monthlyExpenses: number,
  monthlySavings: number,
  monthlyDebtPayments: number,
): number {
  const totalBalance = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((sum, a) => sum + a.balance, 0);
  const reservedForGoals = monthlySavings;
  const reservedForDebts = monthlyDebtPayments;
  const alreadySpent = monthlyExpenses;
  const available = totalBalance - reservedForGoals - reservedForDebts - alreadySpent + monthlyIncome;
  return Math.max(0, available);
}

export function getDailyAllowance(availableToSpend: number): number {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysLeft = Math.max(1, endOfMonth.getDate() - now.getDate() + 1);
  return Math.round(availableToSpend / daysLeft);
}

export function getMonthlyIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlyExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getMonthlySavings(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.max(0, ((income - expenses) / income) * 100);
}

export function getSpendingByCategory(transactions: Transaction[]): { category: Transaction['category']; amount: number }[] {
  const map = new Map<string, { category: Transaction['category']; amount: number }>();
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const existing = map.get(t.category.id);
      if (existing) {
        existing.amount += t.amount;
      } else {
        map.set(t.category.id, { category: t.category, amount: t.amount });
      }
    });
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

export function getUpcomingTransactions(transactions: Transaction[], limit = 3): Transaction[] {
  const now = new Date();
  return transactions
    .filter((t) => new Date(t.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

export function getNetWorth(accounts: Account[], debts: Debt[]): number {
  const assets = accounts
    .filter((a) => a.includedInNetWorth)
    .reduce((sum, a) => sum + a.balance, 0);
  const liabilities = debts.reduce((sum, d) => sum + d.balance, 0);
  return assets - liabilities;
}

export function getTotalAssets(accounts: Account[]): number {
  return accounts.filter((a) => a.includedInNetWorth).reduce((sum, a) => sum + a.balance, 0);
}

export function getTotalLiabilities(debts: Debt[]): number {
  return debts.reduce((sum, d) => sum + d.balance, 0);
}

export function getGoalProgress(goal: Goal): number {
  if (goal.target <= 0) return 100;
  return clamp((goal.current / goal.target) * 100, 0, 100);
}

export function getGoalRemaining(goal: Goal): number {
  return Math.max(0, goal.target - goal.current);
}

export function getGoalEstimatedDate(goal: Goal): string {
  const remaining = getGoalRemaining(goal);
  if (remaining <= 0) return 'Meta alcanzada';
  const monthly = goal.monthlyContribution > 0 ? goal.monthlyContribution : 100000;
  const months = Math.ceil(remaining / monthly);
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

export function getBudgetProgress(budget: Budget): number {
  if (budget.limit <= 0) return 0;
  return clamp((budget.spent / budget.limit) * 100, 0, 100);
}

export function getBudgetRemaining(budget: Budget): number {
  return Math.max(0, budget.limit - budget.spent);
}

export function getTotalSubscriptionsMonthly(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.period === 'monthly' ? s.amount : s.amount / 12), 0);
}

export function getTotalSubscriptionsYearly(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (s.period === 'monthly' ? s.amount * 12 : s.amount), 0);
}

export function getInvestmentTotal(investments: Investment[]): { invested: number; current: number; returnPct: number } {
  const invested = investments.reduce((s, i) => s + i.invested, 0);
  const current = investments.reduce((s, i) => s + i.currentValue, 0);
  const returnPct = invested > 0 ? ((current - invested) / invested) * 100 : 0;
  return { invested, current, returnPct };
}

export function getDebtSnowballOrder(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => a.balance - b.balance);
}

export function getDebtAvalancheOrder(debts: Debt[]): Debt[] {
  return [...debts].sort((a, b) => b.interestRate - a.interestRate);
}

export function getDebtFreeMonths(debts: Debt[], extraPayment = 0): number {
  let totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const totalMonthly = debts.reduce((s, d) => s + d.minPayment, 0) + extraPayment;
  if (totalMonthly <= 0) return 0;
  return Math.ceil(totalBalance / totalMonthly);
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  if (score >= 20) return 'Atención';
  return 'Crítico';
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#14b8a6';
  if (score >= 40) return '#f59e0b';
  if (score >= 20) return '#fb923c';
  return '#ef4444';
}

export function calculateHealthScore(
  accounts: Account[],
  transactions: Transaction[],
  goals: Goal[],
  debts: Debt[],
  budgets: Budget[] = []
): HealthScore {
  const income = getMonthlyIncome(transactions);
  const expenses = getMonthlyExpenses(transactions);
  const totalBalance = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);

  // 1. Ahorro (0-100)
  const savingsRate = getSavingsRate(income, expenses);
  const savingsScore = income > 0 ? clamp(Math.round((savingsRate / 20) * 100), 10, 100) : 50;

  // 2. Liquidez (0-100)
  const monthlyBurn = expenses > 0 ? expenses : (income > 0 ? income : 1);
  const monthsOfRunway = totalBalance / monthlyBurn;
  const liquidityScore = clamp(Math.round((monthsOfRunway / 3) * 100), 10, 100);

  // 3. Deudas (0-100)
  const annualIncome = (income > 0 ? income : 1) * 12;
  const debtRatio = totalDebt / annualIncome;
  const debtsScore = totalDebt === 0 ? 100 : clamp(Math.round((1 - debtRatio / 0.5) * 100), 10, 100);

  // 4. Presupuesto (0-100)
  let budgetScore = 80;
  if (budgets.length > 0) {
    const overBudgetCount = budgets.filter(b => b.spent > b.limit).length;
    budgetScore = clamp(100 - (overBudgetCount / budgets.length) * 50, 20, 100);
  }

  // 5. Metas (0-100)
  let goalsScore = 70;
  if (goals.length > 0) {
    const avgProgress = goals.reduce((s, g) => s + getGoalProgress(g), 0) / goals.length;
    goalsScore = clamp(Math.round(avgProgress), 20, 100);
  }

  // 6. Patrones (0-100)
  const patternsScore = expenses <= income ? 85 : clamp(Math.round((income / (expenses || 1)) * 80), 20, 95);

  const breakdown = {
    savings: savingsScore,
    liquidity: liquidityScore,
    debts: debtsScore,
    budget: Math.round(budgetScore),
    goals: goalsScore,
    patterns: patternsScore,
  };

  const total = Math.round(
    (breakdown.savings * 0.25) +
    (breakdown.liquidity * 0.20) +
    (breakdown.debts * 0.20) +
    (breakdown.budget * 0.15) +
    (breakdown.goals * 0.10) +
    (breakdown.patterns * 0.10)
  );

  const label = getHealthScoreLabel(total);

  const tips: string[] = [];
  if (savingsRate < 15) tips.push('Intenta ahorrar al menos el 15% de tus ingresos mensuales.');
  if (monthsOfRunway < 3) tips.push('Construye un fondo de emergencia que cubra entre 3 y 6 meses de gastos.');
  if (totalDebt > 0) tips.push('Prioriza pagar las deudas con mayor tasa de interés.');
  if (tips.length === 0) tips.push('¡Excelente disciplina financiera! Mantén tus hábitos de control y ahorro.');

  return { total, label, breakdown, tips };
}

export function generateInsights(
  transactions: Transaction[],
  accounts: Account[],
  goals: Goal[],
  debts: Debt[],
  subscriptions: Subscription[] = []
): Insight[] {
  const insights: Insight[] = [];
  const income = getMonthlyIncome(transactions);
  const expenses = getMonthlyExpenses(transactions);
  const savingsRate = getSavingsRate(income, expenses);
  const byCategory = getSpendingByCategory(transactions);

  if (transactions.length === 0) {
    return [
      {
        id: 'in-welcome',
        type: 'info',
        title: '¡Bienvenido a Finlytech!',
        body: 'Registra tus primeros movimientos para activar análisis financieros personalizados y recomendaciones automáticas.',
        cta: 'Registrar movimiento',
        action: 'money',
      },
      {
        id: 'in-goals',
        type: 'tip',
        title: 'Define tus metas financieras',
        body: 'Establecer metas con montos y fechas claras te ayuda a mantener el enfoque en tus objetivos.',
        cta: 'Crear meta',
        action: 'wealth/goals',
      }
    ];
  }

  if (savingsRate >= 20) {
    insights.push({
      id: 'in-savings-good',
      type: 'positive',
      title: 'Tasa de ahorro saludable',
      body: `Estás ahorrando el ${savingsRate.toFixed(0)}% de tus ingresos. Mantén este ritmo para acelerar el cumplimiento de tus metas.`,
      cta: 'Ver metas',
      action: 'wealth/goals',
    });
  } else if (savingsRate < 10 && income > 0) {
    insights.push({
      id: 'in-savings-low',
      type: 'warning',
      title: 'Tasa de ahorro baja',
      body: `Tu tasa de ahorro es del ${Math.max(0, savingsRate).toFixed(0)}%. Te sugerimos revisar tus mayores categorías de gasto.`,
      cta: 'Revisar movimientos',
      action: 'money',
    });
  }

  if (byCategory.length > 0) {
    const topCat = byCategory[0];
    insights.push({
      id: 'in-top-category',
      type: 'info',
      title: `Mayor gasto: ${topCat.category.name}`,
      body: `Tu principal egreso este mes es ${topCat.category.name} con ${formatCurrency(topCat.amount)}.`,
      cta: 'Ver movimientos',
      action: 'money',
    });
  }

  if (debts.length > 0) {
    const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
    insights.push({
      id: 'in-debts',
      type: 'warning',
      title: 'Plan de pago de deudas',
      body: `Tienes un saldo total de deuda de ${formatCurrency(totalDebt)}. Explora los métodos Bola de Nieve o Avalancha.`,
      cta: 'Ver deudas',
      action: 'wealth/debts',
    });
  }

  return insights;
}

export function generateNetWorthHistory(accounts: Account[], debts: Debt[]): NetWorthPoint[] {
  const currentAssets = getTotalAssets(accounts);
  const currentDebts = getTotalLiabilities(debts);
  const currentNet = currentAssets - currentDebts;

  const now = new Date();
  const points: NetWorthPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const factor = (6 - i) / 6;
    const assets = Math.round(currentAssets * factor);
    const liabilities = Math.round(currentDebts * factor);
    points.push({
      date: dateKey,
      assets,
      liabilities,
      net: assets - liabilities,
    });
  }

  return points;
}

export function simulateScenario(
  scenario: Scenario,
  context: {
    availableToSpend: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    netWorth: number;
    goals: Goal[];
    debts: Debt[];
  },
): ScenarioResult {
  const { amount, months } = scenario;
  const monthlyImpact = amount / Math.max(1, months);

  let currentNetWorth = context.netWorth;
  let simulatedNetWorth = context.netWorth;
  let currentSavings = context.monthlySavings * months;
  let simulatedSavings = context.monthlySavings * months;
  const projection: { month: number; current: number; simulated: number }[] = [];

  for (let m = 0; m <= months; m++) {
    const current = currentNetWorth + context.monthlySavings * m;
    const simulated = simulatedNetWorth + (context.monthlySavings - monthlyImpact) * m;
    projection.push({ month: m, current, simulated });
  }

  if (scenario.type === 'purchase' || scenario.type === 'save_more' || scenario.type === 'pay_debt') {
    simulatedNetWorth -= amount;
    simulatedSavings -= amount;
  }

  let verdict: AffordabilityVerdict = 'green';
  let reason = '';
  const goalImpact: { goalId: string; delayMonths: number }[] = [];

  if (scenario.type === 'purchase') {
    if (amount > context.availableToSpend * 1.5) {
      verdict = 'red';
      reason = 'Esta compra supera significativamente tu dinero disponible. Realizarla podría poner en riesgo tus compromisos financieros.';
    } else if (amount > context.availableToSpend) {
      verdict = 'yellow';
      reason = 'Puedes realizarla, pero reducirá tu liquidez para el resto del mes y podría retrasar tus metas.';
      context.goals.forEach((g) => {
        const delay = Math.ceil(amount / (g.monthlyContribution || 100000) / Math.max(1, context.goals.length));
        goalImpact.push({ goalId: g.id, delayMonths: delay });
      });
    } else {
      verdict = 'green';
      reason = 'Tienes suficiente dinero disponible para esta compra sin afectar tus metas ni tu liquidez.';
    }
  } else if (scenario.type === 'save_more') {
    verdict = 'green';
    reason = `Aportando ${formatCurrency(amount)} extra, mejorarás tu ahorro y alcanzarás tus metas más rápido.`;
    simulatedSavings += amount;
  } else if (scenario.type === 'pay_debt') {
    verdict = 'green';
    reason = `Pagar ${formatCurrency(amount)} de deuda reducirá tus intereses y mejorará tu estabilidad financiera.`;
  } else {
    verdict = 'green';
    reason = 'El escenario simulado muestra un impacto manejable en tu patrimonio.';
  }

  const summary = verdict === 'green'
    ? 'Tu situación financiera se mantiene saludable.'
    : verdict === 'yellow'
      ? 'Hay impacto en tu liquidez, pero es manejable.'
      : 'Esta decisión podría comprometer tu estabilidad.';

  return {
    currentNetWorth,
    simulatedNetWorth,
    currentSavings,
    simulatedSavings,
    goalImpact,
    projection,
    summary,
    verdict,
    reason,
  };
}

export function checkAffordability(
  amount: number,
  context: { availableToSpend: number; monthlyIncome: number; monthlyExpenses: number; goals: Goal[]; debts: Debt[] },
): { verdict: AffordabilityVerdict; reason: string; impact: string } {
  const { availableToSpend, monthlyIncome, monthlyExpenses, goals } = context;
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  if (amount > (availableToSpend > 0 ? availableToSpend * 2 : 1000000) || (monthlyIncome > 0 && amount > monthlyIncome * 2)) {
    return {
      verdict: 'red',
      reason: 'Esta compra supera por mucho tu dinero disponible actual. Realizarla podría comprometer tu estabilidad financiera.',
      impact: `Te faltarían ${formatCurrency(Math.max(0, amount - availableToSpend))} para cubrirla cómodamente.`,
    };
  }

  if (amount > availableToSpend) {
    const affectedGoal = goals[0];
    const delayMonths = Math.ceil((amount - availableToSpend) / (affectedGoal?.monthlyContribution || 100000));
    return {
      verdict: 'yellow',
      reason: `Puedes comprarlo, pero tendrías que ajustar otros gastos o retrasar tus metas de ahorro aproximadamente ${delayMonths} meses.`,
      impact: 'Tu liquidez disponible quedará reducida temporalmente.',
    };
  }

  if (savingsRate < 10 && monthlyIncome > 0) {
    return {
      verdict: 'yellow',
      reason: 'Aunque cuentas con el dinero, tu tasa de ahorro es baja este mes. Considera si es un gasto indispensable.',
      impact: 'Tu flujo de caja quedará ajustado el resto del mes.',
    };
  }

  return {
    verdict: 'green',
    reason: 'Tienes suficiente dinero disponible para esta compra sin afectar tus metas ni tus pagos pendientes.',
    impact: 'Tu salud financiera y liquidez se mantienen estables.',
  };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildDashboardData(
  user: any,
  accounts: Account[],
  transactions: Transaction[],
  goals: Goal[],
  debts: Debt[],
  budgets: Budget[] = [],
  subscriptions: Subscription[] = []
): DashboardData {
  const monthlyIncome = getMonthlyIncome(transactions);
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const monthlySavings = getMonthlySavings(transactions);
  const monthlyDebtPayments = debts.reduce((s, d) => s + d.minPayment, 0);
  const availableToSpend = getAvailableToSpend(accounts, monthlyIncome, monthlyExpenses, monthlySavings, monthlyDebtPayments);
  const dailyAllowance = getDailyAllowance(availableToSpend);
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpenses);
  const netWorth = getNetWorth(accounts, debts);
  const upcoming = getUpcomingTransactions(transactions);
  const spendingByCategory = getSpendingByCategory(transactions).slice(0, 5);

  const nextIncome = upcoming.find((t) => t.type === 'income') || null;
  const nextPayment = upcoming.find((t) => t.type === 'expense' || t.type === 'payment' || t.type === 'debt') || null;

  const healthScore = calculateHealthScore(accounts, transactions, goals, debts, budgets);
  const insights = generateInsights(transactions, accounts, goals, debts, subscriptions);
  const topInsight = insights[0];

  const alerts: Insight[] = [];
  if (nextPayment) {
    alerts.push({
      id: 'alert-1',
      type: 'warning',
      title: 'Pago próximo',
      body: `Tu pago de ${formatCurrency(nextPayment.amount)} vence ${formatRelativeDateLocal(nextPayment.date)}.`,
    });
  }

  if (availableToSpend < monthlyExpenses * 0.2 && monthlyExpenses > 0) {
    alerts.push({
      id: 'alert-2',
      type: 'info',
      title: 'Flujo de caja ajustado',
      body: 'Tu disponible para gastar está en un nivel bajo. Considera postergar gastos discrecionales.',
    });
  }

  const cashFlow = buildCashFlow(transactions);

  return {
    user,
    availableToSpend,
    dailyAllowance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    healthScore,
    upcomingTransactions: upcoming,
    topInsight,
    goals,
    spendingByCategory,
    netWorth,
    nextIncome,
    nextPayment,
    alerts,
    cashFlow,
  };
}

function formatRelativeDateLocal(date: string): string {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(d);
}

export function buildCashFlow(transactions: Transaction[]): CashFlowPoint[] {
  const points: CashFlowPoint[] = [];
  const now = new Date();
  let runningBalance = 0;

  for (let i = -2; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayKey = d.toISOString().slice(0, 10);
    const dayTx = transactions.filter((t) => t.date && t.date.slice(0, 10) === dayKey);
    const inflow = dayTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const outflow = dayTx.filter((t) => t.type === 'expense' || t.type === 'debt' || t.type === 'payment').reduce((s, t) => s + t.amount, 0);
    runningBalance += inflow - outflow;
    points.push({
      date: dayKey,
      label: i === 0 ? 'Hoy' : new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(d),
      inflow,
      outflow,
      balance: runningBalance,
    });
  }
  return points;
}

export function getCardUtilization(card: { limit: number; balance: number }): number {
  if (card.limit === 0) return 0;
  return clamp((card.balance / card.limit) * 100, 0, 100);
}

export function getCardAvailable(card: { limit: number; balance: number }): number {
  return Math.max(0, card.limit - card.balance);
}

export function getCardMinPayment(card: { balance: number }, minPct = 5): number {
  return Math.round(card.balance * (minPct / 100));
}

export function projectCardPayoff(balance: number, interestRate: number, monthlyPayment: number): { months: number; totalInterest: number } {
  let remaining = balance;
  let totalInterest = 0;
  let months = 0;
  // Convertir EA a tasa mensual efectiva: (1 + EA)^(1/12) - 1
  const monthlyRate = Math.pow(1 + interestRate / 100, 1 / 12) - 1;
  if (monthlyRate <= 0) {
    // Sin interés — pago lineal
    return { months: Math.ceil(balance / Math.max(monthlyPayment, 1)), totalInterest: 0 };
  }
  while (remaining > 0.01 && months < 600) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining = remaining + interest - monthlyPayment;
    months++;
    if (monthlyPayment <= interest + 0.01) break; // pago no cubre interés
  }
  return { months, totalInterest: Math.round(totalInterest) };
}

export function simulateDebtPayoff(
  debts: Debt[],
  extraPayment: number,
  strategy: 'snowball' | 'avalanche',
): { months: number; totalInterest: number; order: Debt[]; perDebt: { id: string; months: number; interest: number }[] } {
  const ordered = strategy === 'snowball' ? getDebtSnowballOrder(debts) : getDebtAvalancheOrder(debts);
  let totalMonths = 0;
  let totalInterest = 0;
  const perDebt: { id: string; months: number; interest: number }[] = [];

  for (const debt of ordered) {
    const payment = debt.minPayment + (ordered.indexOf(debt) === 0 ? extraPayment : 0);
    const { months, totalInterest: interest } = projectCardPayoff(debt.balance, debt.interestRate, payment);
    totalMonths = Math.max(totalMonths, months);
    totalInterest += interest;
    perDebt.push({ id: debt.id, months, interest });
  }

  return { months: totalMonths, totalInterest, order: ordered, perDebt };
}

// ─── Amortization schedule ────────────────────────────────────────────────────
export interface AmortizationRow {
  period: number;
  date: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
  isQuincena: boolean;
  quincenaLabel: string;
}

export function buildAmortizationSchedule(
  balance: number,
  interestRateEA: number,
  monthlyPayment: number,
  dueDay: number, // day of month (1-31); 15 = quincena
  maxPeriods = 60,
): AmortizationRow[] {
  const monthlyRate = Math.pow(1 + interestRateEA / 100, 1 / 12) - 1;
  let remaining = balance;
  const rows: AmortizationRow[] = [];
  const now = new Date();

  for (let i = 0; i < maxPeriods && remaining > 0.01; i++) {
    const payDate = new Date(now.getFullYear(), now.getMonth() + i + 1, dueDay);
    const interest = remaining * monthlyRate;
    const principal = Math.min(monthlyPayment - interest, remaining);
    remaining = Math.max(0, remaining - principal);

    const day = payDate.getDate();
    const isQuincena = day === 15 || day === 30 || day === 28;
    const quincenaLabel = day <= 15 ? 'Primera quincena' : 'Segunda quincena';

    rows.push({
      period: i + 1,
      date: payDate.toISOString().slice(0, 10),
      payment: Math.round(monthlyPayment),
      interest: Math.round(interest),
      principal: Math.round(principal),
      balance: Math.round(remaining),
      isQuincena,
      quincenaLabel,
    });

    if (principal <= 0) break;
  }
  return rows;
}

export function getNextPaymentDate(dueDay: number): { date: Date; isQuincena: boolean; label: string } {
  const now = new Date();
  let payDate = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (payDate <= now) {
    payDate = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }
  const day = payDate.getDate();
  const isQuincena = day === 15 || day === 30;
  return {
    date: payDate,
    isQuincena,
    label: isQuincena ? (day === 15 ? 'Primera quincena' : 'Segunda quincena') : '',
  };
}

export function getDaysUntilPayment(dueDay: number): number {
  const { date } = getNextPaymentDate(dueDay);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - now.getTime()) / 86400000);
}

export function getBudgetProjection(budget: Budget, daysIntoMonth: number, daysInMonth: number): number {
  if (daysIntoMonth === 0) return 0;
  const dailyRate = budget.spent / daysIntoMonth;
  return Math.round(dailyRate * daysInMonth);
}

export function getDaysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getDaysIntoMonth(): number {
  return new Date().getDate();
}

export function generateCSV(transactions: Transaction[]): string {
  const headers = ['Fecha', 'Tipo', 'Descripcion', 'Categoria', 'Cuenta', 'Monto'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString('es-CO'),
    t.type,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category?.name || 'General',
    t.account?.name || 'Principal',
    String(t.amount),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function generateMonthlySummary(transactions: Transaction[], budgets: Budget[], goals: Goal[], debts: Debt[]): string {
  const income = getMonthlyIncome(transactions);
  const expenses = getMonthlyExpenses(transactions);
  const savings = getMonthlySavings(transactions);
  const savingsRate = getSavingsRate(income, expenses);
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const byCategory = getSpendingByCategory(transactions);

  let summary = `FINLYTECH — RESUMEN MENSUAL\n`;
  summary += `${new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}\n`;
  summary += `${'='.repeat(40)}\n\n`;
  summary += `INGRESOS:          ${formatCurrency(income)}\n`;
  summary += `GASTOS:            ${formatCurrency(expenses)}\n`;
  summary += `AHORRO:            ${formatCurrency(savings)}\n`;
  summary += `TASA DE AHORRO:    ${savingsRate.toFixed(1)}%\n`;
  summary += `DEUDA TOTAL:       ${formatCurrency(totalDebt)}\n\n`;
  summary += `GASTOS POR CATEGORÍA:\n`;
  byCategory.forEach((c) => {
    summary += `  ${c.category.icon} ${c.category.name}: ${formatCurrency(c.amount)}\n`;
  });
  summary += `\nPRESUPUESTOS:\n`;
  budgets.forEach((b) => {
    const pct = b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(0) : '0';
    summary += `  ${b.category.name}: ${formatCurrency(b.spent)}/${formatCurrency(b.limit)} (${pct}%)\n`;
  });
  summary += `\nMETAS:\n`;
  goals.forEach((g) => {
    const pct = g.target > 0 ? ((g.current / g.target) * 100).toFixed(0) : '0';
    summary += `  ${g.emoji} ${g.name}: ${formatCurrency(g.current)}/${formatCurrency(g.target)} (${pct}%)\n`;
  });
  return summary;
}
