import { useState } from 'react';
import { useStore } from '@/state/store';
import { useAuthStore } from '@/state/authStore';
import { TopBar } from '@/components/TopBar';
import { generateCSV, generateMonthlySummary } from '@/utils/calculations';
import { generateReportPDF } from '@/utils/generatePDF';
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ArrowDownToLine,
  FilePieChart,
  Mail,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── API base ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL ?? '';

// ─── Export definitions ────────────────────────────────────────────────────────
const EXPORTS = [
  {
    id: 'csv',
    icon: FileSpreadsheet,
    title: 'Movimientos (CSV)',
    desc: 'Todos tus movimientos en formato Excel / Google Sheets.',
    color: '#13a8a1',
    tag: 'Excel · Sheets',
  },
  {
    id: 'summary',
    icon: FileText,
    title: 'Resumen mensual',
    desc: 'Ingresos, gastos, ahorro, presupuestos y metas del mes.',
    color: '#3b82f6',
    tag: 'TXT · Imprimible',
  },
  {
    id: 'pdf',
    icon: FilePieChart,
    title: 'Estado financiero (PDF)',
    desc: 'Reporte completo con logo, eslogan, gráficas y movimientos.',
    color: '#c9a227',
    tag: 'PDF · Destacado',
    highlight: true,
  },
  {
    id: 'full',
    icon: ArrowDownToLine,
    title: 'Estado financiero completo',
    desc: 'Resumen + movimientos detallados en un solo documento TXT.',
    color: '#8b5cf6',
    tag: 'TXT · Completo',
  },
];

const EMAIL_OPTION = {
  id: 'email',
  icon: Mail,
  title: 'Enviar reporte por email',
  desc: 'Recibe el resumen del mes y el CSV de movimientos en tu correo.',
  color: '#f59e0b',
  tag: 'Email · Gratuito',
};

interface ExportPageProps { embedded?: boolean; }

export function ExportPage({ embedded }: ExportPageProps = {}) {
  const transactions = useStore((s) => s.transactions);
  const budgets = useStore((s) => s.budgets);
  const goals = useStore((s) => s.goals);
  const debts = useStore((s) => s.debts);
  const user = useStore((s) => s.user);
  // Token comes from the auth store (persisted under 'finlytech-auth')
  const accessToken = useAuthStore((s) => s.accessToken);

  const [exported, setExported] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Download handler ──────────────────────────────────────────────────────
  const download = async (id: string) => {
    setLoading(id);
    try {
      const csv = generateCSV(transactions);
      const summary = generateMonthlySummary(transactions, budgets, goals, debts);

      if (id === 'csv') {
        triggerDownload(csv, 'finlytech-movimientos.csv', 'text/csv');
      } else if (id === 'summary') {
        triggerDownload(summary, 'finlytech-resumen-mensual.txt', 'text/plain');
      } else if (id === 'full') {
        const full = `${summary}\n\n${'='.repeat(40)}\n\nMOVIMIENTOS:\n\n${csv}`;
        triggerDownload(full, 'finlytech-estado-financiero.txt', 'text/plain');
      } else if (id === 'pdf') {
        const doc = await generateReportPDF(transactions, budgets, goals, debts, user.name);
        const month = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
        doc.save(`finlytech-reporte-${month.replace(/\s/g, '-')}.pdf`);
      }

      setExported(id);
      setTimeout(() => setExported(null), 3000);
    } catch (err) {
      console.error(err);
      showToast('err', 'Error al generar el archivo. Intenta de nuevo.');
    } finally {
      setLoading(null);
    }
  };

  // ── Email handler ─────────────────────────────────────────────────────────
  const sendEmail = async () => {
    setLoading('email');
    try {
      const csv = generateCSV(transactions);
      const summary = generateMonthlySummary(transactions, budgets, goals, debts);
      const monthLabel = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

      // Token comes from Zustand authStore (persisted in localStorage under 'finlytech-auth')
      const res = await fetch(`${API}/api/reports/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ summary, csvData: csv, monthLabel }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');

      showToast('ok', `Reporte enviado a ${user.email}`);
      setExported('email');
      setTimeout(() => setExported(null), 3000);
    } catch (err: any) {
      showToast('err', err.message ?? 'No se pudo enviar el email.');
    } finally {
      setLoading(null);
    }
  };

  // ── Utility ───────────────────────────────────────────────────────────────
  const triggerDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={embedded ? 'space-y-5' : 'page-enter space-y-5'}>
      {!embedded && <TopBar />}

      <div>
        <h1 className="text-hero font-bold font-display">Exportación</h1>
        <p className="text-sm text-ink-400 mt-1">Descarga o envía tus datos financieros</p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'card p-4 flex items-center gap-3 animate-slide-down',
            toast.type === 'ok'
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-red-500/20 bg-red-500/5',
          )}
        >
          <CheckCircle2
            size={18}
            className={cn(
              'shrink-0',
              toast.type === 'ok' ? 'text-emerald-500' : 'text-red-500',
            )}
          />
          <p
            className={cn(
              'text-sm font-semibold',
              toast.type === 'ok' ? 'text-emerald-500' : 'text-red-500',
            )}
          >
            {toast.msg}
          </p>
        </div>
      )}

      {/* Download options */}
      <div className="space-y-3">
        {EXPORTS.map((ex) => {
          const Icon = ex.icon;
          const isLoading = loading === ex.id;
          const isDone = exported === ex.id;

          return (
            <button
              key={ex.id}
              onClick={() => download(ex.id)}
              disabled={!!loading}
              className={cn(
                'card w-full text-left p-5 flex items-center gap-4 card-hover disabled:opacity-60 disabled:cursor-not-allowed',
                ex.highlight && 'ring-1',
              )}
              style={ex.highlight ? { borderColor: `${ex.color}40` } : undefined}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${ex.color}15` }}
              >
                {isLoading
                  ? <Loader2 size={20} className="animate-spin" style={{ color: ex.color }} />
                  : isDone
                    ? <CheckCircle2 size={20} className="text-emerald-500" />
                    : <Icon size={20} style={{ color: ex.color }} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold">{ex.title}</p>
                  <span
                    className="pill text-[10px]"
                    style={{ background: `${ex.color}12`, color: ex.color }}
                  >
                    {ex.tag}
                  </span>
                </div>
                <p className="text-xs text-ink-400 leading-relaxed">{ex.desc}</p>
              </div>

              <Download size={16} className="text-ink-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Email option — separated visually */}
      <div className="pt-1">
        <p className="label mb-3">Envío por correo</p>
        <button
          onClick={sendEmail}
          disabled={!!loading}
          className="card w-full text-left p-5 flex items-center gap-4 card-hover disabled:opacity-60 disabled:cursor-not-allowed ring-1"
          style={{ borderColor: `${EMAIL_OPTION.color}40` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${EMAIL_OPTION.color}15` }}
          >
            {loading === 'email'
              ? <Loader2 size={20} className="animate-spin" style={{ color: EMAIL_OPTION.color }} />
              : exported === 'email'
                ? <CheckCircle2 size={20} className="text-emerald-500" />
                : <Mail size={20} style={{ color: EMAIL_OPTION.color }} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold">{EMAIL_OPTION.title}</p>
              <span
                className="pill text-[10px]"
                style={{ background: `${EMAIL_OPTION.color}12`, color: EMAIL_OPTION.color }}
              >
                {EMAIL_OPTION.tag}
              </span>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed">
              {EMAIL_OPTION.desc}
              {user.email && (
                <> &mdash; se enviará a <strong className="text-ink-300">{user.email}</strong></>
              )}
            </p>
          </div>

          <Mail size={16} className="text-ink-300 shrink-0" />
        </button>
      </div>

      {/* Info section */}
      <div className="card p-5">
        <p className="label mb-4">¿Qué incluye cada exportación?</p>
        <div className="space-y-4">
          {[
            { icon: '📊', title: 'CSV', body: 'Fecha, tipo, descripción, categoría, cuenta y monto. Compatible con Excel, Google Sheets y Numbers.' },
            { icon: '📋', title: 'Resumen mensual', body: 'Ingresos, gastos, ahorro, tasa de ahorro, deuda total, gastos por categoría y progreso de metas.' },
            { icon: '📄', title: 'PDF', body: 'Reporte profesional con logo de Finlytech, eslogan, resumen ejecutivo, tablas de presupuestos, metas y movimientos recientes.' },
            { icon: '📁', title: 'Estado completo (TXT)', body: 'Resumen mensual + movimientos detallados combinados en un solo documento para imprimir o archivar.' },
            { icon: '✉️', title: 'Email', body: 'Recibe el resumen del mes directamente en tu correo con el CSV de movimientos como archivo adjunto.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold mb-0.5">{item.title}</p>
                <p className="text-xs text-ink-400 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
