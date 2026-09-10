import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle2, XCircle, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/state/authStore';
import { useStore } from '@/state/store';
import { cn } from '@/utils/cn';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

interface PasswordStrength { score: number; label: string; color: string; }

function checkPassword(pass: string): PasswordStrength {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Muy débil', color: '#f43f5e' },
    { score: 2, label: 'Débil', color: '#f59e0b' },
    { score: 3, label: 'Buena', color: '#10b981' },
    { score: 4, label: 'Excelente', color: '#D4AF37' },
  ][score];
}

declare global { interface Window { google: any; } }

/* ── shared input style helper ── */
const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};
const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)';
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
  e.currentTarget.style.boxShadow = 'none';
};

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, isAuthenticated } = useAuthStore();
  const syncWithAuthUser = useStore((s) => s.syncWithAuthUser);

  const googleCredential = (location.state as any)?.googleCredential as string | undefined;
  const fromGoogle = (location.state as any)?.fromGoogle as boolean | undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = checkPassword(password);

  useEffect(() => { if (isAuthenticated) navigate('/', { replace: true }); }, [isAuthenticated]);

  // ── Google button click ───────────────────────────────────────────────────
  const handleGoogleClick = () => {
    if (!acceptTerms) { setError('Acepta los términos y condiciones para continuar con Google.'); return; }
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
          setLoading(true);
          try {
            const res = await authApi.loginWithGoogleCode(response.code, true, '1.0');
            if (!res.success) { setError(res.error || 'Error con Google.'); return; }
            setAuth(res.data.user, res.data.accessToken);
            syncWithAuthUser(res.data.user);
            navigate('/');
          } catch { setError('Error conectando con Google.'); }
          finally { setLoading(false); }
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

  const handleGoogleWithTerms = async () => {
    if (!acceptTerms) { setError('Debes aceptar los términos.'); return; }
    if (!googleCredential) return;
    setLoading(true); setError('');
    try {
      const res = await authApi.loginWithGoogle(googleCredential, true, '1.0');
      if (!res.success) { setError(res.error || 'Error con Google.'); return; }
      setAuth(res.data.user, res.data.accessToken);
      syncWithAuthUser(res.data.user);
      navigate('/');
    } catch { setError('Error conectando con Google.'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!name.trim()) { setError('El nombre es requerido.'); return; }
    if (!email) { setError('El email es requerido.'); return; }
    if (password.length < 8) { setError('La contraseña debe tener mínimo 8 caracteres.'); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos una mayúscula y un número.'); return;
    }
    if (password !== confirmPass) { setError('Las contraseñas no coinciden.'); return; }
    if (!acceptTerms) { setError('Debes aceptar los términos y condiciones.'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password, acceptedTerms: true, termsVersion: '1.0' });
      if (!res.success) { setError(res.error || 'Error al registrar.'); return; }
      setAuth(res.data.user, res.data.accessToken);
      syncWithAuthUser(res.data.user);
      navigate('/');
    } catch { setError('Error de conexión. Verifica tu internet.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #323232 0%, #2a2a2a 50%, #282828 100%)' }}>

      {/* ── Background ── */}
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
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors font-medium">
          <ArrowLeft size={13} />
          Volver al inicio
        </Link>

        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex flex-col items-center gap-3 group">
            <img src={logo} alt="Finlytech" className="h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
            <img src={eslogan} alt="eslogan" className="h-7 w-auto object-contain opacity-80 group-hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-xl font-bold mt-4 text-zinc-100">
            {fromGoogle ? 'Acepta los términos' : 'Crea tu cuenta'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {fromGoogle ? 'Un último paso para continuar con Google' : 'Empieza a controlar tus finanzas'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}
        >
          {/* Error */}
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

          {fromGoogle ? (
            /* ── Google terms flow ── */
            <div className="space-y-4">
              <TermsCheckbox accepted={acceptTerms} onChange={setAcceptTerms} onView={() => setShowTerms(true)} />
              <motion.button
                onClick={handleGoogleWithTerms} disabled={loading || !acceptTerms}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />Procesando...</>
                  : <><CheckCircle2 size={14} />Continuar con Google</>}
              </motion.button>
            </div>
          ) : (
            <>
              {/* Google button — pure React button, no DOM injection */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e4e4e7' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.11)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; }}
              >
                <GoogleIcon />
                Registrarse con Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-xs text-zinc-600 font-medium">o con email</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <FieldWrapper label="Nombre completo">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre" autoComplete="name" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </FieldWrapper>

                {/* Email */}
                <FieldWrapper label="Email">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com" autoComplete="email" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                </FieldWrapper>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>Contraseña</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 8 caracteres" required
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                      style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {/* Strength */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }} />
                        ))}
                      </div>
                      <p className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <FieldWrapper label="Confirmar contraseña">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input type={showPass ? 'text' : 'password'} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repite tu contraseña" required
                    className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                    style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                  {confirmPass && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {password === confirmPass
                        ? <CheckCircle2 size={14} className="text-emerald-400" />
                        : <XCircle size={14} className="text-rose-400" />}
                    </span>
                  )}
                </FieldWrapper>

                <TermsCheckbox accepted={acceptTerms} onChange={setAcceptTerms} onView={() => setShowTerms(true)} />

                <motion.button
                  type="submit" disabled={loading || !acceptTerms}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />Creando cuenta...</>
                    : <><span>Crear cuenta</span><ArrowRight size={15} /></>}
                </motion.button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-zinc-600 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: '#D4AF37' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFD700'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#D4AF37'; }}>
            Inicia sesión
          </Link>
        </p>
      </motion.div>

      {/* Terms modal */}
      {showTerms && (
        <TermsModal onClose={() => setShowTerms(false)} onAccept={() => { setAcceptTerms(true); setShowTerms(false); }} />
      )}
    </div>
  );
}

/* ── Field wrapper ── */
function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
        {label}
      </label>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ── Terms checkbox ── */
function TermsCheckbox({ accepted, onChange, onView }: { accepted: boolean; onChange: (v: boolean) => void; onView: () => void }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!accepted)}
        className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
        style={{
          background: accepted ? 'linear-gradient(135deg, #D4AF37, #F59E0B)' : 'transparent',
          border: accepted ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {accepted && <CheckCircle2 size={11} className="text-[#1a1a1a]" />}
      </div>
      <span className="text-sm text-zinc-500 leading-relaxed">
        Acepto los{' '}
        <button type="button" onClick={onView} className="font-semibold transition-colors" style={{ color: '#D4AF37' }}>
          Términos y Condiciones
        </button>{' '}
        y la{' '}
        <button type="button" onClick={onView} className="font-semibold transition-colors" style={{ color: '#D4AF37' }}>
          Política de Privacidad
        </button>{' '}
        de Finlytech.
      </span>
    </label>
  );
}

/* ── Terms modal ── */
function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-3xl max-h-[80vh] flex flex-col"
        style={{
          background: 'rgba(40,40,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 className="text-base font-bold text-zinc-100">Términos y Condiciones</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all">✕</button>
        </div>
        <div className="overflow-y-auto p-5 space-y-4 flex-1 text-sm text-zinc-400 leading-relaxed">
          <p className="text-xs text-zinc-600">Versión 1.0 · Efectivos desde el 1 de septiembre de 2026</p>
          {[
            ['1. Aceptación', 'Al crear una cuenta en Finlytech, aceptas estos Términos en su totalidad. Si no estás de acuerdo, no uses el servicio.'],
            ['2. Descripción', 'Finlytech es una app de gestión financiera personal. No somos una entidad financiera ni proveemos asesoramiento profesional.'],
            ['3. Privacidad', 'Tu información es privada. Nunca la compartiremos sin tu consentimiento. Puedes eliminar tu cuenta y datos en cualquier momento.'],
            ['4. Responsabilidad', 'Eres responsable de la confidencialidad de tu contraseña. Finlytech no responde por accesos no autorizados por negligencia tuya.'],
            ['5. Disponibilidad', 'El servicio se provee "tal cual". No garantizamos disponibilidad ininterrumpida. Los mantenimientos se anuncian con anticipación.'],
            ['6. Propiedad intelectual', 'Todo el contenido y código de Finlytech está protegido por derechos de autor.'],
            ['7. Modificaciones', 'Podemos modificar estos términos con 15 días de anticipación en cambios significativos.'],
            ['8. Contacto', 'soporte@finlytech.app'],
          ].map(([t, b]) => (
            <div key={t}>
              <p className="font-bold text-zinc-200 mb-1">{t}</p>
              <p>{b}</p>
            </div>
          ))}
        </div>
        <div className="p-5 flex gap-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-zinc-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; }}>
            Cerrar
          </button>
          <button onClick={onAccept}
            className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 14px rgba(212,175,55,0.3)' }}>
            Acepto los términos
          </button>
        </div>
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
