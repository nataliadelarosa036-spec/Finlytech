import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { requireAuth } from '../middleware/auth.middleware';
import { sendPasswordResetEmail, sendPasswordChangedEmail, sendVerificationEmail } from '../utils/mailer';
import { generateSecureToken } from '../utils/jwt';
import type { AuthRequest } from '../types';

const router = Router();

// ─── POST /api/password/forgot  { email } ─────────────────────────────────────
// Solicitar reset de contraseña — siempre responde 200 para no revelar emails
router.post('/forgot',
    [body('email').isEmail().normalizeEmail()],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, error: 'Email inválido.' });
            return;
        }

        const { email } = req.body;
        const OK = { success: true, message: 'Si ese email está registrado, recibirás un enlace en breve.' };

        try {
            const [rows] = await pool.query<any[]>(
                'SELECT id, name, password_hash FROM users WHERE email = ? AND is_active = TRUE',
                [email]
            );

            // Always respond 200 to prevent email enumeration
            if (!rows.length) { res.json(OK); return; }

            const user = rows[0];

            // Google-only accounts can still set a password for the first time
            // This allows them to add password authentication alongside Google OAuth
            if (!user.password_hash) { 
                // Continue with the flow to let them set a password
            }

            // Invalidate previous reset tokens
            await pool.query(
                "UPDATE email_tokens SET used = TRUE WHERE user_id = ? AND type = 'reset_password' AND used = FALSE",
                [user.id]
            );

            // Create new token valid for 1 hour
            const token = generateSecureToken();
            const tokenId = uuidv4();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            await pool.query(
                "INSERT INTO email_tokens (id, user_id, token, type, expires_at) VALUES (?, ?, ?, 'reset_password', ?)",
                [tokenId, user.id, token, expiresAt]
            );

            await sendPasswordResetEmail(email, user.name, token);

            res.json(OK);
        } catch (err) {
            console.error('Forgot password error:', err);
            res.json(OK); // Still return OK to avoid leaking info
        }
    }
);

// ─── POST /api/password/reset  { token, password } ───────────────────────────
router.post('/reset',
    [
        body('token').notEmpty(),
        body('password')
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('La contraseña debe tener mayúsculas, minúsculas y números'),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, error: errors.array()[0].msg });
            return;
        }

        const { token, password } = req.body;

        try {
            const [rows] = await pool.query<any[]>(
                `SELECT et.id, et.user_id, u.name, u.email, u.password_hash
         FROM email_tokens et
         JOIN users u ON u.id = et.user_id
         WHERE et.token = ? AND et.type = 'reset_password'
           AND et.used = FALSE AND et.expires_at > NOW()`,
                [token]
            );

            if (!rows.length) {
                res.status(400).json({ success: false, error: 'El enlace es inválido o ya expiró.' });
                return;
            }

            const { id: tokenId, user_id, name, email } = rows[0];

            const passwordHash = await bcrypt.hash(password, 12);

            await Promise.all([
                pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [passwordHash, user_id]),
                pool.query('UPDATE email_tokens SET used = TRUE WHERE id = ?', [tokenId]),
                // Revoke all refresh tokens for security
                pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?', [user_id]),
            ]);

            await sendPasswordChangedEmail(email, name);

            res.json({ success: true, message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' });
        } catch (err) {
            console.error('Reset password error:', err);
            res.status(500).json({ success: false, error: 'Error interno. Intenta de nuevo.' });
        }
    }
);

// ─── POST /api/password/change  { currentPassword, newPassword } ─────────────
// Cambiar contraseña estando autenticado
router.post('/change',
    requireAuth,
    [
        body('currentPassword').notEmpty(),
        body('newPassword')
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('La nueva contraseña debe tener mayúsculas, minúsculas y números'),
    ],
    async (req: AuthRequest, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, error: errors.array()[0].msg });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        try {
            const [rows] = await pool.query<any[]>(
                'SELECT password_hash, name, email FROM users WHERE id = ?',
                [req.user!.id]
            );

            const user = rows[0];

            if (!user.password_hash) {
                res.status(400).json({ success: false, error: 'Tu cuenta usa Google para iniciar sesión. No tienes contraseña que cambiar.' });
                return;
            }

            const valid = await bcrypt.compare(currentPassword, user.password_hash);
            if (!valid) {
                res.status(401).json({ success: false, error: 'La contraseña actual es incorrecta.' });
                return;
            }

            const newHash = await bcrypt.hash(newPassword, 12);
            await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [newHash, req.user!.id]);

            await sendPasswordChangedEmail(user.email, user.name);

            res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
        } catch (err) {
            console.error('Change password error:', err);
            res.status(500).json({ success: false, error: 'Error interno.' });
        }
    }
);

// ─── GET /api/password/verify-reset?token=xxx ────────────────────────────────
// Verificar si un token de reset sigue válido (para el frontend)
router.get('/verify-reset', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;
    if (!token) { res.status(400).json({ success: false, error: 'Token requerido.' }); return; }

    const [rows] = await pool.query<any[]>(
        "SELECT id FROM email_tokens WHERE token = ? AND type = 'reset_password' AND used = FALSE AND expires_at > NOW()",
        [token]
    );

    if (!rows.length) {
        res.status(400).json({ success: false, error: 'El enlace es inválido o ya expiró.' });
        return;
    }

    res.json({ success: true });
});

// ─── POST /api/password/send-verification ────────────────────────────────────
// Reenviar email de verificación
router.post('/send-verification', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user!;

        if (user.is_verified) {
            res.status(400).json({ success: false, error: 'Tu email ya está verificado.' });
            return;
        }

        // Invalidar tokens anteriores
        await pool.query(
            "UPDATE email_tokens SET used = TRUE WHERE user_id = ? AND type = 'verify' AND used = FALSE",
            [user.id]
        );

        const token = generateSecureToken();
        const tokenId = uuidv4();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(
            "INSERT INTO email_tokens (id, user_id, token, type, expires_at) VALUES (?, ?, ?, 'verify', ?)",
            [tokenId, user.id, token, expiresAt]
        );

        await sendVerificationEmail(user.email, user.name, token);

        res.json({ success: true, message: 'Email de verificación enviado.' });
    } catch (err) {
        console.error('Send verification error:', err);
        res.status(500).json({ success: false, error: 'Error enviando email.' });
    }
});

// ─── GET /api/password/verify-email?token=xxx ────────────────────────────────
router.get('/verify-email', async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;
    if (!token) { res.status(400).json({ success: false, error: 'Token requerido.' }); return; }

    try {
        const [rows] = await pool.query<any[]>(
            "SELECT et.id, et.user_id FROM email_tokens et WHERE et.token = ? AND et.type = 'verify' AND et.used = FALSE AND et.expires_at > NOW()",
            [token]
        );

        if (!rows.length) {
            res.status(400).json({ success: false, error: 'El enlace es inválido o ya expiró.' });
            return;
        }

        await Promise.all([
            pool.query('UPDATE users SET is_verified = TRUE, email_verified_at = NOW() WHERE id = ?', [rows[0].user_id]),
            pool.query('UPDATE email_tokens SET used = TRUE WHERE id = ?', [rows[0].id]),
        ]);

        res.json({ success: true, message: '¡Email verificado correctamente!' });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ success: false, error: 'Error verificando email.' });
    }
});

export default router;
