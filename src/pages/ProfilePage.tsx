import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Type, Eye, Bell, Shield, ChevronRight, LogOut,
  Sparkles, CreditCard, Wallet, Repeat, TrendingUp, Heart,
  HelpCircle, FlaskConical, Download, Zap, Check,
  Vibrate, Lock, Fingerprint, AlertTriangle, KeyRound,
  CheckCircle2, AlertCircle, Pencil, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/state/store';
import { useAuthStore } from '@/state/authStore';
import { authApi } from '@/services/auth';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { Sheet } from '@/components/Sheet';
import { formatCurrency } from '@/utils/format';
import { getMonthlyIncome, getMonthlyExpenses, getSavingsRate, getSpendingByCategory } from '@/utils/calculations';
import { cn } from '@/utils/cn';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AVATAR_COLORS = [
  '#D4AF37', '#13a8a1', '#3b82f6', '#8b5cf6',
  '#f59e0b', '#10b981', '#f43f5e', '#06b6d4',
];

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDark = useStore((s) => s.toggleDarkMode);
  const setMode = useStore((s) => s.setMode);
  const notifications = useStore((s) => s.notifications);
  const transactions = useStore((s) => s.transactions);
  const notifPrefs = useStore((s) => s.notifPrefs);
  const a11yPrefs = useStore((s) => s.a11yPrefs);
  const setNotifPrefs = useStore((s) => s.setNotifPrefs);
  const setA11yPrefs = useStore((s) => s.setA11yPrefs);

  const unread = notifications.filter((n) => !n.read).length;
  const income = getMonthlyIncome(transactions);
  const expenses = getMonthlyExpenses(transactions);
  const savingsRate = getSavingsRate(income, expenses);

  const [showNotif, setShowNotif] = useState(false);
  const [showA11y, setShowA11y] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Edit profile state
  const [editName, setEditName] = useState(user.name);
  const [editColor, setEditColor] = useState(user.avatarColor);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setUser({ name: editName, avatarColor: editColor });
    // Also patch backend
    try {
      await fetch(`${API}/api/user/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`,
        },
        body: JSON.stringify({ name: editName, avatarColor: editColor }),
      });
    } catch { /* non-blocking */ }
    setSavingProfile(false);
    setShowEditProfile(false);
  };

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPasses, setShowPasses] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const accessToken = useAuthStore((s) => s.accessToken);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPassError(''); setPassSuccess(false);
    if (newPass.length < 8) { setPassError('Mínimo 8 caracteres.'); return; }
    if (!/[A-Z]/.test(newPass) || !/[0-9]/.test(newPass)) { setPassError('Debe tener mayúsculas y números.'); return; }
    if (newPass !== confirmPass) { setPassError('Las contraseñas no coinciden.'); return; }
    setChangingPass(true);
    try {
      const res = await fetch(`${API}/api/password/change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (data.success) {
        setPassSuccess(true);
        setCurrentPass(''); setNewPass(''); setConfirmPass('');
        setTimeout(() => { setShowChangePassword(false); setPassSuccess(false); }, 2000);
      } else {
        setPassError(data.error || 'Error cambiando la contraseña.');
      }
    } catch { setPassError('Error de conexión.'); }
    finally { setChangingPass(false); }
  };

  const clearAuth = useAuthStore((s) => s.clearAuth);
  const resetStore = useStore((s) => s.resetStore);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { }
    clearAuth();
    resetStore();
    navigate('/');
  };

  const dynamicObservations = useMemo(() => {
    if (transactions.length === 0) {
      return [
        'Aún no registras movimientos este mes.',
        'Añade tus ingresos y gastos para generar tu perfil financiero.',
        'Podrás ver análisis de tus hábitos de consumo y ahorro.',
      ];
    }
    const obs: string[] = [];
    if (savingsRate >= 20) {
      obs.push(`Excelente tasa de ahorro (${savingsRate.toFixed(0)}%).`);
    } else if (savingsRate > 0) {
      obs.push(`Ahorras aproximadamente el ${savingsRate.toFixed(0)}% de tus ingresos.`);
    } else {
      obs.push('Tus gastos igualan o superan tus ingresos este mes.');
    }
    const byCategory = getSpendingByCategory(transactions);
    if (byCategory.length > 0) {
      obs.push(`Tu mayor categoría de gasto es ${byCategory[0].category.name}.`);
    }
    obs.push('Tus datos se calculan en tiempo real según tus registros.');
    return obs;
  }, [transactions, savingsRate]);

  return (
    <div className="page-enter space-y-5">
      <TopBar />

      {/* Profile hero */}
      <div className="card p-5 flex items-center gap-4">
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-bold text-white font-display shadow-md"
            style={{ background: `linear-gradient(135deg, ${user.avatarColor || '#D4AF37'}, ${user.avatarColor || '#D4AF37'}99)` }}
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <button
            onClick={() => { setEditName(user.name); setEditColor(user.avatarColor); setShowEditProfile(true); }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
          >
            <Pencil size={11} className="text-ink-500" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold font-display tracking-tight">{user.name || 'Usuario'}</h1>
          <p className="text-sm text-ink-400 truncate">{user.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <StatPill label="Ingresos" value={formatCurrency(income)} color="emerald" />
            <StatPill label="Ahorro" value={`${savingsRate.toFixed(0)}%`} color={savingsRate >= 20 ? 'emerald' : savingsRate >= 10 ? 'amber' : 'rose'} />
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <SectionCard title="Modo de visualización">
        <div className="grid grid-cols-2 gap-3">
          <ModeBtn
            active={user.mode === 'simple'}
            onClick={() => setMode('simple')}
            icon={<Type size={18} className="text-amber-600 dark:text-amber-400" />}
            title="Simple"
            desc="Información esencial"
          />
          <ModeBtn
            active={user.mode === 'advanced'}
            onClick={() => setMode('advanced')}
            icon={<Sparkles size={18} className="text-amber-600 dark:text-amber-400" />}
            title="Avanzado"
            desc="Métricas y ratios"
          />
        </div>
      </SectionCard>

      {/* Settings */}
      <div className="card divide-y divide-ink-50 dark:divide-ink-800/50">
        <SettingRow icon={darkMode ? Sun : Moon} label="Modo oscuro" onClick={toggleDark}>
          <Toggle active={darkMode} />
        </SettingRow>
        <SettingRow icon={Bell} label="Notificaciones" badge={unread} onClick={() => setShowNotif(true)} />
        <SettingRow icon={Eye} label="Accesibilidad" onClick={() => setShowA11y(true)} />
        <SettingRow icon={Shield} label="Seguridad y privacidad" onClick={() => setShowSecurity(true)} />
      </div>

      {/* Financial profile */}
      <SectionCard title="Tu perfil financiero">
        <div className="space-y-3">
          {dynamicObservations.map((text, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" style={{ boxShadow: '0 0 6px rgba(212,175,55,0.5)' }} />
              <p className="text-sm text-ink-700 dark:text-ink-300">{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Quick nav */}
      <div className="card divide-y divide-ink-50 dark:divide-ink-800/50">
        <SettingRow icon={Zap} label="Copiloto" onClick={() => navigate('/insights')} />
        <SettingRow icon={CreditCard} label="Tarjetas" onClick={() => navigate('/money/cards')} />
        <SettingRow icon={Wallet} label="Deudas" onClick={() => navigate('/wealth/debts')} />
        <SettingRow icon={TrendingUp} label="Patrimonio" onClick={() => navigate('/insights/net-worth')} />
        <SettingRow icon={Repeat} label="Suscripciones" onClick={() => navigate('/wealth/subscriptions')} />
        <SettingRow icon={TrendingUp} label="Inversiones" onClick={() => navigate('/wealth/investments')} />
        <SettingRow icon={Heart} label="Salud financiera" onClick={() => navigate('/insights/health')} />
        <SettingRow icon={HelpCircle} label="¿Puedo permitirlo?" onClick={() => navigate('/insights/affordability')} />
        <SettingRow icon={FlaskConical} label="Simulador" onClick={() => navigate('/insights/simulator')} />
        <SettingRow icon={Download} label="Exportación" onClick={() => navigate('/insights/export')} />
      </div>

      <button
        onClick={handleLogout}
        className="btn-secondary w-full text-rose-500 hover:bg-rose-500/5 hover:border-rose-500/20"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>

      <p className="text-center text-xs text-ink-400 pb-2">Finlytech v1.0.0 · Financial OS</p>

      {/* Notificaciones */}
      <Sheet open={showNotif} onClose={() => setShowNotif(false)} title="Notificaciones" subtitle="Elige qué alertas recibir">
        <div className="space-y-1 mb-5">
          {([
            { key: 'upcomingPayments', icon: Bell, label: 'Pagos próximos', desc: 'Aviso 3 días antes de un vencimiento.' },
            { key: 'goalProgress', icon: TrendingUp, label: 'Progreso de metas', desc: 'Cuando alcanzas un hito.' },
            { key: 'unusualSpending', icon: AlertTriangle, label: 'Gasto inusual', desc: 'Si superas tu promedio en una categoría.' },
            { key: 'weeklyReport', icon: Repeat, label: 'Reporte semanal', desc: 'Resumen cada domingo.' },
            { key: 'budgetAlerts', icon: Wallet, label: 'Alertas presupuesto', desc: 'Al llegar al 80% o superar un límite.' },
          ] as const).map(({ key, icon: Icon, label, desc }) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-ink-50 dark:bg-ink-800 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-ink-500 dark:text-ink-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-ink-400 leading-snug">{desc}</p>
              </div>
              <Toggle
                active={notifPrefs[key]}
                onToggle={() => setNotifPrefs({ [key]: !notifPrefs[key] })}
              />
            </div>
          ))}
        </div>
        <button onClick={() => setShowNotif(false)} className="btn-primary w-full"><Check size={15} /> Guardado automáticamente</button>
      </Sheet>

      {/* Accesibilidad */}
      <Sheet open={showA11y} onClose={() => setShowA11y(false)} title="Accesibilidad" subtitle="Personaliza la experiencia visual">
        <div className="space-y-3 mb-5">
          {([
            { key: 'largeText', icon: Type, label: 'Texto grande', desc: 'Aumenta el tamaño base de la fuente.' },
            { key: 'reduceMotion', icon: Vibrate, label: 'Reducir movimiento', desc: 'Desactiva animaciones y transiciones.' },
            { key: 'highContrast', icon: Eye, label: 'Alto contraste', desc: 'Mayor contraste para mejor legibilidad.' },
          ] as const).map(({ key, icon: Icon, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60">
              <div className="flex items-center gap-3">
                <Icon size={17} className="text-ink-500 dark:text-ink-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-ink-400">{desc}</p>
                </div>
              </div>
              <Toggle
                active={a11yPrefs[key]}
                onToggle={() => setA11yPrefs({ [key]: !a11yPrefs[key] })}
              />
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 mb-4">
          <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">Los cambios se aplican de inmediato y se guardan automáticamente.</p>
        </div>
        <button onClick={() => setShowA11y(false)} className="btn-secondary w-full">Cerrar</button>
      </Sheet>

      {/* Seguridad */}
      <Sheet open={showSecurity} onClose={() => setShowSecurity(false)} title="Seguridad y privacidad">
        <div className="space-y-3 mb-5">
          <button
            onClick={() => { setShowSecurity(false); setTimeout(() => setShowChangePassword(true), 200); }}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink-900 flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound size={16} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Cambiar contraseña</p>
              <p className="text-xs text-ink-400">Actualiza tu contraseña de acceso.</p>
            </div>
            <ChevronRight size={15} className="text-ink-300" />
          </button>
          {[
            { icon: Fingerprint, label: 'Biometría', desc: 'Usa huella o Face ID para acceder.' },
            { icon: Shield, label: 'Política de privacidad', desc: 'Cómo protegemos tus datos.' },
          ].map(({ icon: Icon, label, desc }) => (
            <button key={label} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink-900 flex items-center justify-center shrink-0 shadow-xs">
                <Icon size={16} className="text-ink-500 dark:text-ink-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-ink-400">{desc}</p>
              </div>
              <ChevronRight size={15} className="text-ink-300" />
            </button>
          ))}
        </div>
        <div className="pt-4 border-t border-ink-100 dark:border-ink-800 mb-5">
          <p className="text-xs font-bold text-rose-500 mb-3">Zona peligrosa</p>
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors text-left">
            <AlertTriangle size={16} className="text-rose-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-500">Borrar todos mis datos</p>
              <p className="text-xs text-ink-400">Esta acción es irreversible.</p>
            </div>
          </button>
        </div>
        <button onClick={() => setShowSecurity(false)} className="btn-secondary w-full">Cerrar</button>
      </Sheet>

      {/* Cambiar contraseña */}
      <Sheet open={showChangePassword} onClose={() => { setShowChangePassword(false); setPassError(''); setPassSuccess(false); }} title="Cambiar contraseña">
        <AnimatePresence mode="wait">
          {passSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="font-bold text-ink-900 dark:text-zinc-100">¡Contraseña actualizada!</p>
              <p className="text-sm text-ink-400">Recibirás un email de confirmación.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleChangePassword} className="space-y-4">
              {passError && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                  <AlertCircle size={14} className="text-rose-400 shrink-0" />
                  <p className="text-sm text-rose-400">{passError}</p>
                </div>
              )}
              {([
                { label: 'Contraseña actual', value: currentPass, onChange: setCurrentPass, placeholder: 'Tu contraseña actual' },
                { label: 'Nueva contraseña', value: newPass, onChange: setNewPass, placeholder: 'Mín. 8 caracteres' },
                { label: 'Confirmar nueva contraseña', value: confirmPass, onChange: setConfirmPass, placeholder: 'Repite la nueva contraseña' },
              ] as const).map(({ label, value, onChange, placeholder }) => (
                <div key={label}>
                  <label className="block text-xs font-bold text-ink-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300 dark:text-zinc-600" />
                    <input type={showPasses ? 'text' : 'password'} value={value}
                      onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required
                      className="input w-full pl-9 pr-9 text-sm" />
                    <button type="button" onClick={() => setShowPasses(!showPasses)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500 transition-colors">
                      <Eye size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={changingPass} className="btn-primary w-full">
                {changingPass
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                  : <><KeyRound size={15} />Cambiar contraseña</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Sheet>

      {/* Editar perfil */}
      <Sheet open={showEditProfile} onClose={() => setShowEditProfile(false)} title="Editar perfil">
        <div className="space-y-5">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${editColor}, ${editColor}99)` }}>
              {editName ? editName[0].toUpperCase() : 'U'}
            </div>
          </div>
          {/* Name */}
          <div>
            <label className="label mb-2 block">Nombre</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                className="input pl-10" placeholder="Tu nombre" />
            </div>
          </div>
          {/* Color picker */}
          <div>
            <label className="label mb-2 block">Color de avatar</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setEditColor(c)}
                  className={cn('w-8 h-8 rounded-xl transition-all', editColor === c ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'hover:scale-105')}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={handleSaveProfile} disabled={savingProfile || !editName.trim()} className="btn-primary w-full">
            {savingProfile
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
              : <><Check size={15} />Guardar cambios</>}
          </button>
        </div>
      </Sheet>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────────────── */
function Toggle({ active, onToggle }: { active: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn('w-11 h-6 rounded-full transition-all relative shrink-0', active ? 'bg-amber-500' : 'bg-ink-200 dark:bg-ink-700')}
      style={active ? { boxShadow: '0 0 8px rgba(212,175,55,0.4)' } : {}}
    >
      <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-all duration-200', active ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function SettingRow({ icon: Icon, label, onClick, badge, children }: {
  icon: React.ElementType;
  label: string; onClick: () => void; badge?: number; children?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-4 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors text-left">
      <div className="w-9 h-9 rounded-xl bg-ink-50 dark:bg-ink-800/60 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-ink-500 dark:text-ink-400" />
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{badge}</span>
      )}
      {children || <ChevronRight size={15} className="text-ink-300" />}
    </button>
  );
}

function ModeBtn({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('p-4 rounded-2xl border-2 transition-all text-left', active ? 'border-amber-500 bg-amber-500/5' : 'border-ink-100 dark:border-ink-800/60 hover:border-ink-200 dark:hover:border-ink-700')}
    >
      <div className="mb-2">{icon}</div>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
    </button>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: 'emerald' | 'amber' | 'rose' }) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-500',
    rose: 'bg-rose-500/10 text-rose-500',
  };
  return (
    <span className={cn('pill text-[10px]', colors[color])}>
      {label}: <span className="font-bold">{value}</span>
    </span>
  );
}
