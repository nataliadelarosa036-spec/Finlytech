import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapInv(row: any) {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        invested: parseFloat(row.invested),
        currentValue: parseFloat(row.current_value),
        returnPct: parseFloat(row.return_pct),
        dividends: parseFloat(row.dividends),
        emoji: row.emoji,
    };
}

const invValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('type').trim().isLength({ min: 1 }),
    body('invested').isFloat({ min: 0 }),
    body('currentValue').isFloat({ min: 0 }),
    body('returnPct').optional().isFloat(),
    body('dividends').optional().isFloat({ min: 0 }),
    body('emoji').optional().isString(),
];

// GET /api/investments
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM investments WHERE user_id=? ORDER BY current_value DESC', [req.user!.id]);
    res.json({ success: true, data: rows.map(mapInv) });
});

// POST /api/investments
router.post('/', invValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, type, invested, currentValue, returnPct = 0, dividends = 0, emoji = '📈' } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO investments (id, user_id, name, type, invested, current_value, return_pct, dividends, emoji) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, type, invested, currentValue, returnPct, dividends, emoji]
    );

    res.status(201).json({ success: true, data: { id, name, type, invested, currentValue, returnPct, dividends, emoji } });
});

// PUT /api/investments/:id
router.put('/:id', invValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, type, invested, currentValue, returnPct, dividends, emoji } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE investments SET name=?, type=?, invested=?, current_value=?, return_pct=?, dividends=?, emoji=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, type, invested, currentValue, returnPct ?? 0, dividends ?? 0, emoji ?? '📈', req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Inversión no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, type, invested, currentValue, returnPct, dividends, emoji } });
});

// DELETE /api/investments/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>('DELETE FROM investments WHERE id=? AND user_id=?', [req.params.id, req.user!.id]);
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Inversión no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
