import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function currentMonth(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
}

// GET /api/budgets?month=YYYY-MM
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const month = (req.query.month as string) || currentMonth();

    const [rows] = await pool.query<any[]>(
        `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM budgets b
     JOIN categories c ON c.id = b.category_id
     WHERE b.user_id=? AND b.month=?
     ORDER BY b.created_at ASC`,
        [req.user!.id, month]
    );

    const data = rows.map(row => ({
        id: row.id,
        category: row.category_id,
        limit: parseFloat(row.amount_limit),
        spent: parseFloat(row.spent),
        period: row.period,
        month: row.month,
    }));

    res.json({ success: true, data });
});

// POST /api/budgets
router.post('/',
    [
        body('category').isUUID(),
        body('limit').isFloat({ min: 1 }),
        body('month').optional().matches(/^\d{4}-\d{2}$/),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const { category, limit, month = currentMonth() } = req.body;
        const id = uuidv4();

        // Calculate current spent for this category/month
        const [spentRows] = await pool.query<any[]>(
            `SELECT COALESCE(SUM(amount), 0) as spent FROM transactions
       WHERE user_id=? AND category_id=? AND type='expense' AND DATE_FORMAT(date,'%Y-%m')=?`,
            [req.user!.id, category, month]
        );
        const spent = parseFloat(spentRows[0]?.spent ?? 0);

        await pool.query(
            'INSERT INTO budgets (id, user_id, category_id, amount_limit, spent, month) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount_limit=?, spent=?',
            [id, req.user!.id, category, limit, spent, month, limit, spent]
        );

        res.status(201).json({ success: true, data: { id, category, limit, spent, period: 'monthly', month } });
    }
);

// PUT /api/budgets/:id
router.put('/:id',
    [body('limit').isFloat({ min: 1 })],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const [result] = await pool.query<any>(
            'UPDATE budgets SET amount_limit=?, updated_at=NOW() WHERE id=? AND user_id=?',
            [req.body.limit, req.params.id, req.user!.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Presupuesto no encontrado.' }); return; }
        res.json({ success: true });
    }
);

// DELETE /api/budgets/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM budgets WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Presupuesto no encontrado.' }); return; }
    res.json({ success: true });
});

export default router;
