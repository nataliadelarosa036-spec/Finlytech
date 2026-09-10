import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapAccount(row: any) {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        balance: parseFloat(row.balance),
        institution: row.institution,
        color: row.color,
        includedInNetWorth: Boolean(row.included_in_net_worth),
    };
}

const accountValidation = [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('type').isIn(['checking', 'savings', 'credit', 'cash', 'investment']),
    body('balance').isNumeric(),
    body('institution').trim().isLength({ min: 1, max: 100 }),
    body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
    body('includedInNetWorth').optional().isBoolean(),
];

// GET /api/accounts
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
        [req.user!.id]
    );
    res.json({ success: true, data: rows.map(mapAccount) });
});

// POST /api/accounts
router.post('/', accountValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, type, balance, institution, color = '#13a8a1', includedInNetWorth = true } = req.body;
    const id = uuidv4();

    await pool.query(
        'INSERT INTO accounts (id, user_id, name, type, balance, institution, color, included_in_net_worth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, req.user!.id, name, type, balance, institution, color, includedInNetWorth ? 1 : 0]
    );

    res.status(201).json({ success: true, data: { id, name, type, balance: parseFloat(balance), institution, color, includedInNetWorth } });
});

// PUT /api/accounts/:id
router.put('/:id', accountValidation, async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

    const { name, type, balance, institution, color, includedInNetWorth } = req.body;
    const [result] = await pool.query<any>(
        'UPDATE accounts SET name=?, type=?, balance=?, institution=?, color=?, included_in_net_worth=?, updated_at=NOW() WHERE id=? AND user_id=?',
        [name, type, balance, institution, color ?? '#13a8a1', includedInNetWorth ? 1 : 0, req.params.id, req.user!.id]
    );

    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Cuenta no encontrada.' }); return; }
    res.json({ success: true, data: { id: req.params.id, name, type, balance: parseFloat(balance), institution, color, includedInNetWorth } });
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>(
        'DELETE FROM accounts WHERE id = ? AND user_id = ?',
        [req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Cuenta no encontrada.' }); return; }
    res.json({ success: true });
});

export default router;
