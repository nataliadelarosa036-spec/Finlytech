import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapCard(row: any) {
    return {
        id: row.id,
        name: row.name,
        number: row.number,
        limit: parseFloat(row.card_limit),
        balance: parseFloat(row.balance),
        dueDate: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : row.due_date,
        color: row.color,
    };
}

const cardValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('number').optional().isString(),
    body('limit').isFloat({ min: 0 }),
    body('balance').optional().isFloat({ min: 0 }),
    body('dueDate').isISO8601(),
    body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
];

// GET /api/cards
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM cards WHERE user_id=? ORDER BY created_at ASC', [req.user!.id]);
    res.json({ success: true, data: rows.map(mapCard) });
});

// POST /api/cards
router.post('/', cardValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, number = '', limit, balance = 0, dueDate, color = '#8b5cf6' } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO cards (id, user_id, name, number, card_limit, balance, due_date, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, number, limit, balance, dueDate, color]
    );

    res.status(201).json({ success: true, data: { id, name, number, limit, balance, dueDate, color } });
});

// PUT /api/cards/:id
router.put('/:id', cardValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, number, limit, balance, dueDate, color } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE cards SET name=?, number=?, card_limit=?, balance=?, due_date=?, color=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, number ?? '', limit, balance ?? 0, dueDate, color ?? '#8b5cf6', req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Tarjeta no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, number, limit, balance, dueDate, color } });
});

// PATCH /api/cards/:id/pay  { amount }
router.patch('/:id/pay',
    [body('amount').isFloat({ min: 0.01 })],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const [result] = await pool.query<any>(
            'UPDATE cards SET balance = GREATEST(0, balance - ?), updated_at=NOW() WHERE id=? AND user_id=?',
            [req.body.amount, req.params.id, req.user!.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Tarjeta no encontrada.' }); return; }
        const [rows] = await pool.query<any[]>('SELECT balance FROM cards WHERE id=?', [req.params.id]);
        res.json({ success: true, data: { balance: parseFloat(rows[0]?.balance ?? 0) } });
    }
);

// DELETE /api/cards/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM cards WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Tarjeta no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
