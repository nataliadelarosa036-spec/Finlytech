import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
    ArrowRight, CheckCircle2, Sparkles, Star,
    Zap, Shield, BotMessageSquare, TrendingUp, Crown,
} from 'lucide-react';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

const NAV_LINKS = ['Inicio', 'Características', 'Planes', 'Preguntas frecuentes'];
const NAV_ROUTES: Record<string, string> = {
    'Inicio': '/',
    'Características': '/features',
    'Planes': '/plans',
    'Preguntas frecuentes': '/faq',
};

const FREE_FEATURES = [
    'Control de movimientos ilimitado',
    'Categorías automáticas',
    'Metas de ahorro (hasta 3)',
    'Deudas y tarjetas de crédito',
    'Dashboard con métricas clave',
    'Presupuestos mensuales',
    'Alertas y recordatorios básicos',
    'Acceso web y móvil',
];

const PRO_FEATURES = [
    'Todo lo del plan Gratis',
    'Copiloto IA ilimitado',
    'Metas de ahorro ilimitadas',
    'Portafolio de inversiones',
    'Simulador financiero',
    'Exportación CSV y PDF',
    'Análisis avanzado de tendencias',
    'Suscripciones y gastos fijos',
    'Reportes personalizados',
    'Soporte prioritario',
];

const faqs = [
    { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí, puedes actualizar o bajar tu plan cuando quieras. Si bajas de Pro a Gratis, conservas tu historial pero pierdes acceso a las funciones Pro.' },
    { q: '¿Hay un periodo de prueba del plan Pro?', a: 'Sí, ofrecemos 14 días gratis del plan Pro sin necesidad de tarjeta de crédito. Puedes probar todas las funciones sin compromiso.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), PSE y efectivo a través de nuestros aliados.' },
    { q: '¿Mis datos están seguros?', a: 'Absolutamente. No vinculamos tu cuenta bancaria. Todos tus datos se cifran y nunca se comparten con terceros.' },
];

export function PlansPage() {
    const [annual, setAnnual] = useState(true);
    const monthlyPrice = 19900;
    const annualPrice = 14900;
    const displayPrice = annual ? annualPrice : monthlyPrice;

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%)' }} />
                </div>
                <div className="absolute inset-0 opacity-[0.035]" style={{
                    backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />
            </div>

            {/* ── Navbar ── */}
            <motion.nav initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 px-6 md:px-12 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3"
                    style={{ background: 'rgba(20,20,20,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <img src={logo} alt="Finlytech" className="h-12 w-auto object-contain" />
                        <img src={eslogan} alt="eslogan" className="h-8 w-auto object-contain opacity-85 hidden sm:block" />
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((item) => (
                            <Link key={item} to={NAV_ROUTES[item]}
                                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${item === 'Planes' ? 'text-amber-400 bg-amber-400/[0.08]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'}`}>
                                {item}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/login" className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium rounded-xl hover:bg-white/[0.05]">
                            Iniciar sesión
                        </Link>
                        <Link to="/register">
                            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,175,55,0.4)' }} whileTap={{ scale: 0.96 }}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 2px 12px rgba(212,175,55,0.3)' }}>
                                Comenzar gratis <ArrowRight size={13} />
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* ── Hero ── */}
            <section className="relative z-10 px-6 md:px-12 pt-16 pb-12 text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}>
                        <Sparkles size={12} className="text-amber-400" />
                        <span className="text-amber-400 text-xs tracking-widest uppercase font-bold">Planes y precios</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                        Simple y transparente.
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            Sin sorpresas.
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Empieza gratis, actualiza cuando lo necesites. Sin tarjeta, sin compromiso.
                    </p>

                    {/* Toggle anual / mensual */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <span className={`text-sm font-medium transition-colors ${!annual ? 'text-zinc-100' : 'text-zinc-500'}`}>Mensual</span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className="relative w-12 h-6 rounded-full transition-colors"
                            style={{ background: annual ? 'linear-gradient(90deg, #D4AF37, #F59E0B)' : 'rgba(255,255,255,0.1)' }}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${annual ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span className={`text-sm font-medium transition-colors ${annual ? 'text-zinc-100' : 'text-zinc-500'}`}>
                            Anual
                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                -25%
                            </span>
                        </span>
                    </div>
                </motion.div>
            </section>

            {/* ── Plans ── */}
            <section className="relative z-10 px-6 md:px-12 pb-24">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">

                    {/* Free */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="p-8 rounded-3xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                <Shield size={18} className="text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Plan</p>
                                <h3 className="text-xl font-bold">Gratis</h3>
                            </div>
                        </div>
                        <div className="mb-6">
                            <p className="text-5xl font-bold">$0</p>
                            <p className="text-sm text-zinc-500 mt-1">Para siempre, sin tarjeta.</p>
                        </div>
                        <Link to="/register" className="block w-full">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 font-bold rounded-2xl text-sm text-zinc-300 transition-all"
                                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>
                                Comenzar gratis
                            </motion.button>
                        </Link>
                        <div className="mt-7 space-y-3">
                            {FREE_FEATURES.map((f, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <CheckCircle2 size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                                    <span className="text-sm text-zinc-400">{f}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pro */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.12 }}
                        className="relative p-8 rounded-3xl overflow-hidden"
                        style={{
                            background: 'linear-gradient(145deg, rgba(212,175,55,0.08) 0%, rgba(20,20,20,0.9) 100%)',
                            border: '1px solid rgba(212,175,55,0.3)',
                            boxShadow: '0 0 60px rgba(212,175,55,0.08)',
                        }}
                    >
                        {/* Top glow line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)' }} />

                        {/* Popular badge */}
                        <div className="absolute top-5 right-5 flex items-center gap-1 px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                            <Star size={9} fill="#D4AF37" className="text-amber-500" />
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Popular</span>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                                <Crown size={18} className="text-amber-400" />
                            </div>
                            <div>
                                <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider">Plan</p>
                                <h3 className="text-xl font-bold text-amber-400">Pro</h3>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-end gap-2">
                                <p className="text-5xl font-bold">${displayPrice.toLocaleString('es-CO')}</p>
                                <p className="text-sm text-zinc-500 mb-2">/ mes</p>
                            </div>
                            {annual && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Facturado como{' '}
                                    <span className="text-amber-400 font-semibold">
                                        ${(annualPrice * 12).toLocaleString('es-CO')} / año
                                    </span>
                                </p>
                            )}
                            <p className="text-xs text-emerald-400 mt-1 font-medium">14 días gratis · sin tarjeta</p>
                        </div>

                        <Link to="/register" className="block w-full">
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(212,175,55,0.45)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 font-bold rounded-2xl text-sm transition-all inline-flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.35)' }}>
                                <Zap size={14} />
                                Probar Pro gratis
                            </motion.button>
                        </Link>

                        <div className="mt-7 space-y-3">
                            {PRO_FEATURES.map((f, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <CheckCircle2 size={14} className={`shrink-0 mt-0.5 ${i === 0 ? 'text-zinc-600' : 'text-amber-500'}`} />
                                    <span className={`text-sm ${i === 0 ? 'text-zinc-500' : 'text-zinc-300'}`}>{f}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Comparación rápida */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-4xl mx-auto mt-8 p-6 rounded-2xl text-center"
                    style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
                >
                    <div className="flex flex-wrap justify-center items-center gap-6">
                        {[
                            { icon: <Shield size={14} className="text-amber-400" />, text: 'Sin banco vinculado' },
                            { icon: <BotMessageSquare size={14} className="text-amber-400" />, text: 'IA integrada' },
                            { icon: <TrendingUp size={14} className="text-amber-400" />, text: 'Análisis en tiempo real' },
                            { icon: <Shield size={14} className="text-emerald-400" />, text: '100% privado' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                {item.icon}
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* ── FAQ ── */}
            <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-12">
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-3">Preguntas frecuentes</p>
                        <h2 className="text-3xl md:text-4xl font-bold">¿Tienes dudas sobre los planes?</h2>
                    </motion.div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.08 }}
                                className="p-6 rounded-2xl"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <h4 className="text-sm font-bold text-zinc-200 mb-2">{faq.q}</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <p className="text-zinc-500 text-sm">¿Más preguntas?{' '}
                            <Link to="/faq" className="text-amber-400 hover:underline font-medium">Ver todas las preguntas frecuentes →</Link>
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src={logo} alt="Finlytech" className="h-9 w-auto object-contain opacity-50" />
                    <p className="text-xs text-zinc-600">© 2026 Finlytech · Hecho con intención.</p>
                    <div className="flex gap-6 text-xs text-zinc-600">
                        <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="hover:text-amber-400 transition-colors">Términos</Link>
                        <Link to="/contact" className="hover:text-amber-400 transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
