import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import { useStore } from '@/state/store';
import { authApi } from '@/services/auth';
import { loadDashboard } from '@/services/api';

interface AuthGuardProps {
    children: React.ReactNode;
}

const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
const PUBLIC_INFO_ROUTES = ['/', '/landing', '/features', '/plans', '/faq', '/terms', '/privacy', '/contact', '/verify-email'];

export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, setAuth, clearAuth, setLoading, accessToken, user } = useAuthStore();
    const syncWithAuthUser = useStore((s) => s.syncWithAuthUser);

    const isPublicAuth = PUBLIC_AUTH_ROUTES.some(
        (r) => location.pathname === r || location.pathname.startsWith(r + '/')
    );
    const isPublicInfo = PUBLIC_INFO_ROUTES.some(
        (r) => location.pathname === r || location.pathname.startsWith(r + '/')
    );
    const isPublic = isPublicAuth || isPublicInfo;

    // Sync auth user into main store and load backend data
    useEffect(() => {
        if (isAuthenticated && user) {
            syncWithAuthUser(user);
            // Load all financial data from backend into the store
            loadDashboard().catch(console.error);
        }
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (isPublicAuth && isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }

        if (!isPublic && !isAuthenticated) {
            setLoading(true);
            authApi
                .me()
                .then((res) => {
                    if (res.success && res.data?.user) {
                        setAuth(res.data.user, accessToken || '');
                        syncWithAuthUser(res.data.user);
                    } else {
                        return authApi.refresh().then((refreshRes) => {
                            if (refreshRes.success && refreshRes.data?.accessToken) {
                                const refreshedUser = refreshRes.data.user || res.data?.user;
                                if (refreshedUser) {
                                    setAuth(refreshedUser, refreshRes.data.accessToken);
                                    syncWithAuthUser(refreshedUser);
                                }
                            } else {
                                clearAuth();
                                navigate('/login', { replace: true, state: { from: location.pathname } });
                            }
                        });
                    }
                })
                .catch(() => {
                    clearAuth();
                    navigate('/login', { replace: true, state: { from: location.pathname } });
                })
                .finally(() => setLoading(false));
        }
    }, [location.pathname, isAuthenticated, isPublic, isPublicAuth]);

    return <>{children}</>;
}
