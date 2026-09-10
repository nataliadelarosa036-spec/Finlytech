import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/logo/logofynlytech.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { setError('Ingresa tu email.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/api/password/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSent(true);
            } else {
                setError(data.error || 'Error enviando el correo.');
            }
        } catch {
            setError('Error de conexión. Verifica tu internet.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #323232 0%, #2a2a2a 50%, #282828 100%)' }}
        >
            {/* Background */}
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

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6 transition-colors font-medium">
                    <ArrowLeft size={13} /> Volver al login
                </Link>

                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <img src={logo} alt="Finlytech" className="h-14 w-auto object-contain mx-auto" />
                    </Link>
                </div>

                <div
                    className="rounded-2xl p-7"
                    style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                    }}
                >
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4 space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                                <h2 className="text-xl font-bold text-zinc-100">Revisa tu email</h2>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Si <span className="text-zinc-200 font-medium">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                                </p>
                                <p className="text-xs text-zinc-600">El enlace vence en 1 hora. Revisa también tu carpeta de spam.</p>
                                <div className="pt-2">
                                    <button
                                        onClick={() => { setSent(false); setEmail(''); }}
                                        className="text-sm font-medium transition-colors"
                                        style={{ color: 'rgba(212,175,55,0.7)' }}
                                    >
                                        Intentar con otro email
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-bold text-zinc-100 mb-2">¿Olvidaste tu contraseña?</h2>
                                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                    Ingresa tu email y te enviaremos un enlace para restablecerla.
                                </p>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-2.5 p-3 rounded-xl mb-4"
                                        style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}
                                    >
                                        <AlertCircle size={14} className="text-rose-400 shrink-0" />
                                        <p className="text-sm text-rose-400">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                            Email
                                        </label>
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

                                    <motion.button
                                        type="submit" disabled={loading}
                                        whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.35)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                                    >
                                        {loading
                                            ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" />Enviando...</>
                                            : <><span>Enviar enlace</span><ArrowRight size={15} /></>}
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
