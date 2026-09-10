import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import type { AuthRequest } from '../types';

const router = Router();
router.use(requireAuth);

// GET /api/user/profile
router.get('/profile', (req: AuthRequest, res: Response): void => {
    const u = req.user!;
    res.json({
        success: true,
        data: {
            id: u.id,
            name: u.name,
            email: u.email,
            avatarColor: u.avatar_color,
            avatarUrl: u.avatar_url,
            currency: u.currency,
            locale: u.locale,
            mode: u.mode,
            monthlyIncomeGoal: parseFloat(String(u.monthly_income_goal ?? 0)),
            isVerified: u.is_verified,
        },
    });
});

// PATCH /api/user/profile
router.patch('/profile',
    [
        body('name').optional().trim().isLength({ min: 2, max: 100 }),
        body('currency').optional().isLength({ min: 3, max: 3 }),
        body('locale').optional().isLength({ min: 2, max: 10 }),
        body('mode').optional().isIn(['simple', 'advanced']),
        body('monthlyIncomeGoal').optional().isFloat({ min: 0 }),
        body('avatarColor').optional().matches(/^#[0-9a-fA-F]{6}$/),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) { res.status(400).json({ success: false, error: errors.array()[0].msg }); return; }

        const { name, currency, locale, mode, monthlyIncomeGoal, avatarColor } = req.body;

        await pool.query(
            `UPDATE users SET
        name = COALESCE(?, name),
        currency = COALESCE(?, currency),
        locale = COALESCE(?, locale),
        mode = COALESCE(?, mode),
        monthly_income_goal = COALESCE(?, monthly_income_goal),
        avatar_color = COALESCE(?, avatar_color),
        updated_at = NOW()
       WHERE id = ?`,
            [name, currency, locale, mode, monthlyIncomeGoal, avatarColor, req.user!.id]
        );

        res.json({ success: true, message: 'Perfil actualizado.' });
    }
);

export default router;
