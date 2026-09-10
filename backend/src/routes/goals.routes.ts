import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapGoal(row: any) {
    return {
        id: row.id,
        name: row.name,
        emoji: row.emoji,
        target: parseFloat(row.target_amount),
        current: parseFloat(row.current_amount),
        targetDate: row.target_date instanceof Date ? row.target_date.toISOString().split('T')[0] : row.target_date,
        monthlyContribution: parseFloat(row.monthly_contribution),
        color: row.color,
    };
}

const goalValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('emoji').optional().isString(),
    body('target').isFloat({ min: 1 }),
    body('current').optional().isFloat({ min: 0 }),
    body('targetDate').isISO8601(),
    body('monthlyContribution').optional().isFloat({ min: 0 }),
    body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
];

// GET /api/goals
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC', [req.user!.id]);
    res.json({ success: true, data: rows.map(mapGoal) });
});

// POST /api/goals
router.post('/', goalValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, emoji = '🎯', target, current = 0, targetDate, monthlyContribution = 0, color = '#13a8a1' } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO goals (id, user_id, name, emoji, target_amount, current_amount, target_date, monthly_contribution, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, emoji, target, current, targetDate, monthlyContribution, color]
    );

    res.status(201).json({ success: true, data: { id, name, emoji, target, current, targetDate, monthlyContribution, color } });
});

// PUT /api/goals/:id
router.put('/:id', goalValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, emoji, target, current, targetDate, monthlyContribution, color } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE goals SET name=?, emoji=?, target_amount=?, current_amount=?, target_date=?, monthly_contribution=?, color=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, emoji, target, current, targetDate, monthlyContribution, color, req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Meta no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, emoji, target, current, targetDate, monthlyContribution, color } });
});

// PATCH /api/goals/:id/contribute  { amount }
router.patch('/:id/contribute',
    [body('amount').isFloat({ min: 0.01 })],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const [result] = await pool.query<any>(
            'UPDATE goals SET current_amount = current_amount + ?, updated_at=NOW() WHERE id=? AND user_id=?',
            [req.body.amount, req.params.id, req.user!.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Meta no encontrada.' }); return; }

        const [rows] = await pool.query<any[]>('SELECT current_amount, target_amount FROM goals WHERE id=?', [req.params.id]);
        res.json({ success: true, data: { current: parseFloat(rows[0].current_amount), target: parseFloat(rows[0].target_amount) } });
    }
);

// DELETE /api/goals/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM goals WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Meta no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
