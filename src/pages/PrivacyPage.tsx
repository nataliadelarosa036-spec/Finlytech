import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, ArrowLeft } from 'lucide-react';
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
        title: '1. Información que recopilamos',
        body: `Recopilamos únicamente la información que tú nos proporcionas directamente: nombre, dirección de correo electrónico y los datos financieros que registras manualmente en la plataforma (movimientos, metas, presupuestos, etc.).\n\nNo recopilamos información bancaria, números de cuenta, contraseñas bancarias ni conectamos con ninguna entidad financiera. Todo el registro es manual y bajo tu control absoluto.`,
    },
    {
        title: '2. Cómo usamos tu información',
        body: `Usamos tu información exclusivamente para:\n\n• Proveer y mejorar los servicios de Finlytech.\n• Enviarte notificaciones relevantes sobre tu actividad (con tu consentimiento).\n• Enviarte correos transaccionales (verificación, restablecimiento de contraseña, reportes).\n• Analizar el uso agregado y anónimo de la plataforma para mejorar la experiencia.\n\nNunca usamos tu información personal para publicidad de terceros.`,
    },
    {
        title: '3. Compartición de datos',
        body: `Finlytech no vende, alquila ni comparte tu información personal con terceros con fines comerciales.\n\nPodemos compartir información únicamente en los siguientes casos:\n\n• Con proveedores de servicios técnicos (hosting, correo) bajo acuerdos de confidencialidad estrictos.\n• Cuando la ley lo exija mediante una orden judicial válida.\n• Para proteger los derechos, la seguridad o la propiedad de Finlytech o sus usuarios.`,
    },
    {
        title: '4. Seguridad de los datos',
        body: `Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:\n\n• Cifrado en tránsito (HTTPS/TLS) en todas las comunicaciones.\n• Contraseñas almacenadas con hash criptográfico (bcrypt).\n• Tokens de acceso con expiración y rotación automática.\n• Acceso restringido a los datos por parte del equipo interno.\n\nSin embargo, ningún sistema es 100% infalible. Te recomendamos usar una contraseña segura y única para tu cuenta.`,
    },
    {
        title: '5. Retención y eliminación de datos',
        body: `Conservamos tus datos mientras mantengas tu cuenta activa. Tienes derecho a solicitar la eliminación completa de tu cuenta y todos tus datos en cualquier momento desde la configuración de tu perfil o escribiéndonos a soporte@finlytech.app.\n\nUna vez eliminada la cuenta, tus datos son borrados de forma permanente en un plazo máximo de 30 días.`,
    },
    {
        title: '6. Cookies y tecnologías similares',
        body: `Finlytech usa cookies de sesión estrictamente necesarias para mantener tu autenticación activa. No usamos cookies de seguimiento publicitario ni compartimos datos de sesión con terceros.\n\nPuedes configurar tu navegador para rechazar cookies, aunque esto puede afectar el funcionamiento de la plataforma.`,
    },
    {
        title: '7. Tus derechos',
        body: `Como usuario de Finlytech, tienes los siguientes derechos sobre tus datos:\n\n• Acceso: puedes ver toda tu información en tu perfil.\n• Corrección: puedes actualizar tus datos en cualquier momento.\n• Eliminación: puedes borrar tu cuenta y todos tus datos.\n• Portabilidad: puedes exportar tu historial financiero en CSV o PDF.\n• Oposición: puedes optar por no recibir comunicaciones no esenciales.\n\nPara ejercer cualquiera de estos derechos, escríbenos a privacidad@finlytech.app.`,
    },
    {
        title: '8. Menores de edad',
        body: `Finlytech no está dirigido a personas menores de 18 años. No recopilamos conscientemente información de menores. Si detectamos que un menor ha creado una cuenta, la eliminaremos de inmediato.`,
    },
    {
        title: '9. Cambios a esta política',
        body: `Podemos actualizar esta Política de Privacidad en cualquier momento. Cuando realicemos cambios significativos, te notificaremos por correo electrónico con al menos 15 días de anticipación. El uso continuado del servicio después de la notificación implica la aceptación de los cambios.`,
    },
    {
        title: '10. Contacto',
        body: `Si tienes preguntas, preocupaciones o deseas ejercer tus derechos de privacidad, puedes contactarnos en:\n\n📧 privacidad@finlytech.app\n🌐 finlytech.app/contact`,
    },
];

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px]">
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
                            <Shield size={22} className="text-amber-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-1"
                                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                                <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">Legal</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold">Política de Privacidad</h1>
                        </div>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Última actualización: <span className="text-zinc-400">1 de septiembre de 2026</span>
                        &nbsp;·&nbsp; Versión 1.0
                    </p>
                    <p className="mt-4 text-zinc-400 leading-relaxed">
                        En Finlytech nos tomamos tu privacidad muy en serio. Esta política explica qué información recopilamos, cómo la usamos y cómo la protegemos. Nuestro compromiso es simple: tus datos son tuyos.
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

                    {/* Contact CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.6 }}
                        className="p-7 rounded-2xl text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(16,185,129,0.04) 100%)', border: '1px solid rgba(212,175,55,0.18)' }}
                    >
                        <Shield size={22} className="text-amber-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold mb-2">¿Tienes preguntas sobre privacidad?</h3>
                        <p className="text-zinc-400 text-sm mb-5">Respondemos en menos de 24 horas.</p>
                        <a href="mailto:privacidad@finlytech.app">
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-2xl text-sm"
                                style={{ background: 'linear-gradient(135deg, #D4AF37, #F59E0B)', color: '#1a1a1a', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}>
                                Contactar al equipo de privacidad <ArrowRight size={14} />
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
                        <Link to="/privacy" className="text-amber-400 transition-colors">Privacidad</Link>
                        <Link to="/terms" className="hover:text-amber-400 transition-colors">Términos</Link>
                        <Link to="/contact" className="hover:text-amber-400 transition-colors">Contacto</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
