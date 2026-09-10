import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import {
  ArrowRight, CheckCircle2, TrendingUp,
  Zap, Target, Shield, BarChart2, ChevronDown,
  Sparkles, Star, Play, BotMessageSquare,
  Smartphone, AlertTriangle,
} from 'lucide-react';
import logo from '@/logo/logofynlytech.png';
import eslogan from '@/logo/eslogan.png';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function useInView(ref: React.RefObject<Element>, threshold = 0.3) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

/* ─── Phone Mockup ───────────────────────────────────────────────────────────── */
function PhoneMockup() {
  const bars = [30, 48, 38, 62, 44, 58, 74, 55, 40, 68, 50, 82, 66, 90];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -12, rotateX: 4 }}
      animate={{ opacity: 1, y: 0, rotateY: -4, rotateX: 2 }}
      transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className="relative mx-auto"
    >
      {/* ── Glow beneath ── */}
      <div
        className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[260px] h-[80px] rounded-full blur-3xl opacity-60"
        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.45), transparent 70%)' }}
      />

      {/* ── Phone chassis ── */}
      <div className="relative mx-auto" style={{ width: '290px' }}>
        {/* Side buttons — left */}
        <div className="absolute left-[-3px] top-[110px] w-[3px] h-[36px] rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #4a4a4a, #2a2a2a)' }} />
        <div className="absolute left-[-3px] top-[158px] w-[3px] h-[36px] rounded-l-sm"
          style={{ background: 'linear-gradient(180deg, #4a4a4a, #2a2a2a)' }} />
        {/* Power button — right */}
        <div className="absolute right-[-3px] top-[130px] w-[3px] h-[52px] rounded-r-sm"
          style={{ background: 'linear-gradient(180deg, #4a4a4a, #2a2a2a)' }} />

        {/* Outer frame */}
        <div
          className="relative rounded-[42px] p-[3px]"
          style={{
            background: 'linear-gradient(145deg, #5a5a5a 0%, #2a2a2a 40%, #1a1a1a 70%, #3a3a3a 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.08),
              0 30px 80px rgba(0,0,0,0.8),
              0 10px 30px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.15),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Inner bezel */}
          <div className="rounded-[40px] overflow-hidden" style={{ background: '#0d0d0d', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' }}>
            {/* Screen */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #141414 100%)', borderRadius: '38px' }}>
              {/* Screen glare */}
              <div className="absolute top-0 left-0 w-[140px] h-[200px] pointer-events-none z-30"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)', borderRadius: '38px 0 0 0' }} />

              {/* ── Dynamic Island ── */}
              <div className="flex justify-center pt-4 pb-1">
                <div className="w-[100px] h-[28px] rounded-full flex items-center justify-center"
                  style={{ background: '#0a0a0a', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
                    <div className="w-3 h-1 rounded-full bg-zinc-800" />
                  </div>
                </div>
              </div>

              {/* ── Status bar ── */}
              <div className="flex justify-between items-center px-5 py-1">
                <span className="text-[11px] text-zinc-300 font-semibold">9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex items-end gap-[2px]">
                    {[3, 5, 7, 9].map((h, i) => (
                      <div key={i} style={{ width: 3, height: h, borderRadius: 1 }}
                        className={i < 3 ? 'bg-zinc-300' : 'bg-zinc-600'} />
                    ))}
                  </div>
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                    <path d="M7 8.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="rgb(212,212,212)" />
                    <path d="M4 6.5C4.9 5.6 5.9 5 7 5s2.1.6 3 1.5" stroke="rgb(212,212,212)" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M1.5 4C3.1 2.4 4.9 1.5 7 1.5S10.9 2.4 12.5 4" stroke="rgb(180,180,180)" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <div className="flex items-center gap-[1px]">
                    <div className="w-[20px] h-[10px] rounded-[3px] border border-zinc-400 p-[1.5px]">
                      <div className="h-full w-[75%] rounded-[1.5px] bg-zinc-300" />
                    </div>
                    <div className="w-[2px] h-[5px] rounded-r-sm bg-zinc-500" />
                  </div>
                </div>
              </div>

              {/* ── Top bar with logo + avatar ── */}
              <div className="flex justify-between items-center px-4 pt-1 pb-0.5">
                <div className="flex items-center gap-1.5">
                  <img src={logo} alt="FinlyTech" className="h-5 w-auto object-contain" />
                  <img src={eslogan} alt="eslogan" className="h-3.5 w-auto object-contain opacity-80" />
                </div>
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-amber-400">D</span>
                </div>
              </div>

              {/* ── Greeting ── */}
              <div className="px-4 pt-1 pb-0.5">
                <p className="text-[11px] font-semibold text-zinc-200">Hola, Daniel 👋</p>
                <p className="text-[9px] text-emerald-400 font-medium">Salud financiera óptima.</p>
              </div>

              {/* ── Balance card ── */}
              <div className="mx-3 mb-2 rounded-[18px] p-3.5 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 50%, #D97706 100%)',
                  boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
                }}>
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
                  style={{ background: 'radial-gradient(circle, white, transparent)' }} />
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Disponible para gastar</p>
                <motion.p
                  className="text-[24px] font-bold text-white tracking-tight leading-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  $2.840.000
                </motion.p>
                <p className="text-[9px] text-white/60 mt-0.5">de $4.500.000 · 63%</p>
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/20">
                  {[
                    { label: 'Ingresos', val: '$4.320.000', arrow: '↑ 12%', col: '#6ee7b7' },
                    { label: 'Gastos', val: '$1.680.000', arrow: '↑ 8%', col: '#fca5a5' },
                    { label: 'Ahorro', val: '32%', arrow: '↑ 5%', col: 'white' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[7px] text-white/50 uppercase">{s.label}</p>
                      <p className="text-[10px] font-bold" style={{ color: s.col }}>{s.val}</p>
                      <p className="text-[7px] text-white/40">{s.arrow}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Copiloto IA card ── */}
              <div className="mx-3 mb-2 rounded-[14px] p-3 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(139,92,246,0.3)', border: '1px solid rgba(139,92,246,0.4)' }}>
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-violet-300 flex items-center gap-1">
                      <span className="text-[8px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full">IA</span>
                      Tu Copiloto Financiero
                    </p>
                    <p className="text-[9px] text-zinc-400 mt-0.5 leading-tight">
                      Daniel, este mes estás gastando 23% más en domicilios que tu promedio.
                    </p>
                    <button className="mt-1.5 text-[8px] text-violet-400 font-semibold flex items-center gap-0.5">
                      Ver detalle →
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Cash flow chart ── */}
              <div className="mx-3 mb-2 rounded-[14px] bg-white/[0.04] border border-white/[0.06] p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[9px] font-bold text-zinc-400">Flujo de dinero</p>
                  <span className="text-[8px] text-amber-500 font-semibold">Este mes ↓</span>
                </div>
                <div className="flex items-end gap-[3px] h-8">
                  {bars.map((h, i) => (
                    <motion.div key={i} className="flex-1 rounded-sm"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      style={{ transformOrigin: 'bottom' }}
                      transition={{ delay: 0.9 + i * 0.04, duration: 0.35, ease: 'easeOut' }}>
                      <div className="w-full rounded-sm" style={{
                        height: `${h * 0.32}px`,
                        background: i === 13 ? 'linear-gradient(180deg, #D4AF37, #F59E0B)' : h > 65 ? 'rgba(212,175,55,0.45)' : 'rgba(212,175,55,0.2)',
                        boxShadow: i === 13 ? '0 0 6px rgba(212,175,55,0.5)' : 'none',
                      }} />
                    </motion.div>
                  ))}
                </div>
                {/* Month labels */}
                <div className="flex justify-between mt-1">
                  {['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                    <span key={i} className="text-[6px] text-zinc-700 flex-1 text-center">{m}</span>
                  ))}
                </div>
              </div>

              {/* ── Recent transactions ── */}
              <div className="mx-3 mb-3 space-y-[3px]">
                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 mb-1 px-0.5">Movimientos recientes</p>
                {[
                  { icon: '🛵', name: 'Rappi', cat: 'Domicilios', amount: '-$45.000', plus: false, color: '#fb923c' },
                  { icon: '💰', name: 'Nómina', cat: 'Salario Mayo', amount: '+$4.200.000', plus: true, color: '#10b981' },
                  { icon: '🎯', name: 'Éxito', cat: 'Compras', amount: '-$118.000', plus: false, color: '#3b82f6' },
                ].map((tx, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.1 }}
                    className="flex items-center gap-2 p-1.5 rounded-[10px] bg-white/[0.04]">
                    <div className="w-6 h-6 rounded-[8px] flex items-center justify-center text-xs shrink-0"
                      style={{ backgroundColor: `${tx.color}22` }}>
                      {tx.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-zinc-100 leading-none">{tx.name}</p>
                      <p className="text-[8px] text-zinc-600">{tx.cat}</p>
                    </div>
                    <p className={`text-[10px] font-bold tabular-nums ${tx.plus ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {tx.amount}
                    </p>
                  </motion.div>
                ))}
                <button className="w-full text-center text-[8px] text-amber-500 font-semibold pt-1">Ver todos →</button>
              </div>

              {/* ── Home indicator ── */}
              <div className="flex justify-center pb-3">
                <div className="w-24 h-1 rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating badge — top right: ¡Buen trabajo! ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="absolute -right-4 top-[80px] backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-xl cursor-default"
        style={{
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 4px 20px rgba(16,185,129,0.2)',
          minWidth: '160px',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={10} className="text-emerald-400" />
            </div>
            <p className="text-[10px] font-bold text-emerald-400">¡Buen trabajo!</p>
          </div>
          <ChevronDown size={10} className="text-emerald-500 -rotate-90" />
        </div>
        <p className="text-[8px] text-emerald-600 leading-tight">Ahorraste 18% más<br />que el mes pasado.</p>
      </motion.div>

      {/* ── Floating badge — right middle: Gasto inusual ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.0, duration: 0.6 }}
        className="absolute -right-4 top-[200px] backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-xl cursor-default"
        style={{
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          boxShadow: '0 4px 20px rgba(239,68,68,0.15)',
          minWidth: '170px',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <AlertTriangle size={10} className="text-red-400 shrink-0" />
          <p className="text-[10px] font-bold text-red-400">Gasto inusual detectado</p>
        </div>
        <p className="text-[8px] text-red-500/80 leading-tight">Se identificó un gasto de $180.000<br />en una categoría poco común.</p>
        <button className="mt-1 text-[8px] text-red-400 font-semibold flex items-center gap-0.5">
          Ver más →
        </button>
      </motion.div>

      {/* ── Floating badge — right bottom: Meta de ahorro ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
        className="absolute -right-4 bottom-[100px] backdrop-blur-xl rounded-2xl px-3 py-2.5 shadow-xl cursor-default"
        style={{
          background: 'rgba(212,175,55,0.12)',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.15)',
          minWidth: '160px',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Mini ring */}
          <div className="relative w-10 h-10 shrink-0">
            <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
              <motion.circle cx="20" cy="20" r="15" fill="none" stroke="#D4AF37" strokeWidth="3.5"
                strokeLinecap="round" strokeDasharray="94"
                initial={{ strokeDashoffset: 94 }}
                animate={{ strokeDashoffset: 94 * 0.22 }}
                transition={{ delay: 2.4, duration: 1.2, ease: 'easeOut' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-400">78%</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-bold text-amber-400">Meta de ahorro</p>
            <p className="text-[8px] text-amber-600/80 leading-tight">Te faltan<br />$420.000 para tu meta</p>
            <ChevronDown size={8} className="text-amber-500 -rotate-90 mt-0.5" />
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}

/* ─── Landing Page ────────────────────────────────────────────────────────────── */
const NAV_LINKS = ['Inicio', 'Características', 'Planes', 'Preguntas frecuentes'];
const NAV_ROUTES: Record<string, string> = {
  'Inicio': '/',
  'Características': '/features',
  'Planes': '/plans',
  'Preguntas frecuentes': '/faq',
};

export function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsVisible = useInView(statsRef as React.RefObject<Element>);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#111111] text-zinc-100 overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #141414 0%, #0e0e0e 50%, #0c0c0c 100%)' }} />
        <motion.div className="absolute top-0 right-0 w-[800px] h-[800px]" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14) 0%, transparent 65%)' }} />
        </motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-[500px] h-[500px]"
          animate={{ scale: [1, 1.15, 1], x: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute inset-0 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
        </motion.div>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
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
        <div
          className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-5 py-3"
          style={{
            background: 'rgba(20,20,20,0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Finlytech" className="h-12 w-auto object-contain" />
            <img src={eslogan} alt="eslogan" className="h-8 w-auto object-contain opacity-85 hidden sm:block" />
          </motion.div>

          {/* Nav links — center */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <Link
                key={item}
                to={NAV_ROUTES[item]}
                className="px-3.5 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium rounded-xl hover:bg-white/[0.05]"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Auth actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium rounded-xl hover:bg-white/[0.05]">
              Iniciar sesión
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(212,175,55,0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                  color: '#1a1a1a',
                  boxShadow: '0 2px 12px rgba(212,175,55,0.3)',
                }}
              >
                Comenzar gratis
                <ArrowRight size={13} />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 px-6 md:px-12 pt-10 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 lg:pr-6"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.22)' }}
              >
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-amber-400 text-xs"
                >
                  ✦
                </motion.span>
                <span className="text-amber-400 text-xs tracking-widest uppercase font-bold">
                  Tu copiloto financiero personal
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-[4.8rem] font-bold leading-[0.95] tracking-tight"
              >
                Tu dinero,
                <br />
                finalmente
                <br />
                <span style={{
                  background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 40%, #F59E0B 70%, #D4AF37 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmerText 3s linear infinite',
                }}>
                  bajo control.
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base text-zinc-400 max-w-md leading-relaxed"
              >
                FinlyTech analiza tus ingresos, gastos y hábitos
                para ayudarte a tomar mejores decisiones financieras.
                Más que una app, es tu copiloto financiero.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="flex flex-wrap gap-3 pt-1"
              >
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(212,175,55,0.5)' }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center gap-2 px-7 py-4 font-bold rounded-2xl text-sm transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 20px rgba(212,175,55,0.35)',
                    }}
                  >
                    Comenzar gratis
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 px-7 py-4 font-medium rounded-2xl text-sm transition-all text-zinc-300"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="w-5 h-5 rounded-full border border-zinc-500 flex items-center justify-center">
                    <Play size={8} className="text-zinc-400 translate-x-[1px]" fill="currentColor" />
                  </div>
                  Ver cómo funciona
                </motion.button>
              </motion.div>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.46 }}
                className="grid grid-cols-2 gap-3 pt-1"
              >
                {[
                  { icon: <BarChart2 size={13} className="text-amber-400" />, label: 'Control total de tus finanzas' },
                  { icon: <BotMessageSquare size={13} className="text-violet-400" />, label: 'IA que te da recomendaciones' },
                  { icon: <Shield size={13} className="text-emerald-400" />, label: 'Seguro y privado' },
                  { icon: <Smartphone size={13} className="text-blue-400" />, label: 'Disponible en todos tus dispositivos' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-xs text-zinc-400 leading-tight">{item.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex items-center gap-3 pt-2"
              >
                <div className="flex -space-x-2">
                  {['#D4AF37', '#10b981', '#3b82f6', '#f97316'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ background: c, zIndex: 4 - i }}>
                      {['D', 'A', 'M', 'C'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="#D4AF37" className="text-amber-500" />)}
                  </div>
                  <p className="text-[11px] text-zinc-500">+50.000 usuarios ya confían en FinlyTech</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — Phone */}
            <div className="relative flex justify-center lg:justify-end pt-6 lg:pt-0">
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex justify-center mt-16"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1.5 text-zinc-600 cursor-default"
          >
            <span className="text-[9px] uppercase tracking-[0.2em] font-semibold">Explorar</span>
            <ChevronDown size={14} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Trust bar ── */}
      <div className="relative z-10 border-y border-white/[0.06]"
        style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-white/[0.06]">
            {[
              { icon: <Shield size={14} className="text-amber-400" />, title: '100% Seguro', sub: 'Tus datos siempre protegidos' },
              { icon: <Star size={14} className="text-amber-400" fill="#D4AF37" />, title: '4.8 / 5', sub: 'Más de 50.000 usuarios' },
              { icon: <Zap size={14} className="text-amber-400" />, title: 'Análisis en tiempo real', sub: 'Decisiones más inteligentes' },
              { icon: <Smartphone size={14} className="text-amber-400" />, title: 'En todos tus dispositivos', sub: 'iOS, Android y Web' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 ${i > 0 ? 'pl-4' : ''}`}>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-200">{item.title}</p>
                  <p className="text-[10px] text-zinc-600">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cómo funciona ── */}
      <section id="como-funciona" className="relative z-10 px-6 md:px-12 py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-5xl font-bold">
              Tres pasos,{' '}
              <span style={{
                background: 'linear-gradient(90deg, #D4AF37, #F59E0B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                control total
              </span>
            </h2>
            <p className="text-zinc-500 mt-4 max-w-xl mx-auto">Sin configuraciones complejas. Empiezas a ver resultados desde el primer registro.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 relative">
            <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), rgba(212,175,55,0.3), transparent)' }} />

            {[
              {
                step: '01', icon: <BarChart2 size={20} className="text-amber-400" />,
                title: 'Registra', subtitle: 'tus movimientos',
                body: 'Agrega ingresos y gastos en segundos. Categorías automáticas, sin formularios largos.',
              },
              {
                step: '02', icon: <Zap size={20} className="text-amber-400" />,
                title: 'Descubre', subtitle: 'tus patrones',
                body: 'Ve exactamente en qué gastas más, cuándo y por qué. Análisis visual en tiempo real.',
              },
              {
                step: '03', icon: <Target size={20} className="text-amber-400" />,
                title: 'Decide', subtitle: 'con datos reales',
                body: 'Metas, simulaciones y recomendaciones concretas para mejorar tu salud financiera.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.13 }}
                className="group relative p-7 rounded-2xl transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
                whileHover={{ background: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.25)', y: -4 } as any}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                    {item.icon}
                  </div>
                  <span className="text-4xl font-bold text-zinc-800 group-hover:text-zinc-700 transition-colors select-none">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  {item.title}{' '}
                  <span className="text-amber-400">{item.subtitle}</span>
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed mt-2">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-3">Herramientas</p>
            <h2 className="text-3xl md:text-5xl font-bold">Todo incluido, <span className="text-amber-500">gratis</span></h2>
            <Link to="/features" className="inline-flex items-center gap-1.5 mt-4 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Ver todas las características <ArrowRight size={13} />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">            {[
            { icon: '📊', title: 'Movimientos', desc: 'Registra y categoriza cada peso que entra y sale.', tag: 'Core' },
            { icon: '🎯', title: 'Metas de ahorro', desc: 'Define objetivos con fechas y sigue tu progreso.', tag: 'Core' },
            { icon: '💳', title: 'Deudas y tarjetas', desc: 'Controla fechas de corte, cupos y pagos mínimos.', tag: 'Core' },
            { icon: '📈', title: 'Inversiones', desc: 'Portafolio con rendimientos y dividendos en tiempo real.', tag: 'Pro' },
            { icon: '🤖', title: 'Copiloto IA', desc: 'Recomendaciones automáticas basadas en tus hábitos.', tag: 'IA' },
            { icon: '🔮', title: 'Simulador', desc: '¿Puedo comprarlo? Simula antes de decidir.', tag: 'Pro' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -3 } as any}
              className="group p-6 rounded-2xl cursor-default transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{feat.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{
                    background: feat.tag === 'IA' ? 'rgba(139,92,246,0.15)' : feat.tag === 'Pro' ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.12)',
                    color: feat.tag === 'IA' ? '#a78bfa' : feat.tag === 'Pro' ? '#34d399' : '#D4AF37',
                    border: `1px solid ${feat.tag === 'IA' ? 'rgba(139,92,246,0.25)' : feat.tag === 'Pro' ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)'}`,
                  }}
                >
                  {feat.tag}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1.5 group-hover:text-amber-400 transition-colors">{feat.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      {/* ── Testimonios ── */}
      <section className="relative z-10 px-6 md:px-12 py-20 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <p className="text-xs text-amber-400 font-bold uppercase tracking-[0.15em] mb-3">Testimonios</p>
            <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen <span className="text-amber-400">nuestros usuarios</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Daniela R.', role: 'Freelancer · Medellín',
                avatar: '#D4AF37', initial: 'D',
                stars: 5,
                text: 'Antes no sabía en qué se iba mi plata. Con FinlyTech vi que gastaba el 30% en delivery. En dos meses ahorré lo suficiente para mi viaje.',
              },
              {
                name: 'Andrés M.', role: 'Ingeniero · Bogotá',
                avatar: '#10b981', initial: 'A',
                stars: 5,
                text: 'El Copiloto IA es increíble. Me detectó un gasto recurrente que ni sabía que tenía y me sugirió cómo reorganizar mis finanzas. Brutal.',
              },
              {
                name: 'Camila V.', role: 'Emprendedora · Cali',
                avatar: '#3b82f6', initial: 'C',
                stars: 5,
                text: 'Lo que más me gusta es que no necesita conectarse a mi banco. Mis datos son míos. Y el diseño es hermoso, da gusto usarla todos los días.',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="p-6 rounded-2xl flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={12} fill="#D4AF37" className="text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: t.avatar }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{t.name}</p>
                    <p className="text-xs text-zinc-600">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filosofía / Quote ── */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="relative p-12 md:p-16 rounded-3xl overflow-hidden text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(16,185,129,0.04) 100%)',
              border: '1px solid rgba(212,175,55,0.18)',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent)' }} />
            <p className="text-xs text-amber-500 font-bold uppercase tracking-[0.15em] mb-6">Nuestra filosofía</p>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-snug">
              La claridad financiera
              <br />
              <span className="text-amber-400">es libertad</span>
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
              La mayoría maneja su dinero por intuición. Con Finlytech lo manejas con datos reales.
              Transformamos números en decisiones concretas que cambian hábitos.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { icon: <Shield size={14} className="text-amber-400" />, label: 'Datos locales y privados' },
                { icon: <CheckCircle2 size={14} className="text-emerald-400" />, label: 'Sin costos ocultos' },
                { icon: <TrendingUp size={14} className="text-amber-400" />, label: 'Análisis en tiempo real' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Empieza hoy</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Conoce tu dinero,
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #D4AF37, #10b981, #D4AF37)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmerText 4s linear infinite',
              }}>
                toma el control
              </span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-md mx-auto">
              Cuenta creada en menos de 1 minuto. Sin tarjeta, sin banco vinculado.
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(212,175,55,0.55)' }}
                whileTap={{ scale: 0.96 }}
                className="inline-flex items-center gap-2 px-12 py-5 font-bold rounded-2xl text-base transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                  color: '#1a1a1a',
                  boxShadow: '0 6px 30px rgba(212,175,55,0.35)',
                }}
              >
                Crear cuenta gratis
                <ArrowRight size={17} />
              </motion.button>
            </Link>
            <p className="text-xs text-zinc-600">Sin compromisos. Cancela cuando quieras.</p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 md:px-12 py-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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

      <style>{`
        @keyframes shimmerText {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
