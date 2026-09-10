import { useState } from 'react';
import { Bell, Moon, Sun, Check } from 'lucide-react';
import { useStore } from '@/state/store';
import { getGreeting } from '@/utils/format';
import { cn } from '@/utils/cn';
import { formatRelativeDate } from '@/utils/format';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const darkMode = useStore((s) => s.darkMode);
  const toggleDark = useStore((s) => s.toggleDarkMode);
  const notifications = useStore((s) => s.notifications);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);
  const markRead = useStore((s) => s.markNotificationRead);
  const debts = useStore((s) => s.debts);
  const addNotification = useStore((s) => s.addNotification);
  const [showNotif, setShowNotif] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  // Auto-generate upcoming debt payment reminders (once per session)
  useState(() => {
    debts.forEach((d) => {
      const dueDate = new Date(d.dueDate);
      const now = new Date();
      const daysUntil = Math.round((dueDate.getTime() - now.getTime()) / 86400000);
      const notifId = `debt-due-${d.id}-${dueDate.toISOString().slice(0, 7)}`;
      const alreadyExists = notifications.some((n) => n.id.startsWith(`debt-due-${d.id}`));
      if (daysUntil >= 0 && daysUntil <= 7 && !alreadyExists) {
        addNotification({
          title: daysUntil === 0 ? `Pago hoy: ${d.name}` : `Pago en ${daysUntil} días: ${d.name}`,
          body: `Cuota mínima de ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(d.minPayment)} vence el ${dueDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}.`,
          read: false,
          icon: daysUntil <= 1 ? '🚨' : '📅',
        });
      }
    });
  });

  return (
    <header className="flex items-center justify-between mb-6">
      {/* Greeting */}
      <div>
        <p className="text-[13px] text-ink-400 dark:text-ink-500 font-medium">
          {getGreeting(user.name)}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-xs text-ink-400 dark:text-ink-500">Todo bajo control</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode */}
        <button
          onClick={toggleDark}
          aria-label="Cambiar tema"
          className={cn(
            'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200',
            'text-ink-500 dark:text-ink-400',
            'hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-ink-200',
          )}
        >
          {darkMode
            ? <Sun size={17} strokeWidth={2} />
            : <Moon size={17} strokeWidth={2} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notificaciones"
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 relative',
              'text-ink-500 dark:text-ink-400',
              'hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-700 dark:hover:text-ink-200',
              showNotif && 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200',
            )}
          >
            <Bell size={17} strokeWidth={2} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-950 animate-pulse-soft" />
            )}
          </button>

          {/* Dropdown */}
          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] card shadow-float p-1.5 animate-slide-down">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold font-display">Notificaciones</p>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
                    >
                      <Check size={12} />
                      Marcar todo leído
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto scrollbar-hide divide-y divide-ink-50 dark:divide-ink-800/60">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { markRead(n.id); }}
                      className={cn(
                        'w-full text-left flex gap-3 px-3 py-3 hover:bg-ink-50 dark:hover:bg-ink-800/60 transition-colors rounded-xl',
                        !n.read && 'bg-amber-500/[0.04]',
                      )}
                    >
                      <div className={cn(
                        'w-1.5 rounded-full shrink-0 self-stretch',
                        n.read ? 'bg-transparent' : 'bg-brand-500',
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm leading-snug', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 leading-snug">{n.body}</p>
                        <p className="text-[10px] text-ink-400 mt-1.5">{formatRelativeDate(n.date)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {notifications.length === 0 && (
                  <p className="text-xs text-ink-400 text-center py-6">Sin notificaciones</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Avatar → Profile */}
        <button
          onClick={() => navigate('/profile')}
          aria-label="Ir al perfil"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white ml-1 shadow-sm hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}cc)` }}
        >
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </button>
      </div>
    </header>
  );
}
