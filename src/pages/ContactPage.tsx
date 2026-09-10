import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MessageCircle, ArrowLeft, CheckCircle2, Send, HelpCircle, Shield, Zap } from 'lucide-react';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

const NAV_LINKS = ['Inicio', 'Características', 'Planes', 'Preguntas frecuentes'];
const NAV_ROUTES: Record<string, string> = {
    'Inicio': '/',
    'Características': '/features',
    'Planes': '/plans',
    'Preguntas frecuentes': '/faq',
};

const CHANNELS = [
    {
        icon: <Mail size={20} className="text-amber-400" />,
        color: 'rgba(212,175,55,0.12)',
        border: 'rgba(212,175,55,0.25)',
        title: 'Soporte general',
        desc: 'Para preguntas sobre el uso de la plataforma, problemas con tu cuenta o cualquier consulta.',
        action: 'soporte@finlytech.app',
        href: 'mailto:soporte@finlytech.app',
        time: 'Respuesta en < 24 horas',
    },
    {
        icon: <Shield size={20} className="text-blue-400" />,
        color: 'rgba(59,130,246,0.12)',
        border: 'rgba(59,130,246,0.25)',
        title: 'Privacidad y datos',
        desc: 'Para solicitudes de eliminación de datos, acceso a tu información o cualquier consulta de privacidad.',
        action: 'privacidad@finlytech.app',
        href: 'mailto:privacidad@finlytech.app',
        time: 'Respuesta en < 24 horas',
    },
    {
        icon: <Zap size={20} className="text-violet-400" />,
        color: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.25)',
        title: 'Reportar un problema',
        desc: 'Encontraste un bug, un error de cálculo o algo que no funciona como esperabas.',
        action: 'bugs@finlytech.app',
        href: 'mailto:bugs@finlytech.app',
        time: 'Respuesta en < 48 horas',
    },
    {
        icon: <HelpCircle size={20} className="text-emerald-400" />,
        color: 'rgba(16,185,129,0.12)',
        border: 'rgba(16,185,129,0.25)',
        title: 'Asuntos legales',
        desc: 'Para consultas sobre términos, condiciones, licencias o propiedad intelectual.',
        action: 'legal@finlytech.app',
        href: 'mailto:legal@finlytech.app',
        time: 'Respuesta en < 48 horas',
    },
];

const TOPICS = [
    'Problema técnico',
    'Duda sobre una función',
    'Mi cuenta o contraseña',
    'Facturación o planes',
    'Privacidad y datos',
    'Sugerencia o feedback',
    'Otro',
];

export function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [topic, setTopic] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !topic || !message) return;
        setLoading(true);
        // Simulate send (in production connect to a real endpoint)
        await new Promise((r) => setTimeout(r, 1200));
        setLoading(false);
        setSent(true);
    };

    const inputBase = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
    };
    const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.08)';
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.boxShadow = 'none';
    };

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px]">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 65%)' }} />
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }} />
            </div>

            {/* Navbar */}
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
                                className="px-3.5 py-2 text-sm font-medium rounded-xl transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]">
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
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 2px 12px rgba(212,175,55,0.3)' }}>
                                Comenzar gratis <ArrowRight size={13} />
                            </motion.button>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero */}
            <section className="relative z-10 px-6 md:px-12 pt-14 pb-10 text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-8 transition-colors font-medium">
                        <ArrowLeft size={13} /> Volver al inicio
                    </Link>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}>
                        <MessageCircle size={12} className="text-amber-400" />
                        <span className="text-amber-400 text-xs tracking-widest uppercase font-bold">Contáctanos</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
                        Estamos aquí para{' '}
                        <span style={{
                            background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>ayudarte</span>
                    </h1>
                    <p className="text-zinc-400 leading-relaxed">
                        Nuestro equipo responde rápido. Elige el canal que más te convenga o usa el formulario de contacto.
                    </p>
                </motion.div>
            </section>

            {/* Channels */}
            <section className="relative z-10 px-6 md:px-12 pb-16">
                <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CHANNELS.map((ch, i) => (
                        <motion.a
                            key={i}
                            href={ch.href}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.45, delay: i * 0.07 }}
                            whileHover={{ y: -4 }}
                            className="block p-5 rounded-2xl transition-all"
                            style={{ background: ch.color, border: `1px solid ${ch.border}` }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: ch.color, border: `1px solid ${ch.border}` }}>
                                {ch.icon}
                            </div>
                            <h3 className="text-sm font-bold mb-1">{ch.title}</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-3">{ch.desc}</p>
                            <p className="text-xs font-semibold text-amber-400 break-all">{ch.action}</p>
                            <p className="text-[10px] text-zinc-600 mt-1">{ch.time}</p>
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Contact Form */}
            <section className="relative z-10 px-6 md:px-12 pb-24">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="text-center mb-10"
                    >
                        <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-2">Formulario de contacto</p>
                        <h2 className="text-2xl md:text-3xl font-bold">O escríbenos directamente</h2>
                    </motion.div>

                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="p-10 rounded-3xl text-center"
                            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">¡Mensaje enviado!</h3>
                            <p className="text-zinc-400 text-sm">Te responderemos a <strong className="text-zinc-300">{email}</strong> en menos de 24 horas.</p>
                            <button
                                onClick={() => { setSent(false); setName(''); setEmail(''); setTopic(''); setMessage(''); }}
                                className="mt-6 text-sm text-amber-400 hover:underline font-medium"
                            >
                                Enviar otro mensaje
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}
                            onSubmit={handleSubmit}
                            className="p-7 rounded-3xl space-y-5"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <div className="grid sm:grid-cols-2 gap-5">
                                {/* Nombre */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                        Nombre
                                    </label>
                                    <input
                                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre" required
                                        className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                                        style={inputBase} onFocus={onFocus} onBlur={onBlur}
                                    />
                                </div>
                                {/* Email */}
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                        placeholder="tu@email.com" required
                                        className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                                        style={inputBase} onFocus={onFocus} onBlur={onBlur}
                                    />
                                </div>
                            </div>

                            {/* Tema */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                    Tema
                                </label>
                                <select
                                    value={topic} onChange={(e) => setTopic(e.target.value)} required
                                    className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 outline-none transition-all appearance-none cursor-pointer"
                                    style={{ ...inputBase, color: topic ? undefined : '#52525b' }}
                                    onFocus={onFocus} onBlur={onBlur}
                                >
                                    <option value="" disabled style={{ background: '#1a1a1a' }}>Selecciona un tema...</option>
                                    {TOPICS.map((t) => (
                                        <option key={t} value={t} style={{ background: '#1a1a1a' }}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Mensaje */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                    Mensaje
                                </label>
                                <textarea
                                    value={message} onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Cuéntanos en detalle cómo podemos ayudarte..." required rows={5}
                                    className="w-full px-4 py-3 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all resize-none"
                                    style={inputBase} onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>

                            <motion.button
                                type="submit" disabled={loading}
                                whileHover={{ scale: 1.02, boxShadow: '0 0 28px rgba(212,175,55,0.4)' }}
                                whileTap={{ scale: 0.97 }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 transition-all"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                            >
                                {loading
                                    ? <><span className="w-4 h-4 border-2 border-[#1a1a1a]/30 border-t-[#1a1a1a] rounded-full animate-spin" /> Enviando...</>
                                    : <><Send size={14} /> Enviar mensaje</>}
                            </motion.button>

                            <p className="text-center text-xs text-zinc-600">
                                Al enviar este formulario aceptas nuestra{' '}
                                <Link to="/privacy" className="text-amber-500 hover:underline">Política de Privacidad</Link>.
                            </p>
                        </motion.form>
                    )}
                </div>
            </section>

            {/* FAQ CTA */}
            <section className="relative z-10 px-6 md:px-12 pb-20 border-t border-white/[0.06] pt-16">
                <motion.div
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.7 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <p className="text-zinc-500 text-sm mb-4">¿Buscas respuestas rápidas?</p>
                    <Link to="/faq">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm text-zinc-300 transition-all"
                            style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}>
                            Ver preguntas frecuentes <ArrowRight size={14} />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src={logo} alt="Finlytech" className="h-9 w-auto object-contain opacity-50" />
                    <p className="text-xs text-zinc-600">© 2026 Finlytech · Hecho con intención.</p>
                    <div className="flex gap-6 text-xs text-zinc-600">
                        <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="hover:text-amber-400 transition-colors">Términos</Link>
                        <Link to="/contact" className="text-amber-400 transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
