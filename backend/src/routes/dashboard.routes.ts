import { Router, Response } from 'express';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function currentMonth(): string {
    return new Date().toISOString().slice(0, 7);
}

// GET /api/dashboard  — aggregate of all user data in one shot
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const month = currentMonth();

    try {
        const [
            [accounts], [transactions], [goals], [debts],
            [budgets], [subscriptions], [investments], [categories], [cards],
        ] = await Promise.all([
            pool.query<any[]>('SELECT * FROM accounts WHERE user_id=?', [userId]),
            pool.query<any[]>('SELECT * FROM transactions WHERE user_id=? ORDER BY date DESC LIMIT 500', [userId]),
            pool.query<any[]>('SELECT * FROM goals WHERE user_id=?', [userId]),
            pool.query<any[]>('SELECT * FROM debts WHERE user_id=?', [userId]),
            pool.query<any[]>(
                `SELECT b.* FROM budgets b WHERE b.user_id=? AND b.month=?`,
                [userId, month]
            ),
            pool.query<any[]>('SELECT * FROM subscriptions WHERE user_id=?', [userId]),
            pool.query<any[]>('SELECT * FROM investments WHERE user_id=?', [userId]),
            pool.query<any[]>('SELECT * FROM categories WHERE user_id=?', [userId]),
            pool.query<any[]>('SELECT * FROM cards WHERE user_id=?', [userId]),
        ]);

        res.json({
            success: true,
            data: {
                user: {
                    id: req.user!.id,
                    name: req.user!.name,
                    email: req.user!.email,
                    currency: req.user!.currency,
                    locale: req.user!.locale,
                    mode: req.user!.mode,
                    monthlyIncomeGoal: parseFloat(String(req.user!.monthly_income_goal ?? 0)),
                    avatarColor: req.user!.avatar_color,
                    avatarUrl: req.user!.avatar_url,
                },
                accounts: accounts.map(r => ({
                    id: r.id, name: r.name, type: r.type,
                    balance: parseFloat(r.balance), institution: r.institution,
                    color: r.color, includedInNetWorth: Boolean(r.included_in_net_worth),
                })),
                transactions: transactions.map(r => ({
                    id: r.id, type: r.type, amount: parseFloat(r.amount),
                    description: r.description, category: r.category_id, account: r.account_id,
                    date: r.date instanceof Date ? r.date.toISOString() : r.date,
                    note: r.note || undefined, recurring: Boolean(r.recurring),
                })),
                goals: goals.map(r => ({
                    id: r.id, name: r.name, emoji: r.emoji,
                    target: parseFloat(r.target_amount), current: parseFloat(r.current_amount),
                    targetDate: r.target_date instanceof Date
                        ? r.target_date.toISOString().split('T')[0]
                        : r.target_date,
                    monthlyContribution: parseFloat(r.monthly_contribution), color: r.color,
                })),
                debts: debts.map(r => ({
                    id: r.id, name: r.name, balance: parseFloat(r.balance),
                    originalBalance: parseFloat(r.original_balance),
                    interestRate: parseFloat(r.interest_rate),
                    minPayment: parseFloat(r.min_payment),
                    dueDate: r.due_date instanceof Date
                        ? r.due_date.toISOString().split('T')[0]
                        : r.due_date,
                    type: r.type,
                })),
                budgets: budgets.map(r => ({
                    id: r.id, category: r.category_id,
                    limit: parseFloat(r.amount_limit),
                    spent: parseFloat(r.spent), period: r.period, month: r.month,
                })),
                subscriptions: subscriptions.map(r => ({
                    id: r.id, name: r.name, amount: parseFloat(r.amount), period: r.period,
                    nextCharge: r.next_charge instanceof Date
                        ? r.next_charge.toISOString().split('T')[0]
                        : r.next_charge,
                    category: r.category, emoji: r.emoji,
                    active: Boolean(r.active), monthsUnused: r.months_unused ?? 0,
                })),
                investments: investments.map(r => ({
                    id: r.id, name: r.name, type: r.type,
                    invested: parseFloat(r.invested), currentValue: parseFloat(r.current_value),
                    returnPct: parseFloat(r.return_pct), dividends: parseFloat(r.dividends),
                    emoji: r.emoji,
                })),
                categories: categories.map(r => ({
                    id: r.id, name: r.name, icon: r.icon, color: r.color,
                    kind: r.kind, parent: r.parent_id || undefined,
                })),
                cards: cards.map(r => ({
                    id: r.id, name: r.name, number: r.number,
                    limit: parseFloat(r.card_limit), balance: parseFloat(r.balance),
                    dueDate: r.due_date instanceof Date
                        ? r.due_date.toISOString().split('T')[0]
                        : r.due_date,
                    color: r.color,
                })),
            },
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ success: false, error: 'Error cargando dashboard.' });
    }
});

export default router;
