import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ArrowRight, BarChart2, Target, CreditCard, TrendingUp,
    BotMessageSquare, Zap, Shield, Smartphone, PieChart,
    Bell, RefreshCw, Lock, Download, Globe, ChevronRight,
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

const features = [
    {
        icon: <BarChart2 size={24} className="text-amber-400" />,
        color: 'rgba(212,175,55,0.12)',
        border: 'rgba(212,175,55,0.25)',
        tag: 'Core',
        tagColor: '#D4AF37',
        title: 'Control de movimientos',
        desc: 'Registra ingresos y gastos en segundos. Categorías inteligentes que aprenden de tus hábitos. Vista diaria, semanal y mensual con filtros avanzados.',
        bullets: ['Categorías automáticas por IA', 'Historial ilimitado', 'Búsqueda y filtros potentes', 'Adjunta fotos de recibos'],
    },
    {
        icon: <Target size={24} className="text-emerald-400" />,
        color: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        tag: 'Core',
        tagColor: '#10b981',
        title: 'Metas de ahorro',
        desc: 'Crea objetivos con fecha y monto. Visualiza tu progreso en tiempo real y recibe alertas cuando estés cerca de alcanzarlos.',
        bullets: ['Múltiples metas simultáneas', 'Proyección de fecha de cumplimiento', 'Aportes manuales o automáticos', 'Historial de aportes'],
    },
    {
        icon: <CreditCard size={24} className="text-blue-400" />,
        color: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
        tag: 'Core',
        tagColor: '#3b82f6',
        title: 'Deudas y tarjetas',
        desc: 'Lleva el control de tus tarjetas de crédito, préstamos y cuotas. Nunca más olvides una fecha de pago.',
        bullets: ['Fecha de corte y pago', 'Cupo disponible y utilizado', 'Cálculo de intereses', 'Recordatorios de pago'],
    },
    {
        icon: <TrendingUp size={24} className="text-violet-400" />,
        color: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.25)',
        tag: 'Pro',
        tagColor: '#a78bfa',
        title: 'Portafolio de inversiones',
        desc: 'Registra tus acciones, fondos, CDTs y criptomonedas. Ve el rendimiento de tu portafolio en tiempo real.',
        bullets: ['Múltiples tipos de activos', 'Seguimiento de rendimiento', 'Dividendos e intereses', 'Análisis de rentabilidad'],
    },
    {
        icon: <BotMessageSquare size={24} className="text-pink-400" />,
        color: 'rgba(236,72,153,0.12)',
        border: 'rgba(236,72,153,0.25)',
        tag: 'IA',
        tagColor: '#f472b6',
        title: 'Copiloto financiero IA',
        desc: 'Tu asistente inteligente que analiza tus patrones y te da recomendaciones personalizadas para mejorar tu salud financiera.',
        bullets: ['Alertas de gastos inusuales', 'Sugerencias de ahorro', 'Análisis de tendencias', 'Chat en lenguaje natural'],
    },
    {
        icon: <Zap size={24} className="text-orange-400" />,
        color: 'rgba(249,115,22,0.12)',
        border: 'rgba(249,115,22,0.25)',
        tag: 'Pro',
        tagColor: '#fb923c',
        title: 'Simulador financiero',
        desc: '¿Puedo comprar eso? Simula el impacto de una compra, crédito o inversión antes de tomar la decisión.',
        bullets: ['Simulación de créditos', 'Cálculo de capacidad de pago', 'Proyección de ahorro', 'Escenarios comparativos'],
    },
    {
        icon: <PieChart size={24} className="text-cyan-400" />,
        color: 'rgba(6,182,212,0.12)',
        border: 'rgba(6,182,212,0.25)',
        tag: 'Core',
        tagColor: '#22d3ee',
        title: 'Presupuestos inteligentes',
        desc: 'Define límites de gasto por categoría. Recibe alertas en tiempo real cuando te acerques a tu límite mensual.',
        bullets: ['Límites por categoría', 'Alertas personalizables', 'Comparación mes a mes', 'Sugerencias automáticas'],
    },
    {
        icon: <Bell size={24} className="text-yellow-400" />,
        color: 'rgba(234,179,8,0.12)',
        border: 'rgba(234,179,8,0.25)',
        tag: 'Core',
        tagColor: '#facc15',
        title: 'Alertas y recordatorios',
        desc: 'Mantente al día con notificaciones inteligentes sobre pagos, metas y movimientos importantes.',
        bullets: ['Recordatorios de pagos', 'Alertas de presupuesto', 'Notificaciones de metas', 'Resumen semanal automático'],
    },
    {
        icon: <RefreshCw size={24} className="text-teal-400" />,
        color: 'rgba(20,184,166,0.12)',
        border: 'rgba(20,184,166,0.25)',
        tag: 'Pro',
        tagColor: '#2dd4bf',
        title: 'Suscripciones y gastos fijos',
        desc: 'Registra y controla todos tus gastos recurrentes en un solo lugar. Netflix, Spotify, gimnasio y más.',
        bullets: ['Lista de suscripciones activas', 'Próximos cobros', 'Costo anual consolidado', 'Sugerencias de ahorro'],
    },
];

const extras = [
    { icon: <Lock size={16} className="text-amber-400" />, label: '100% privado, sin banco vinculado' },
    { icon: <Download size={16} className="text-amber-400" />, label: 'Exporta tus datos en CSV o PDF' },
    { icon: <Globe size={16} className="text-amber-400" />, label: 'Disponible en web, iOS y Android' },
    { icon: <Shield size={16} className="text-amber-400" />, label: 'Cifrado de extremo a extremo' },
    { icon: <Smartphone size={16} className="text-amber-400" />, label: 'Sincronización en todos tus dispositivos' },
    { icon: <RefreshCw size={16} className="text-amber-400" />, label: 'Actualizaciones continuas sin costo' },
];

export function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 right-0 w-[700px] h-[700px]">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%)' }} />
                </div>
                <div className="absolute inset-0 opacity-[0.035]" style={{
                    backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />
            </div>

            {/* ── Navbar ── */}
            <motion.nav
                initial={{ y: -70, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 px-6 md:px-12 py-4"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3"
                    style={{ background: 'rgba(20,20,20,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <img src={logo} alt="Finlytech" className="h-12 w-auto object-contain" />
                        <img src={eslogan} alt="eslogan" className="h-8 w-auto object-contain opacity-85 hidden sm:block" />
                    </Link>
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((item) => (
                            <Link key={item} to={NAV_ROUTES[item]}
                                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${item === 'Características' ? 'text-amber-400 bg-amber-400/[0.08]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'}`}>
                                {item}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link to="/login" className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium rounded-xl hover:bg-white/[0.05]">
                            Iniciar sesión
                        </Link>
                        <Link to="/register">
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,175,55,0.4)' }}
                                whileTap={{ scale: 0.96 }}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 2px 12px rgba(212,175,55,0.3)' }}>
                                Comenzar gratis <ArrowRight size={13} />
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* ── Hero ── */}
            <section className="relative z-10 px-6 md:px-12 pt-16 pb-20 text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}>
                        <span className="text-amber-400 text-xs">✦</span>
                        <span className="text-amber-400 text-xs tracking-widest uppercase font-bold">Características</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                        Todo lo que necesitas
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            para dominar tu dinero
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed">
                        Herramientas diseñadas para que tomes decisiones financieras más inteligentes, sin bancos vinculados y sin complicaciones.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Link to="/register">
                            <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(212,175,55,0.45)' }} whileTap={{ scale: 0.96 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}>
                                Empieza gratis <ArrowRight size={14} />
                            </motion.button>
                        </Link>
                        <Link to="/plans">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-medium rounded-2xl text-sm text-zinc-300"
                                style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                                Ver planes <ChevronRight size={14} />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ── Features grid ── */}
            <section className="relative z-10 px-6 md:px-12 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ duration: 0.5, delay: i * 0.06 }}
                                whileHover={{ y: -4, borderColor: feat.border } as any}
                                className="group p-7 rounded-2xl transition-all duration-300"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ background: feat.color, border: `1px solid ${feat.border}` }}>
                                        {feat.icon}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                        style={{ background: `${feat.tagColor}18`, color: feat.tagColor, border: `1px solid ${feat.tagColor}30` }}>
                                        {feat.tag}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold mb-2 group-hover:text-amber-400 transition-colors">{feat.title}</h3>
                                <p className="text-sm text-zinc-500 leading-relaxed mb-4">{feat.desc}</p>
                                <ul className="space-y-1.5">
                                    {feat.bullets.map((b, j) => (
                                        <li key={j} className="flex items-center gap-2 text-xs text-zinc-500">
                                            <div className="w-1 h-1 rounded-full shrink-0" style={{ background: feat.tagColor }} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Extras ── */}
            <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-12">
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-3">Y además</p>
                        <h2 className="text-3xl md:text-4xl font-bold">Diseñado para darte <span className="text-amber-400">tranquilidad</span></h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {extras.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
                                className="flex items-center gap-3 p-4 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    {item.icon}
                                </div>
                                <span className="text-sm text-zinc-300 font-medium">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="relative z-10 px-6 md:px-12 py-24 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-4xl md:text-5xl font-bold">Listo para empezar?</h2>
                    <p className="text-zinc-400">Crea tu cuenta gratis y empieza a controlar tus finanzas hoy mismo.</p>
                    <Link to="/register">
                        <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(212,175,55,0.5)' }} whileTap={{ scale: 0.96 }}
                            className="inline-flex items-center gap-2 px-10 py-4 font-bold rounded-2xl text-base"
                            style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 6px 24px rgba(212,175,55,0.35)' }}>
                            Crear cuenta gratis <ArrowRight size={16} />
                        </motion.button>
                    </Link>
                </motion.div>
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
