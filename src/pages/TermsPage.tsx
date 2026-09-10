import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ArrowLeft } from 'lucide-react';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

const NAV_LINKS = ['Inicio', 'Características', 'Planes', 'Preguntas frecuentes'];
const NAV_ROUTES: Record<string, string> = {
    'Inicio': '/',
    'Características': '/features',
    'Planes': '/plans',
    'Preguntas frecuentes': '/faq',
};

const SECTIONS = [
    {
        title: '1. Aceptación de los términos',
        body: `Al crear una cuenta o usar los servicios de Finlytech, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar el servicio.\n\nEstos términos se aplican a todos los usuarios, incluidos visitantes, usuarios registrados y cualquier persona que acceda al servicio.`,
    },
    {
        title: '2. Descripción del servicio',
        body: `Finlytech es una plataforma de gestión financiera personal que te permite registrar, analizar y planificar tus finanzas. El servicio incluye:\n\n• Control de ingresos y gastos\n• Metas de ahorro y presupuestos\n• Gestión de deudas y tarjetas\n• Portafolio de inversiones (plan Pro)\n• Copiloto financiero con IA (plan Pro)\n• Simulador y análisis financiero\n\nFinlytech no es una entidad financiera, banco, ni gestora de inversiones. No manejamos dinero real ni ofrecemos asesoramiento financiero profesional.`,
    },
    {
        title: '3. Registro y cuenta',
        body: `Para usar Finlytech debes registrarte con una dirección de correo válida y crear una contraseña segura, o autenticarte con Google.\n\nEres responsable de:\n• Mantener la confidencialidad de tu contraseña.\n• Todas las actividades que ocurran bajo tu cuenta.\n• Notificarnos inmediatamente si sospechas acceso no autorizado.\n\nReservamos el derecho de suspender cuentas que violen estos términos.`,
    },
    {
        title: '4. Uso aceptable',
        body: `Al usar Finlytech aceptas no:\n\n• Usar el servicio para actividades ilegales o fraudulentas.\n• Intentar acceder a cuentas de otros usuarios.\n• Realizar ingeniería inversa, descompilar o intentar extraer el código fuente.\n• Usar bots, scripts automatizados o cualquier método para acceder masivamente al servicio.\n• Publicar contenido ofensivo, difamatorio o que infrinja derechos de terceros.\n• Sobrecargar intencionalmente la infraestructura del servicio.`,
    },
    {
        title: '5. Planes y pagos',
        body: `Finlytech ofrece un plan gratuito y un plan Pro con funciones adicionales.\n\nPlan Gratis:\n• Sin costo, sin tarjeta de crédito, sin fecha de vencimiento.\n\nPlan Pro:\n• Facturación mensual o anual según el plan elegido.\n• 14 días de prueba gratuita sin tarjeta.\n• Puedes cancelar en cualquier momento.\n• Al cancelar, mantienes el acceso Pro hasta el final del período pagado.\n• No realizamos reembolsos parciales por períodos no utilizados, salvo donde lo exija la ley.`,
    },
    {
        title: '6. Propiedad intelectual',
        body: `Todo el contenido de Finlytech — incluyendo el código, diseño, logos, textos, gráficos y funcionalidades — es propiedad exclusiva de Finlytech y está protegido por leyes de propiedad intelectual.\n\nSe te concede una licencia limitada, no exclusiva e intransferible para usar el servicio de acuerdo con estos términos. No puedes copiar, modificar, distribuir ni crear trabajos derivados sin autorización expresa por escrito.`,
    },
    {
        title: '7. Tus datos y contenido',
        body: `Los datos financieros que registras en Finlytech son de tu exclusiva propiedad. Al usar el servicio, nos otorgas una licencia limitada para procesar esos datos con el único propósito de proveer el servicio.\n\nPuedes exportar y eliminar tus datos en cualquier momento. Consulta nuestra Política de Privacidad para más detalles sobre cómo manejamos tu información.`,
    },
    {
        title: '8. Limitación de responsabilidad',
        body: `Finlytech se provee "tal cual" sin garantías de ningún tipo. No garantizamos:\n\n• Disponibilidad ininterrumpida del servicio.\n• Ausencia total de errores o bugs.\n• Que los análisis financieros sean perfectamente precisos.\n\nEn ningún caso Finlytech será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso del servicio, incluyendo pérdidas financieras derivadas de decisiones tomadas basándose en los análisis de la plataforma.`,
    },
    {
        title: '9. Modificaciones del servicio',
        body: `Nos reservamos el derecho de modificar, suspender o discontinuar el servicio o cualquier parte de él en cualquier momento, con o sin aviso previo.\n\nPara cambios significativos, notificaremos a los usuarios registrados por correo electrónico con al menos 15 días de anticipación.`,
    },
    {
        title: '10. Modificaciones de los términos',
        body: `Podemos actualizar estos Términos en cualquier momento. Cuando lo hagamos, actualizaremos la fecha de "última actualización" al inicio del documento y notificaremos a los usuarios por correo electrónico.\n\nEl uso continuado del servicio después de la notificación implica la aceptación de los términos actualizados.`,
    },
    {
        title: '11. Ley aplicable',
        body: `Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa relacionada con estos términos se resolverá en los tribunales competentes de Bogotá, Colombia, salvo disposición legal diferente aplicable en tu jurisdicción.`,
    },
    {
        title: '12. Contacto',
        body: `Si tienes preguntas sobre estos términos:\n\n📧 legal@finlytech.app\n🌐 finlytech.app/contact`,
    },
];

export function TermsPage() {
    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 left-0 w-[600px] h-[600px]">
                    <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 65%)' }} />
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
            <section className="relative z-10 px-6 md:px-12 pt-14 pb-12">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-8 transition-colors font-medium">
                        <ArrowLeft size={13} /> Volver al inicio
                    </Link>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)' }}>
                            <FileText size={22} className="text-amber-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-1"
                                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Legal</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold">Términos y Condiciones</h1>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Última actualización: <span className="text-zinc-400">1 de septiembre de 2026</span>
                        &nbsp;·&nbsp; Versión 1.0
                    </p>
                    <p className="mt-4 text-zinc-400 leading-relaxed">
                        Estos Términos y Condiciones rigen el uso de la plataforma Finlytech. Al registrarte o usar el servicio, aceptas estos términos. Léelos con atención — están escritos en lenguaje claro y sin letra pequeña.
                    </p>
                </motion.div>
            </section>

            {/* Content */}
            <section className="relative z-10 px-6 md:px-12 pb-24">
                <div className="max-w-3xl mx-auto space-y-6">
                    {SECTIONS.map((sec, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-20px' }}
                            transition={{ duration: 0.5, delay: i * 0.04 }}
                            className="p-6 rounded-2xl"
                            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            <h2 className="text-base font-bold text-amber-400 mb-3">{sec.title}</h2>
                            <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">{sec.body}</div>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="p-7 rounded-2xl text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(16,185,129,0.04) 100%)', border: '1px solid rgba(212,175,55,0.18)' }}
                    >
                        <FileText size={22} className="text-amber-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-2">¿Tienes dudas sobre los términos?</h3>
                        <p className="text-zinc-400 text-sm mb-5">Nuestro equipo legal responde en menos de 48 horas.</p>
                        <a href="mailto:legal@finlytech.app">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}>
                                Contactar al equipo legal <ArrowRight size={14} />
                            </motion.button>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src={logo} alt="Finlytech" className="h-9 w-auto object-contain opacity-50" />
                    <p className="text-xs text-zinc-600">© 2026 Finlytech · Hecho con intención.</p>
                    <div className="flex gap-6 text-xs text-zinc-600">
                        <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="text-amber-400 transition-colors">Términos</Link>
                        <Link to="/contact" className="hover:text-amber-400 transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
