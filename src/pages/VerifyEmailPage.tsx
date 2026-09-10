import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/logo/logofynlytech.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function VerifyEmailPage() {
    const [params] = useSearchParams();
    const token = params.get('token') ?? '';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) { setStatus('error'); setMessage('Token de verificación no encontrado.'); return; }

        fetch(`${API}/api/password/verify-email?token=${token}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) { setStatus('success'); setMessage(d.message || '¡Email verificado!'); }
                else { setStatus('error'); setMessage(d.error || 'Error verificando el email.'); }
            })
            .catch(() => { setStatus('error'); setMessage('Error de conexión.'); });
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #323232 0%, #2a2a2a 50%, #282828 100%)' }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 70%)' }} />
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10 text-center"
            >
                <Link to="/"><img src={logo} alt="Finlytech" className="h-14 w-auto object-contain mx-auto mb-8" /></Link>

                <div className="rounded-2xl p-8 space-y-5"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>

                    {status === 'loading' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <Loader2 size={40} className="text-yellow-400 animate-spin mx-auto" />
                            <p className="text-zinc-400 text-sm">Verificando tu email...</p>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-100">¡Email verificado! ✓</h2>
                            <p className="text-sm text-zinc-400">{message}</p>
                            <p className="text-sm text-zinc-500">Tu cuenta está completamente activada.</p>
                            <Link to="/"
                                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm mt-2"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a' }}>
                                Ir a mi dashboard
                            </Link>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                                style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)' }}>
                                <XCircle size={32} className="text-rose-400" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-100">Enlace inválido</h2>
                            <p className="text-sm text-zinc-400">{message}</p>
                            <Link to="/"
                                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-sm"
                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#e4e4e7' }}>
                                Volver al inicio
                            </Link>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
