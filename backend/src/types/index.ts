// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    name: string;
    email: string;
    password_hash?: string | null;
    avatar_color: string;
    currency: string;
    locale: string;
    mode: 'simple' | 'advanced';
    monthly_income_goal: number;
    google_id?: string | null;
    google_email?: string | null;
    avatar_url?: string | null;
    is_active: boolean;
    is_verified: boolean;
    accepted_terms: boolean;
    accepted_terms_at?: Date | null;
    terms_version?: string | null;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date | null;
}

export type SafeUser = Omit<User, 'password_hash' | 'google_id'>;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RegisterBody {
    name: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
    termsVersion: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface GoogleAuthBody {
    credential: string; // ID token from Google
    acceptedTerms?: boolean;
    termsVersion?: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ─── Request con usuario autenticado ──────────────────────────────────────────
import { Request } from 'express';
export interface AuthRequest extends Request {
    user?: SafeUser;
}
