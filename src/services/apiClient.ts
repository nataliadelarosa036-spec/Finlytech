/**
 * Base HTTP client — injects Authorization header, handles 401 refresh,
 * and exposes typed helpers used by all service modules.
 */
import { useAuthStore } from '@/state/authStore';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = useAuthStore.getState().accessToken;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        ...options,
        headers,
    });

    // Token expired — try to refresh once
    if (res.status === 401) {
        try {
            const refreshRes = await fetch(`${BASE}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
                useAuthStore.getState().setToken(refreshData.data.accessToken);
                // Retry original request with new token
                headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
                const retryRes = await fetch(`${BASE}${path}`, {
                    credentials: 'include',
                    ...options,
                    headers,
                });
                if (!retryRes.ok) {
                    const err = await retryRes.json().catch(() => ({}));
                    throw new ApiError(retryRes.status, err.error || 'Error en la solicitud');
                }
                return retryRes.json();
            }
        } catch {
            // Refresh failed — force logout
            useAuthStore.getState().clearAuth();
            window.location.href = '/login';
        }
        throw new ApiError(401, 'Sesión expirada');
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new ApiError(res.status, err.error || `HTTP ${res.status}`);
    }

    return res.json();
}

export const http = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export { ApiError };
