import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapDebt(row: any) {
    return {
        id: row.id,
        name: row.name,
        balance: parseFloat(row.balance),
        originalBalance: parseFloat(row.original_balance),
        interestRate: parseFloat(row.interest_rate),
        minPayment: parseFloat(row.min_payment),
        dueDate: row.due_date instanceof Date ? row.due_date.toISOString().split('T')[0] : row.due_date,
        type: row.type,
    };
}

const debtValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('balance').isFloat({ min: 0 }),
    body('originalBalance').isFloat({ min: 0 }),
    body('interestRate').isFloat({ min: 0 }),
    body('minPayment').isFloat({ min: 0 }),
    body('dueDate').isISO8601(),
    body('type').isIn(['card', 'loan', 'other']),
];

// GET /api/debts
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM debts WHERE user_id=? ORDER BY balance DESC', [req.user!.id]);
    res.json({ success: true, data: rows.map(mapDebt) });
});

// POST /api/debts
router.post('/', debtValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, balance, originalBalance, interestRate, minPayment, dueDate, type } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO debts (id, user_id, name, balance, original_balance, interest_rate, min_payment, due_date, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, balance, originalBalance, interestRate, minPayment, dueDate, type]
    );

    res.status(201).json({ success: true, data: { id, name, balance, originalBalance, interestRate, minPayment, dueDate, type } });
});

// PUT /api/debts/:id
router.put('/:id', debtValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, balance, originalBalance, interestRate, minPayment, dueDate, type } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE debts SET name=?, balance=?, original_balance=?, interest_rate=?, min_payment=?, due_date=?, type=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, balance, originalBalance, interestRate, minPayment, dueDate, type, req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Deuda no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, balance, originalBalance, interestRate, minPayment, dueDate, type } });
});

// DELETE /api/debts/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM debts WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Deuda no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
