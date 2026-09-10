import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'default' | 'lg';
}

export function Sheet({ open, onClose, title, subtitle, children, size = 'default' }: SheetProps) {
  // Lock scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: 'rgba(11,16,32,0.55)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full bg-white dark:bg-ink-900 shadow-float animate-slide-up',
          'max-h-[92vh] overflow-hidden flex flex-col',
          'rounded-t-3xl sm:rounded-3xl',
          size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-ink-200 dark:bg-ink-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-start justify-between px-5 pt-3 pb-4 border-b border-ink-100 dark:border-ink-800/60">
          <div>
            {title && <h2 className="text-base font-bold font-display tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition-colors ml-4 shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto scrollbar-hide px-5 py-4 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
