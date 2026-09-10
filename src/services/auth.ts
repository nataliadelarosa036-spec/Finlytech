const API = import.meta.env.VITE_API_URL || '';

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    avatarUrl?: string;
    mode: 'simple' | 'advanced';
    isVerified?: boolean;
    isNewUser?: boolean;
}

export interface AuthResponse {
    success: boolean;
    data?: { user: AuthUser; accessToken: string; refreshToken: string };
    error?: string;
    message?: string;
    requiresTerms?: boolean;
}

// ─── Helper fetch ─────────────────────────────────────────────────────────────
async function apiFetch(path: string, options?: RequestInit): Promise<any> {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
    register: (data: { name: string; email: string; password: string; acceptedTerms: boolean; termsVersion?: string }) =>
        apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ ...data, acceptedTerms: String(data.acceptedTerms) }) }),

    login: (email: string, password: string) =>
        apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    loginWithGoogle: (credential: string, acceptedTerms?: boolean, termsVersion?: string) =>
        apiFetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential, acceptedTerms, termsVersion }) }),

    loginWithGoogleCode: (code: string, acceptedTerms?: boolean, termsVersion?: string) =>
        apiFetch('/api/auth/google/code', { method: 'POST', body: JSON.stringify({ code, acceptedTerms, termsVersion }) }),

    logout: () =>
        apiFetch('/api/auth/logout', { method: 'POST' }),

    me: () =>
        apiFetch('/api/auth/me'),

    refresh: () =>
        apiFetch('/api/auth/refresh', { method: 'POST' }),

    getTerms: () =>
        apiFetch('/api/auth/terms'),
};
