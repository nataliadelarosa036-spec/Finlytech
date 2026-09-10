import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, ChevronRight, ArrowRight, Sparkles,
  TrendingUp, TrendingDown, Zap, ArrowUpRight,
} from 'lucide-react';
import { useStore } from '@/state/store';
import { TopBar } from '@/components/TopBar';
import { SectionCard } from '@/components/SectionCard';
import { ProgressRing } from '@/components/ProgressRing';
import { ProgressBar } from '@/components/ProgressBar';
import { IconBadge } from '@/components/IconBadge';
import { SpendingChart } from '@/components/Charts';
import { TransactionSheet } from '@/components/TransactionSheet';
import { formatCurrency, formatPercent, formatRelativeDate } from '@/utils/format';
import { buildDashboardData, getGoalProgress, getHealthScoreColor } from '@/utils/calculations';
import { cn } from '@/utils/cn';

export function HomePage() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const darkMode = useStore((s) => s.darkMode);
  const [showAdd, setShowAdd] = useState(false);

  const dashboard = useMemo(
    () => buildDashboardData(user, accounts, transactions, goals, debts),
    [user, accounts, transactions, goals, debts],
  );

  const cashFlowMax = Math.max(...dashboard.cashFlow.map((c) => Math.abs(c.balance)), 1);
  const healthColor = getHealthScoreColor(dashboard.healthScore.total);

  return (
    <div className="page-enter space-y-5">
      <TopBar />

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/25">
        {/* Background orbs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/10 blur-2xl" />

        <div className="relative p-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60 mb-1">
            Disponible para gastar
          </p>

          <p className="text-[3.25rem] font-bold leading-none tracking-tight font-display stat-enter">
            {formatCurrency(dashboard.availableToSpend)}
          </p>

          <p className="text-sm text-white/70 mt-2">
            ≈ <span className="font-semibold text-white">{formatCurrency(dashboard.dailyAllowance)}</span> por día
          </p>

          {/* Stats row */}
          <div className="flex gap-5 mt-5 pt-5 border-t border-white/15">
            <Stat label="Ingresos" value={formatCurrency(dashboard.monthlyIncome)} up />
            <Stat label="Gastos" value={formatCurrency(dashboard.monthlyExpenses)} />
            <Stat label="Ahorro" value={formatPercent(dashboard.savingsRate, 1)} neutral />
          </div>
        </div>
      </div>

      {/* ── Quick actions ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary flex-1 py-3"
        >
          <Plus size={17} />
          Registrar
        </button>
        <button
          onClick={() => navigate('/insights')}
          className="btn-secondary flex-1 py-3"
        >
          <Zap size={16} className="text-amber-500" />
          ¿Qué hago?
        </button>
      </div>

      {/* ── Next income / next payment ────────────────────────────────────── */}
      {(dashboard.nextIncome || dashboard.nextPayment) && (
        <div className="grid grid-cols-2 gap-3">
          {dashboard.nextIncome && (
            <div className="card p-4 space-y-1">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={13} className="text-emerald-500" />
                <p className="label">Próximo ingreso</p>
              </div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-tight">
                +{formatCurrency(dashboard.nextIncome.amount)}
              </p>
              <p className="text-xs text-ink-400 truncate">{dashboard.nextIncome.description}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                {formatRelativeDate(dashboard.nextIncome.date)}
              </p>
            </div>
          )}
          {dashboard.nextPayment && (
            <div className="card p-4 space-y-1">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingDown size={13} className="text-rose-500" />
                <p className="label">Próximo pago</p>
              </div>
              <p className="text-lg font-bold text-rose-500 tabular-tight">
                -{formatCurrency(dashboard.nextPayment.amount)}
              </p>
              <p className="text-xs text-ink-400 truncate">{dashboard.nextPayment.description}</p>
              <p className="text-[11px] text-rose-500/80 font-medium">
                {formatRelativeDate(dashboard.nextPayment.date)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Cash flow chart ────────────────────────────────────────────────── */}
      <SectionCard
        title="Flujo de caja (14 días)"
        action={<span className="text-[10px] text-ink-400">balance acumulado</span>}
      >
        <div className="flex items-end gap-1 h-20">
          {dashboard.cashFlow.map((point, i) => {
            const h = Math.max(4, (Math.abs(point.balance) / cashFlowMax) * 100);
            const isPos = point.balance >= 0;
            const isToday = i === 2;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  title={`${point.label}: ${formatCurrency(point.balance)}`}
                  className="w-full rounded-t-lg transition-all duration-500 cursor-default"
                  style={{
                    height: `${h}%`,
                    background: isToday
                      ? isPos ? 'linear-gradient(180deg, #D4AF37, #F59E0B)' : 'linear-gradient(180deg, #f43f5e, #e11d48)'
                      : isPos ? 'rgba(212,175,55,0.35)' : 'rgba(244,63,94,0.30)',
                    boxShadow: isToday ? isPos ? '0 0 8px rgba(212,175,55,0.4)' : '0 0 8px rgba(244,63,94,0.4)' : undefined,
                  }}
                />
                {isToday && (
                  <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400">Hoy</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-ink-400">Hace 2 días</span>
          <span className="text-[10px] text-ink-400">+14 días</span>
        </div>
      </SectionCard>

      {/* ── Alerts ────────────────────────────────────────────────────────── */}
      {dashboard.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboard.alerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'card p-4 flex items-start gap-3',
                alert.type === 'warning' && 'border-amber-400/20 bg-amber-500/[0.03]',
                alert.type === 'info' && 'border-emerald-500/20 bg-emerald-500/[0.03]',
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base',
                alert.type === 'warning' ? 'bg-amber-500/10' : 'bg-emerald-500/10',
              )}>
                {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div>
                <p className="text-xs font-semibold">{alert.title}</p>
                <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5 leading-relaxed">{alert.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Copilot insight ───────────────────────────────────────────────── */}
      <div
        className="card p-5 card-hover"
        onClick={() => navigate('/insights')}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
              Tu situación
            </p>
            <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">
              {dashboard.topInsight.title}
            </p>
            <p className="text-[15px] leading-relaxed text-ink-800 dark:text-ink-200 text-balance">
              {dashboard.topInsight.body}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-3">
              Ver análisis <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* ── Upcoming transactions ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="label">Próximos movimientos</h3>
          <button
            onClick={() => navigate('/money')}
            className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
          >
            Ver todos <ChevronRight size={13} />
          </button>
        </div>
        <div className="card divide-y divide-ink-50 dark:divide-ink-800/50">
          {dashboard.upcomingTransactions.length === 0 && (
            <p className="text-sm text-ink-400 text-center py-8">Sin movimientos próximos</p>
          )}
          {dashboard.upcomingTransactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-ink-50/50 dark:hover:bg-ink-800/20 transition-colors">
              <IconBadge icon={t.category.icon} color={t.category.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{t.description}</p>
                <p className="text-xs text-ink-400">{formatRelativeDate(t.date)}</p>
              </div>
              <p className={cn(
                'text-sm font-bold tabular-tight',
                t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-700 dark:text-ink-300',
              )}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Financial health ──────────────────────────────────────────────── */}
      <div
        className="card p-5 card-hover"
        onClick={() => navigate('/insights/health')}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center gap-5">
          <ProgressRing
            value={dashboard.healthScore.total}
            size={96}
            strokeWidth={7}
            color={healthColor}
            glow
          >
            <div className="text-center">
              <p className="text-xl font-bold tabular-tight font-display">{dashboard.healthScore.total}</p>
              <p className="text-[9px] text-ink-400 leading-none">/ 100</p>
            </div>
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <p className="label mb-1">Salud financiera</p>
            <p className="text-base font-bold font-display" style={{ color: healthColor }}>
              {dashboard.healthScore.label}
            </p>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1 leading-relaxed text-pretty">
              Tu ahorro y liquidez están en zona saludable.
            </p>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              Ver detalle <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* ── Goals ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="label">Tus metas</h3>
          <button
            onClick={() => navigate('/wealth')}
            className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
          >
            Ver todas <ChevronRight size={13} />
          </button>
        </div>
        {goals.length === 0 ? (
          <div className="card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-2xl">
              🎯
            </div>
            <div>
              <p className="text-sm font-bold">Sin metas activas</p>
              <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
                Crea tu primera meta de ahorro para proyectar tus avances mes a mes.
              </p>
            </div>
            <button
              onClick={() => navigate('/wealth')}
              className="btn-primary py-2 px-4 text-xs mx-auto inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Crear meta
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = getGoalProgress(goal);
              return (
                <div
                  key={goal.id}
                  className="card p-4 card-hover"
                  onClick={() => navigate('/wealth')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{goal.name}</p>
                      <p className="text-xs text-ink-400 tabular-tight">
                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-tight font-display" style={{ color: goal.color }}>
                        {Math.round(progress)}%
                      </p>
                    </div>
                  </div>
                  <ProgressBar
                    value={progress}
                    color={goal.color}
                    height="h-1.5"
                    glow={progress >= 80}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Spending chart ────────────────────────────────────────────────── */}
      <SectionCard title="Gastos este mes">
        <SpendingChart data={dashboard.spendingByCategory} dark={darkMode} />
      </SectionCard>

      <TransactionSheet open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

/* ── Helper ────────────────────────────────────────────────────────────────── */
function Stat({ label, value, up, neutral }: { label: string; value: string; up?: boolean; neutral?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-white/55 uppercase tracking-widest font-semibold mb-0.5">{label}</p>
      <p className={cn(
        'text-sm font-bold tabular-tight',
        up ? 'text-emerald-300' : neutral ? 'text-white' : 'text-rose-300',
      )}>
        {value}
      </p>
    </div>
  );
}
