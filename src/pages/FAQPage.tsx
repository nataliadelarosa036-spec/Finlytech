import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, ChevronDown, MessageCircle } from 'lucide-react';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

const NAV_LINKS = ['Inicio', 'Características', 'Planes', 'Preguntas frecuentes'];
const NAV_ROUTES: Record<string, string> = {
    'Inicio': '/',
    'Características': '/features',
    'Planes': '/plans',
    'Preguntas frecuentes': '/faq',
};

const categories = [
    {
        label: 'General',
        faqs: [
            {
                q: '¿Qué es FinlyTech?',
                a: 'FinlyTech es tu copiloto financiero personal. Una app que te ayuda a registrar tus ingresos, gastos y hábitos financieros para tomar mejores decisiones con tu dinero. No vinculamos tu cuenta bancaria — todo es manual y 100% privado.',
            },
            {
                q: '¿Para quién es FinlyTech?',
                a: 'Para cualquier persona que quiera tener más claridad sobre su dinero. Ya sea que estés empezando a organizar tus finanzas, quieras ahorrar para una meta o simplemente quieras saber en qué gastas cada mes.',
            },
            {
                q: '¿FinlyTech conecta con mi banco?',
                a: 'No. FinlyTech no se conecta a ningún banco ni maneja dinero real. Todo se registra manualmente, lo que te da control total y privacidad sobre tu información.',
            },
            {
                q: '¿Está disponible en mi país?',
                a: 'FinlyTech está disponible en toda Latinoamérica. La app funciona con cualquier moneda y puedes configurarla para tu país específico.',
            },
        ],
    },
    {
        label: 'Cuenta y seguridad',
        faqs: [
            {
                q: '¿Mis datos están seguros?',
                a: 'Absolutamente. Usamos cifrado de extremo a extremo para proteger tu información. Tus datos financieros nunca se comparten con terceros y no tenemos acceso a cuentas bancarias reales.',
            },
            {
                q: '¿Puedo eliminar mi cuenta y mis datos?',
                a: 'Sí, en cualquier momento. Desde la configuración de tu perfil puedes solicitar la eliminación completa de tu cuenta y todos tus datos, incluyendo historial de transacciones y configuraciones.',
            },
            {
                q: '¿Qué pasa si olvido mi contraseña?',
                a: 'Puedes recuperar tu acceso fácilmente a través de la opción "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión. Te enviaremos un correo de recuperación al instante.',
            },
            {
                q: '¿Puedo usar FinlyTech en varios dispositivos?',
                a: 'Sí. Tu cuenta se sincroniza automáticamente entre todos tus dispositivos: web, iOS y Android. Todos los cambios se reflejan en tiempo real.',
            },
        ],
    },
    {
        label: 'Funciones',
        faqs: [
            {
                q: '¿Cómo funciona el Copiloto IA?',
                a: 'El Copiloto IA analiza tus patrones de gasto e ingreso para darte recomendaciones personalizadas. Te alerta sobre gastos inusuales, sugiere formas de ahorrar y te ayuda a entender tu situación financiera con lenguaje natural.',
            },
            {
                q: '¿Qué son las metas de ahorro?',
                a: 'Las metas te permiten definir un objetivo de ahorro con un monto y una fecha límite. FinlyTech calcula cuánto deberías ahorrar por semana o mes y te muestra tu progreso en tiempo real.',
            },
            {
                q: '¿Puedo llevar el control de inversiones?',
                a: 'Sí, con el plan Pro puedes registrar tus acciones, fondos de inversión, CDTs, criptomonedas y otros activos. Verás el rendimiento de tu portafolio y podrás comparar diferentes periodos.',
            },
            {
                q: '¿Cómo funciona el simulador financiero?',
                a: 'El simulador te permite evaluar el impacto de una decisión financiera antes de tomarla: un crédito nuevo, una compra grande o un cambio en tus hábitos de gasto. Te muestra proyecciones y escenarios comparativos.',
            },
            {
                q: '¿Puedo exportar mis datos?',
                a: 'Sí, en el plan Pro puedes exportar todo tu historial financiero en formato CSV (para Excel o Google Sheets) o PDF para archivos y reportes.',
            },
        ],
    },
    {
        label: 'Planes y pagos',
        faqs: [
            {
                q: '¿El plan Gratis realmente es gratis?',
                a: 'Sí, completamente. El plan Gratis no tiene fecha de vencimiento, no requiere tarjeta de crédito y nunca te cobraremos sin tu consentimiento explícito.',
            },
            {
                q: '¿Qué incluye el plan Pro?',
                a: 'El plan Pro desbloquea el Copiloto IA ilimitado, portafolio de inversiones, simulador financiero, exportación de datos, metas ilimitadas, suscripciones y gastos fijos, y reportes avanzados. También incluye soporte prioritario.',
            },
            {
                q: '¿Hay período de prueba?',
                a: 'Sí, ofrecemos 14 días gratis del plan Pro sin necesidad de tarjeta de crédito. Puedes probarlo con todas sus funciones y si no te convence, simplemente no haces nada y se vuelve al plan Gratis.',
            },
            {
                q: '¿Puedo cancelar mi suscripción Pro cuando quiera?',
                a: 'Por supuesto. Puedes cancelar en cualquier momento desde la configuración de tu cuenta. Si cancelas, mantienes el acceso Pro hasta el final del período pagado, luego pasas al plan Gratis automáticamente.',
            },
            {
                q: '¿Qué métodos de pago aceptan?',
                a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PSE y pago en efectivo a través de nuestros aliados de recaudo.',
            },
        ],
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border rounded-2xl overflow-hidden transition-colors duration-200 cursor-pointer"
            style={{
                background: open ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.025)',
                borderColor: open ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.07)',
            }}
            onClick={() => setOpen(!open)}
        >
            <div className="flex items-start justify-between gap-4 p-5">
                <h4 className={`text-sm font-semibold leading-snug transition-colors ${open ? 'text-amber-400' : 'text-zinc-200'}`}>{q}</h4>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 mt-0.5">
                    <ChevronDown size={16} className={open ? 'text-amber-400' : 'text-zinc-500'} />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <p className="px-5 pb-5 text-sm text-zinc-400 leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('General');

    const current = categories.find((c) => c.label === activeCategory)!;

    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* ── Background ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px]">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 65%)' }} />
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
                                className={`px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${item === 'Preguntas frecuentes' ? 'text-amber-400 bg-amber-400/[0.08]' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'}`}>
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
            <section className="relative z-10 px-6 md:px-12 pt-16 pb-14 text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}>
                        <MessageCircle size={12} className="text-amber-400" />
                        <span className="text-amber-400 text-xs tracking-widest uppercase font-bold">Preguntas frecuentes</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                        Resolvemos tus
                        <br />
                        <span style={{
                            background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 50%, #F59E0B 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            dudas
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed">
                        Todo lo que necesitas saber sobre FinlyTech, en un solo lugar.
                    </p>
                </motion.div>
            </section>

            {/* ── FAQ content ── */}
            <section className="relative z-10 px-6 md:px-12 pb-24">
                <div className="max-w-4xl mx-auto">

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setActiveCategory(cat.label)}
                                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                                style={{
                                    background: activeCategory === cat.label ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${activeCategory === cat.label ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`,
                                    color: activeCategory === cat.label ? '#D4AF37' : '#71717a',
                                }}
                            >
                                {cat.label}
                                <span className="ml-1.5 text-[10px] opacity-60">({cat.faqs.length})</span>
                            </button>
                        ))}
                    </div>

                    {/* Questions */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                        >
                            {current.faqs.map((faq, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}>
                                    <FAQItem q={faq.q} a={faq.a} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Contact CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="mt-12 p-8 rounded-3xl text-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(16,185,129,0.04) 100%)',
                            border: '1px solid rgba(212,175,55,0.18)',
                        }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }} />
                        <MessageCircle size={24} className="text-amber-400 mx-auto mb-3" />
                        <h3 className="text-xl font-bold mb-2">¿No encontraste tu respuesta?</h3>
                        <p className="text-zinc-400 text-sm mb-5">Nuestro equipo responde en menos de 24 horas.</p>
                        <a href="mailto:soporte@finlytech.app">
                            <motion.button
                                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,175,55,0.35)' }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
                            >
                                Contactar soporte <ArrowRight size={14} />
                            </motion.button>
                        </a>
                    </motion.div>
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
