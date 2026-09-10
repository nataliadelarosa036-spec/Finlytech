import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/state/authStore';
import { useStore } from '@/state/store';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

declare global { interface Window { google: any; } }

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const syncWithAuthUser = useStore((s) => s.syncWithAuthUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  // ── Google OAuth2 popup flow ────────────────────────────────────────────────
  const handleGoogleClick = () => {
    setError('');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) { setError('Google no está configurado.'); return; }

    const doAuth = () => {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: async (response: { code?: string; error?: string }) => {
          if (response.error || !response.code) {
            if (response.error !== 'access_denied') {
              setError('Error al autenticar con Google. Intenta de nuevo.');
            }
            return;
          }
          setGoogleLoading(true);
          try {
            const res = await authApi.loginWithGoogleCode(response.code);
            if (res.requiresTerms) {
              navigate('/register', { state: { googleCode: response.code, fromGoogle: true } });
              return;
            }
            if (!res.success) { setError(res.error || 'Error con Google.'); return; }
            setAuth(res.data.user, res.data.accessToken);
            syncWithAuthUser(res.data.user);
            navigate('/');
          } catch { setError('Error conectando con Google.'); }
          finally { setGoogleLoading(false); }
        },
      });
      client.requestCode();
    };

    if (window.google?.accounts?.oauth2) {
      doAuth();
    } else {
      const iv = setInterval(() => {
        if (window.google?.accounts?.oauth2) { clearInterval(iv); doAuth(); }
      }, 100);
    }
  };

  // ── Email / password login ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Completa todos los campos.'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.login(email, password);
      if (!res.success) { setError(res.error || 'Credenciales incorrectas.'); return; }
      setAuth(res.data.user, res.data.accessToken);
      syncWithAuthUser(res.data.user);
      navigate('/');
    } catch { setError('Error de conexión. Verifica tu internet.'); }
    finally { setLoading(false); }
  };

  const isLoading = loading || googleLoading;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #323232 0%, #2a2a2a 50%, #282828 100%)' }}
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors font-medium">
          <ArrowLeft size={13} /> Volver al inicio
        </Link>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <img src={logo} alt="Finlytech" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
            <img src={eslogan} alt="eslogan" className="h-7 w-auto object-contain opacity-80 group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 rounded-xl"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}
            >
              <AlertCircle size={14} className="text-rose-400 shrink-0" />
              <p className="text-sm text-rose-400">{error}</p>
            </motion.div>
          )}

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e4e4e7' }}
            onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
          >
            {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            {googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-zinc-600 font-medium">o con email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: 'rgba(212,175,55,0.7)' }}>Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com" autoComplete="email" required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(212,175,55,0.7)' }}>Contraseña</label>
                <Link to="/forgot-password" className="text-xs font-medium transition-colors"
                  style={{ color: 'rgba(212,175,55,0.6)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(212,175,55,0.6)'; }}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input
                  type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña" autoComplete="current-password" required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" /> Iniciando...</>
                : <><span>Iniciar sesión</span><ArrowRight size={15} /></>}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-semibold transition-colors" style={{ color: '#D4AF37' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFD700'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'; }}>
            Regístrate gratis
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.07 0-3.83-1.4-4.46-3.29H1.87v2.07A8 8 0 0 0 8.98 17z" />
      <path fill="#FBBC05" d="M4.52 10.53c-.16-.48-.25-.98-.25-1.53s.09-1.05.25-1.53V5.4H1.87A8 8 0 0 0 .98 9c0 1.29.31 2.51.89 3.6l2.65-2.07z" />
      <path fill="#EA4335" d="M8.98 3.58c1.16 0 2.2.4 3.02 1.19l2.26-2.26A8 8 0 0 0 .98 9l2.54 1.97C4.15 5 6.28 3.58 8.98 3.58z" />
    </svg>
  );
}
