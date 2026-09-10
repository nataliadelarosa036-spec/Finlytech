import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { generateTokenPair, hashToken, verifyRefreshToken, generateSecureToken } from '../utils/jwt';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter, registerLimiter } from '../middleware/rateLimiter';
import { sendWelcomeEmail, sendVerificationEmail } from '../utils/mailer';
import type { AuthRequest, RegisterBody, LoginBody, GoogleAuthBody, SafeUser } from '../types';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helper: guarda refresh token en DB ───────────────────────────────────────
async function saveRefreshToken(userId: string, token: string, req: Request): Promise<void> {
    const id = uuidv4();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
    const deviceInfo = req.headers['user-agent']?.slice(0, 500) || null;
    const ipAddress = (req.ip || req.socket.remoteAddress || '').slice(0, 45);

    await pool.query(
        'INSERT INTO refresh_tokens (id, user_id, token_hash, device_info, ip_address, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
        [id, userId, tokenHash, deviceInfo, ipAddress, expiresAt]
    );
}

// ─── Helper: set cookies seguras ──────────────────────────────────────────────
function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    });
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
        path: '/api/auth/refresh',
    });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register',
    registerLimiter,
    [
        body('name').trim().isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
        body('password')
            .isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe tener mayúsculas, minúsculas y números'),
        body('acceptedTerms').equals('true').withMessage('Debes aceptar los términos y condiciones'),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, error: errors.array()[0].msg });
            return;
        }

        const { name, email, password, acceptedTerms, termsVersion = '1.0' }: RegisterBody = req.body;

        try {
            // Verificar si el email ya existe
            const [existing] = await pool.query<any[]>('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                res.status(409).json({ success: false, error: 'Este email ya está registrado.' });
                return;
            }

            // Hash de la contraseña
            const passwordHash = await bcrypt.hash(password, 12);
            const userId = uuidv4();
            const avatarColors = ['#13a8a1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e'];
            const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

            // Crear usuario
            await pool.query(
                `INSERT INTO users (id, name, email, password_hash, avatar_color, is_verified, accepted_terms, accepted_terms_at, terms_version)
         VALUES (?, ?, ?, ?, ?, FALSE, ?, NOW(), ?)`,
                [userId, name, email, passwordHash, avatarColor, acceptedTerms ? 1 : 0, termsVersion]
            );

            // Crear categorías por defecto para el usuario
            await createDefaultCategories(userId);

            // Generar tokens
            const tokens = generateTokenPair(userId, email);
            await saveRefreshToken(userId, tokens.refreshToken, req);

            // Log de auditoría
            await pool.query(
                'INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [userId, 'user.register', req.ip, req.headers['user-agent']]
            );

            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

            // Send welcome + verification emails (non-blocking)
            sendWelcomeEmail(email, name).catch(console.error);
            const verifyToken = generateSecureToken();
            pool.query(
                "INSERT INTO email_tokens (id, user_id, token, type, expires_at) VALUES (?, ?, ?, 'verify', DATE_ADD(NOW(), INTERVAL 24 HOUR))",
                [uuidv4(), userId, verifyToken]
            ).then(() => sendVerificationEmail(email, name, verifyToken)).catch(console.error);

            res.status(201).json({
                success: true,
                message: '¡Cuenta creada exitosamente!',
                data: {
                    user: { id: userId, name, email, avatarColor, mode: 'simple' },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch (err) {
            console.error('Error en registro:', err);
            res.status(500).json({ success: false, error: 'Error interno. Intenta de nuevo.' });
        }
    }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida'),
    ],
    async (req: Request, res: Response): Promise<void> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, error: errors.array()[0].msg });
            return;
        }

        const { email, password }: LoginBody = req.body;

        try {
            const [rows] = await pool.query<any[]>(
                'SELECT id, name, email, password_hash, avatar_color, mode, is_active, is_verified, accepted_terms FROM users WHERE email = ?',
                [email]
            );

            if (!rows.length) {
                res.status(401).json({ success: false, error: 'Email o contraseña incorrectos.' });
                return;
            }

            const user = rows[0];

            if (!user.is_active) {
                res.status(403).json({ success: false, error: 'Cuenta desactivada. Contacta soporte.' });
                return;
            }

            if (!user.password_hash) {
                res.status(400).json({ success: false, error: 'Esta cuenta usa Google para iniciar sesión.' });
                return;
            }

            const passwordValid = await bcrypt.compare(password, user.password_hash);
            if (!passwordValid) {
                res.status(401).json({ success: false, error: 'Email o contraseña incorrectos.' });
                return;
            }

            // Actualizar último login
            await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

            const tokens = generateTokenPair(user.id, user.email);
            await saveRefreshToken(user.id, tokens.refreshToken, req);

            await pool.query(
                'INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [user.id, 'user.login', req.ip, req.headers['user-agent']]
            );

            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatarColor: user.avatar_color,
                        mode: user.mode,
                        isVerified: user.is_verified,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch (err) {
            console.error('Error en login:', err);
            res.status(500).json({ success: false, error: 'Error interno. Intenta de nuevo.' });
        }
    }
);

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post('/google',
    authLimiter,
    async (req: Request, res: Response): Promise<void> => {
        const { credential, acceptedTerms, termsVersion = '1.0' }: GoogleAuthBody = req.body;

        if (!credential) {
            res.status(400).json({ success: false, error: 'Token de Google requerido.' });
            return;
        }

        try {
            // Verificar el ID token con Google
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                res.status(400).json({ success: false, error: 'Token de Google inválido.' });
                return;
            }

            const { sub: googleId, email, name = 'Usuario', picture: avatarUrl } = payload;

            // Buscar usuario existente por google_id o email
            const [rows] = await pool.query<any[]>(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [googleId, email]
            );

            let user = rows[0];
            let isNewUser = false;

            if (!user) {
                // Primer login con Google — verificar términos
                if (!acceptedTerms) {
                    res.status(200).json({
                        success: true,
                        requiresTerms: true,
                        data: { email, name, googleId, avatarUrl },
                    });
                    return;
                }

                // Crear usuario nuevo
                const userId = uuidv4();
                const avatarColors = ['#13a8a1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
                const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

                await pool.query(
                    `INSERT INTO users (id, name, email, google_id, google_email, avatar_url, avatar_color, is_verified, email_verified_at, accepted_terms, accepted_terms_at, terms_version)
           VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), TRUE, NOW(), ?)`,
                    [userId, name, email, googleId, email, avatarUrl, avatarColor, termsVersion]
                );

                await createDefaultCategories(userId);

                user = { id: userId, name, email, avatar_color: avatarColor, mode: 'simple', is_verified: true };
                isNewUser = true;
            } else {
                // Vincular Google ID si aún no estaba
                if (!user.google_id) {
                    await pool.query(
                        'UPDATE users SET google_id = ?, google_email = ?, avatar_url = ?, is_verified = TRUE WHERE id = ?',
                        [googleId, email, avatarUrl, user.id]
                    );
                }
                await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
            }

            const tokens = generateTokenPair(user.id, user.email);
            await saveRefreshToken(user.id, tokens.refreshToken, req);

            await pool.query(
                'INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [user.id, isNewUser ? 'user.register.google' : 'user.login.google', req.ip, req.headers['user-agent']]
            );

            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

            res.status(isNewUser ? 201 : 200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatarColor: user.avatar_color,
                        avatarUrl: user.avatar_url || avatarUrl,
                        mode: user.mode || 'simple',
                        isNewUser,
                    },
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            });
        } catch (err) {
            console.error('Error en Google auth:', err);
            res.status(500).json({ success: false, error: 'Error autenticando con Google.' });
        }
    }
);

// ─── POST /api/auth/google/code — OAuth2 authorization code exchange ──────────
router.post('/google/code',
    authLimiter,
    async (req: Request, res: Response): Promise<void> => {
        const { code, acceptedTerms, termsVersion = '1.0' } = req.body;

        if (!code) {
            res.status(400).json({ success: false, error: 'Authorization code requerido.' });
            return;
        }

        try {
            // Exchange authorization code for tokens
            const codeClient = new OAuth2Client(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'postmessage', // required for popup flow
            );

            const { tokens } = await codeClient.getToken(code);
            if (!tokens.id_token) {
                res.status(400).json({ success: false, error: 'No se pudo obtener el token de Google.' });
                return;
            }

            // Verify the ID token
            const ticket = await googleClient.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                res.status(400).json({ success: false, error: 'Token de Google inválido.' });
                return;
            }

            const { sub: googleId, email, name = 'Usuario', picture: avatarUrl } = payload;

            // Find or create user
            const [rows] = await pool.query<any[]>(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [googleId, email]
            );

            let user = rows[0];
            let isNewUser = false;

            if (!user) {
                if (!acceptedTerms) {
                    res.status(200).json({
                        success: true,
                        requiresTerms: true,
                        data: { email, name, googleId, avatarUrl },
                    });
                    return;
                }

                const userId = uuidv4();
                const avatarColors = ['#13a8a1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];
                const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

                await pool.query(
                    `INSERT INTO users (id, name, email, google_id, google_email, avatar_url, avatar_color, is_verified, email_verified_at, accepted_terms, accepted_terms_at, terms_version)
                     VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW(), TRUE, NOW(), ?)`,
                    [userId, name, email, googleId, email, avatarUrl, avatarColor, termsVersion]
                );

                await createDefaultCategories(userId);
                user = { id: userId, name, email, avatar_color: avatarColor, mode: 'simple', is_verified: true };
                isNewUser = true;

                sendWelcomeEmail(email, name).catch(console.error);
            } else {
                if (!user.google_id) {
                    await pool.query(
                        'UPDATE users SET google_id = ?, google_email = ?, avatar_url = ?, is_verified = TRUE WHERE id = ?',
                        [googleId, email, avatarUrl, user.id]
                    );
                }
                await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
            }

            const tokenPair = generateTokenPair(user.id, user.email);
            await saveRefreshToken(user.id, tokenPair.refreshToken, req);

            await pool.query(
                'INSERT INTO audit_log (user_id, action, ip_address, user_agent) VALUES (?, ?, ?, ?)',
                [user.id, isNewUser ? 'user.register.google' : 'user.login.google', req.ip, req.headers['user-agent']]
            );

            setAuthCookies(res, tokenPair.accessToken, tokenPair.refreshToken);

            res.status(isNewUser ? 201 : 200).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        avatarColor: user.avatar_color,
                        avatarUrl: user.avatar_url || avatarUrl,
                        mode: user.mode || 'simple',
                        isNewUser,
                    },
                    accessToken: tokenPair.accessToken,
                    refreshToken: tokenPair.refreshToken,
                },
            });
        } catch (err) {
            console.error('Error en Google code exchange:', err);
            res.status(500).json({ success: false, error: 'Error autenticando con Google.' });
        }
    }
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!token) {
        res.status(401).json({ success: false, error: 'Refresh token requerido.' });
        return;
    }

    try {
        const payload = verifyRefreshToken(token);
        const tokenHash = hashToken(token);

        const [rows] = await pool.query<any[]>(
            'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked = FALSE AND expires_at > NOW()',
            [tokenHash, payload.userId]
        );

        if (!rows.length) {
            res.status(401).json({ success: false, error: 'Sesión inválida o expirada.' });
            return;
        }

        // Revocar el token actual (rotación de tokens)
        await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?', [tokenHash]);

        // Generar nuevos tokens
        const tokens = generateTokenPair(payload.userId, payload.email);
        await saveRefreshToken(payload.userId, tokens.refreshToken, req);
        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        res.json({ success: true, data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken } });
    } catch {
        res.status(401).json({ success: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' });
    }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;

    if (token) {
        const tokenHash = hashToken(token);
        await pool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = ?', [tokenHash]).catch(() => { });
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    res.json({ success: true, message: 'Sesión cerrada correctamente.' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
    res.json({ success: true, data: { user: req.user } });
});

// ─── GET /api/auth/terms ──────────────────────────────────────────────────────
router.get('/terms', async (_req: Request, res: Response): Promise<void> => {
    const [rows] = await pool.query<any[]>('SELECT * FROM terms_versions ORDER BY effective_date DESC LIMIT 1');
    res.json({ success: true, data: rows[0] || { version: '1.0' } });
});

// ─── Helper: categorías por defecto ───────────────────────────────────────────
async function createDefaultCategories(userId: string): Promise<void> {
    const defaults = [
        { id: uuidv4(), name: 'Alimentación', icon: '🍔', color: '#f97316', kind: 'expense' },
        { id: uuidv4(), name: 'Transporte', icon: '🚗', color: '#3b82f6', kind: 'expense' },
        { id: uuidv4(), name: 'Vivienda', icon: '🏠', color: '#8b5cf6', kind: 'expense' },
        { id: uuidv4(), name: 'Servicios', icon: '📱', color: '#06b6d4', kind: 'expense' },
        { id: uuidv4(), name: 'Entretenimiento', icon: '🎬', color: '#ec4899', kind: 'expense' },
        { id: uuidv4(), name: 'Salud', icon: '💊', color: '#ef4444', kind: 'expense' },
        { id: uuidv4(), name: 'Educación', icon: '📚', color: '#14b8a6', kind: 'expense' },
        { id: uuidv4(), name: 'Ropa', icon: '👕', color: '#a855f7', kind: 'expense' },
        { id: uuidv4(), name: 'Restaurantes', icon: '🍽️', color: '#f59e0b', kind: 'expense' },
        { id: uuidv4(), name: 'Domicilios', icon: '🛵', color: '#fb923c', kind: 'expense' },
        { id: uuidv4(), name: 'Salario', icon: '💰', color: '#13a8a1', kind: 'income' },
        { id: uuidv4(), name: 'Freelance', icon: '💻', color: '#10b981', kind: 'income' },
        { id: uuidv4(), name: 'Inversiones', icon: '📈', color: '#059669', kind: 'income' },
        { id: uuidv4(), name: 'Ahorro', icon: '🐷', color: '#0d8882', kind: 'income' },
    ];

    for (const cat of defaults) {
        await pool.query(
            'INSERT INTO categories (id, user_id, name, icon, color, kind, is_default) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
            [cat.id, userId, cat.name, cat.icon, cat.color, cat.kind]
        );
    }

    // Create default account
    await pool.query(
        'INSERT INTO accounts (id, user_id, name, type, balance, institution, color, included_in_net_worth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [uuidv4(), userId, 'Cuenta Principal', 'checking', 0, 'Mi Banco', '#13a8a1', 1]
    );
}

export default router;
