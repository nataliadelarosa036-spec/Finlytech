import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { pool } from '../db/connection';
import type { AuthRequest, SafeUser } from '../types';

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        // Busca el token en header Authorization o en cookie
        let token: string | undefined;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        } else if (req.cookies?.access_token) {
            token = req.cookies.access_token;
        }

        if (!token) {
            res.status(401).json({ success: false, error: 'No autenticado. Inicia sesión.' });
            return;
        }

        // Verifica el JWT
        const payload = verifyAccessToken(token);

        // Busca el usuario en DB
        const [rows] = await pool.query<any[]>(
            'SELECT id, name, email, avatar_color, currency, locale, mode, monthly_income_goal, avatar_url, is_active, is_verified, accepted_terms, accepted_terms_at, terms_version, created_at, updated_at, last_login_at FROM users WHERE id = ? AND is_active = TRUE',
            [payload.userId]
        );

        if (!rows.length) {
            res.status(401).json({ success: false, error: 'Usuario no encontrado o inactivo.' });
            return;
        }

        req.user = rows[0] as SafeUser;
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            res.status(401).json({ success: false, error: 'Sesión expirada. Vuelve a iniciar sesión.' });
        } else {
            res.status(401).json({ success: false, error: 'Token inválido.' });
        }
    }
}

// Middleware opcional — adjunta usuario si hay token, pero no falla si no hay
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.access_token;
        if (token) {
            const payload = verifyAccessToken(token);
            const [rows] = await pool.query<any[]>(
                'SELECT id, name, email, avatar_color, currency, locale, mode, monthly_income_goal, avatar_url, is_active, is_verified, accepted_terms FROM users WHERE id = ? AND is_active = TRUE',
                [payload.userId]
            );
            if (rows.length) req.user = rows[0] as SafeUser;
        }
    } catch {
        // Si el token es inválido simplemente ignoramos
    }
    next();
}
