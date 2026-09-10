import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapSub(row: any) {
    return {
        id: row.id,
        name: row.name,
        amount: parseFloat(row.amount),
        period: row.period,
        nextCharge: row.next_charge instanceof Date ? row.next_charge.toISOString().split('T')[0] : row.next_charge,
        category: row.category,
        emoji: row.emoji,
        active: Boolean(row.active),
        monthsUnused: row.months_unused ?? 0,
    };
}

const subValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('amount').isFloat({ min: 0.01 }),
    body('period').isIn(['monthly', 'yearly']),
    body('nextCharge').isISO8601(),
    body('category').trim().isLength({ min: 1 }),
    body('emoji').optional().isString(),
    body('active').optional().isBoolean(),
    body('monthsUnused').optional().isInt({ min: 0 }),
];

// GET /api/subscriptions
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM subscriptions WHERE user_id=? ORDER BY name ASC', [req.user!.id]);
    res.json({ success: true, data: rows.map(mapSub) });
});

// POST /api/subscriptions
router.post('/', subValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, amount, period, nextCharge, category, emoji = '📱', active = true, monthsUnused = 0 } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO subscriptions (id, user_id, name, amount, period, next_charge, category, emoji, active, months_unused) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, amount, period, nextCharge, category, emoji, active ? 1 : 0, monthsUnused]
    );

    res.status(201).json({ success: true, data: { id, name, amount, period, nextCharge, category, emoji, active, monthsUnused } });
});

// PUT /api/subscriptions/:id
router.put('/:id', subValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, amount, period, nextCharge, category, emoji, active, monthsUnused } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE subscriptions SET name=?, amount=?, period=?, next_charge=?, category=?, emoji=?, active=?, months_unused=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, amount, period, nextCharge, category, emoji, active ? 1 : 0, monthsUnused ?? 0, req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Suscripción no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, amount, period, nextCharge, category, emoji, active, monthsUnused } });
});

// PATCH /api/subscriptions/:id/toggle
router.patch('/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>(
        'UPDATE subscriptions SET active = NOT active, updated_at=NOW() WHERE id=? AND user_id=?',
        [req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Suscripción no encontrada.' }); return; }
    const [rows] = await pool.query<any[]>('SELECT active FROM subscriptions WHERE id=?', [req.params.id]);
    res.json({ success: true, data: { active: Boolean(rows[0]?.active) } });
});

// DELETE /api/subscriptions/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM subscriptions WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Suscripción no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
