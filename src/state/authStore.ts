import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/services/auth';

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: AuthUser, token: string) => void;
    setToken: (token: string) => void;
    clearAuth: () => void;
    setLoading: (v: boolean) => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,

            setAuth: (user, accessToken) =>
                set({ user, accessToken, isAuthenticated: true, isLoading: false }),

            setToken: (accessToken) => set({ accessToken }),

            clearAuth: () =>
                set({ user: null, accessToken: null, isAuthenticated: false }),

            setLoading: (isLoading) => set({ isLoading }),

            updateUser: (updates) =>
                set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
        }),
        {
            name: 'finlytech-auth',
            partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
        }
    )
);
