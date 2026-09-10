import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, query, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapTransaction(row: any) {
    return {
        id: row.id,
        type: row.type,
        amount: parseFloat(row.amount),
        description: row.description,
        category: row.category_id,
        account: row.account_id,
        date: row.date instanceof Date ? row.date.toISOString() : row.date,
        note: row.note || undefined,
        recurring: Boolean(row.recurring),
    };
}

const txValidation = [
    body('type').isIn(['income', 'expense', 'transfer', 'debt', 'payment', 'saving', 'investment']),
    body('amount').isFloat({ min: 0.01 }),
    body('description').trim().isLength({ min: 1, max: 255 }),
    body('category').trim().isUUID(),
    body('account').trim().isUUID(),
    body('date').isISO8601(),
    body('note').optional().isString(),
    body('recurring').optional().isBoolean(),
];

// GET /api/transactions?month=YYYY-MM&type=expense&limit=100
router.get('/',
    [
        query('month').optional().matches(/^\d{4}-\d{2}$/),
        query('type').optional().isString(),
        query('limit').optional().isInt({ min: 1, max: 1000 }),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        let sql = 'SELECT * FROM transactions WHERE user_id = ?';
        const params: any[] = [req.user!.id];

        if (req.query.month) {
            sql += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
            params.push(req.query.month);
        }
        if (req.query.type) {
            sql += ' AND type = ?';
            params.push(req.query.type);
        }

        sql += ' ORDER BY date DESC';

        const limit = parseInt(req.query.limit as string) || 500;
        sql += ` LIMIT ${limit}`;

        const [rows] = await pool.query<any[]>(sql, params);
        res.json({ success: true, data: rows.map(mapTransaction) });
    }
);

// POST /api/transactions
router.post('/', txValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { type, amount, description, category, account, date, note, recurring = false } = req.body;

    // Verify account belongs to user
    const [acctRows] = await pool.query<any[]>('SELECT id FROM accounts WHERE id=? AND user_id=?', [account, req.user!.id]);
    if (!acctRows.length) { res.status(400).json({ success: false, error: 'Cuenta inválida.' }); return; }

    // Verify category belongs to user
    const [catRows] = await pool.query<any[]>('SELECT id FROM categories WHERE id=? AND user_id=?', [category, req.user!.id]);
    if (!catRows.length) { res.status(400).json({ success: false, error: 'Categoría inválida.' }); return; }

    const id = uuidv4();
    await pool.query(
        'INSERT INTO transactions (id, user_id, type, amount, description, category_id, account_id, date, note, recurring) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, type, amount, description, category, account, new Date(date), note || null, recurring ? 1 : 0]
    );

    // Update account balance
    const delta = ['income', 'saving'].includes(type) ? amount : -amount;
    if (type !== 'transfer') {
        await pool.query('UPDATE accounts SET balance = balance + ?, updated_at=NOW() WHERE id=?', [delta, account]);
    }

    res.status(201).json({ success: true, data: { id, type, amount: parseFloat(amount), description, category, account, date, note, recurring } });
});

// PUT /api/transactions/:id
router.put('/:id', txValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { type, amount, description, category, account, date, note, recurring } = req.body;
    const userId = req.user!.id;

    // Get existing to reverse balance
    const [existing] = await pool.query<any[]>('SELECT * FROM transactions WHERE id=? AND user_id=?', [req.params.id, userId]);
    if (!existing.length) { res.status(404).json({ success: false, error: 'Transacción no encontrada.' }); return; }

    const old = existing[0];

    // Reverse old balance effect
    const oldDelta = ['income', 'saving'].includes(old.type) ? -parseFloat(old.amount) : parseFloat(old.amount);
    if (old.type !== 'transfer') {
        await pool.query('UPDATE accounts SET balance = balance + ?, updated_at=NOW() WHERE id=?', [oldDelta, old.account_id]);
    }

    await pool.query(
        'UPDATE transactions SET type=?, amount=?, description=?, category_id=?, account_id=?, date=?, note=?, recurring=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [type, amount, description, category, account, new Date(date), note || null, recurring ? 1 : 0, req.params.id, userId]
    );

    // Apply new balance effect
    const newDelta = ['income', 'saving'].includes(type) ? parseFloat(amount) : -parseFloat(amount);
    if (type !== 'transfer') {
        await pool.query('UPDATE accounts SET balance = balance + ?, updated_at=NOW() WHERE id=?', [newDelta, account]);
    }

    res.json({ success: true, data: { id: req.params.id, type, amount: parseFloat(amount), description, category, account, date, note, recurring } });
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const [existing] = await pool.query<any[]>('SELECT * FROM transactions WHERE id=? AND user_id=?', [req.params.id, userId]);
    if (!existing.length) { res.status(404).json({ success: false, error: 'Transacción no encontrada.' }); return; }

    const old = existing[0];
    await pool.query('DELETE FROM transactions WHERE id=? AND user_id=?', [req.params.id, userId]);

    // Reverse balance
    const delta = ['income', 'saving'].includes(old.type) ? -parseFloat(old.amount) : parseFloat(old.amount);
    if (old.type !== 'transfer') {
        await pool.query('UPDATE accounts SET balance = balance + ?, updated_at=NOW() WHERE id=?', [delta, old.account_id]);
    }

    res.json({ success: true });
});

export default router;
