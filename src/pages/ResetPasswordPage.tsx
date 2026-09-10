import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/logo/logofynlytech.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function checkPassword(pass: string) {
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

export function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const strength = checkPassword(password);

    useEffect(() => {
        if (!token) { setValidating(false); return; }
        fetch(`${API}/api/password/verify-reset?token=${token}`)
            .then(r => r.json())
            .then(d => { setTokenValid(d.success); })
            .catch(() => setTokenValid(false))
            .finally(() => setValidating(false));
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        if (password.length < 8) { setError('La contraseña debe tener mínimo 8 caracteres.'); return; }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) { setError('Debe tener al menos una mayúscula y un número.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

        setLoading(true);
        try {
            const res = await fetch(`${API}/api/password/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (data.success) {
                setDone(true);
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError(data.error || 'Error restableciendo la contraseña.');
            }
        } catch {
            setError('Error de conexión. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const bg = (
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
            <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
            }} />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #323232 0%, #2a2a2a 50%, #282828 100%)' }}>
            {bg}

            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/"><img src={logo} alt="Finlytech" className="h-14 w-auto object-contain mx-auto" /></Link>
                </div>

                <div className="rounded-2xl p-7"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

                    <AnimatePresence mode="wait">
                        {validating && (
                            <motion.div key="loading" className="text-center py-8">
                                <div className="w-8 h-8 border-2 border-zinc-600 border-t-yellow-400 rounded-full animate-spin mx-auto" />
                                <p className="text-sm text-zinc-500 mt-4">Verificando enlace...</p>
                            </motion.div>
                        )}

                        {!validating && !tokenValid && (
                            <motion.div key="invalid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                    style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)' }}>
                                    <XCircle size={32} className="text-rose-400" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-100">Enlace inválido o expirado</h2>
                                <p className="text-sm text-zinc-400">Este enlace ya fue usado o venció. Solicita uno nuevo.</p>
                                <Link to="/forgot-password"
                                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm mt-2"
                                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a' }}>
                                    Solicitar nuevo enlace
                                </Link>
                            </motion.div>
                        )}

                        {!validating && tokenValid && !done && (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-bold text-zinc-100 mb-2">Nueva contraseña</h2>
                                <p className="text-sm text-zinc-400 mb-6">Elige una contraseña segura para tu cuenta.</p>

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2.5 p-3 rounded-xl mb-4"
                                        style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
                                        <AlertCircle size={14} className="text-rose-400 shrink-0" />
                                        <p className="text-sm text-rose-400">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Password */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>Nueva contraseña</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                            <input
                                                type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Mín. 8 caracteres" required
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
                                        {password && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                                                            style={{ background: i <= (strength?.score ?? 0) ? strength?.color : 'rgba(255,255,255,0.08)' }} />
                                                    ))}
                                                </div>
                                                {strength?.label && <p className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm */}
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>Confirmar contraseña</label>
                                        <div className="relative">
                                            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                                            <input
                                                type={showPass ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                                placeholder="Repite tu contraseña" required
                                                className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)'; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                            />
                                            {confirm && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {password === confirm ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.35)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                                    >
                                        {loading
                                            ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />Guardando...</>
                                            : <><span>Guardar contraseña</span><ArrowRight size={15} /></>}
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}

                        {done && (
                            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-100">¡Contraseña actualizada!</h2>
                                <p className="text-sm text-zinc-400">Serás redirigido al login en unos segundos...</p>
                                <Link to="/login"
                                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm"
                                    style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a' }}>
                                    Ir al login ahora
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
