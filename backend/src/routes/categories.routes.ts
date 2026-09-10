import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

function mapCategory(row: any) {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        kind: row.kind,
        parent: row.parent_id || undefined,
    };
}

// GET /api/categories
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>(
        'SELECT * FROM categories WHERE user_id = ? ORDER BY kind ASC, name ASC',
        [req.user!.id]
    );
    res.json({ success: true, data: rows.map(mapCategory) });
});

// POST /api/categories
router.post('/',
    [
        body('name').trim().isLength({ min: 1, max: 100 }),
        body('icon').trim().isLength({ min: 1, max: 10 }),
        body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
        body('kind').isIn(['income', 'expense']),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const { name, icon, color = '#13a8a1', kind, parent } = req.body;
        const id = uuidv4();

        await pool.query(
            'INSERT INTO categories (id, user_id, name, icon, color, kind, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, req.user!.id, name, icon, color, kind, parent || null]
        );

        res.status(201).json({ success: true, data: { id, name, icon, color, kind, parent } });
    }
);

// PUT /api/categories/:id
router.put('/:id',
    [
        body('name').optional().trim().isLength({ min: 1, max: 100 }),
        body('icon').optional().trim(),
        body('color').optional().matches(/^#[0-9a-fA-F]{6}$/),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const { name, icon, color } = req.body;
        const [result] = await pool.query<any>(
            'UPDATE categories SET name=COALESCE(?,name), icon=COALESCE(?,icon), color=COALESCE(?,color) WHERE id=? AND user_id=?',
            [name, icon, color, req.params.id, req.user!.id]
        );
        if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'Categoría no encontrada.' }); return; }
        res.json({ success: true });
    }
);

// DELETE /api/categories/:id (solo las no-default)
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const [result] = await pool.query<any>(
        'DELETE FROM categories WHERE id=? AND user_id=? AND is_default=FALSE',
        [req.params.id, req.user!.id]
    );
    if (result.affectedRows === 0) { res.status(404).json({ success: false, error: 'No se puede eliminar esta categoría.' }); return; }
    res.json({ success: true });
});

export default router;
