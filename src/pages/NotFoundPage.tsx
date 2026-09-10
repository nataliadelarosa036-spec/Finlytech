import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="page-enter flex flex-col items-center justify-center min-h-[65vh] text-center px-6 space-y-6">
            {/* Animated icon */}
            <div className="relative">
                <div className="w-24 h-24 rounded-4xl gradient-brand flex items-center justify-center shadow-glow animate-float-y">
                    <Compass size={36} className="text-white" strokeWidth={2} />
                </div>
                <div className="absolute -inset-2 rounded-4xl bg-brand-500/10 blur-xl animate-pulse-soft" />
            </div>

            <div className="space-y-2">
                <p className="text-display font-bold font-display" style={{ fontSize: '5rem', lineHeight: '1' }}>404</p>
                <p className="text-xl font-bold text-ink-700 dark:text-ink-200">Página no encontrada</p>
                <p className="text-sm text-ink-400 max-w-xs mx-auto leading-relaxed">
                    La sección que buscas no existe o fue movida.
                </p>
            </div>

            <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="btn-secondary py-2.5 px-5">
                    <ArrowLeft size={15} />
                    Volver
                </button>
                <button onClick={() => navigate('/')} className="btn-primary py-2.5 px-5">
                    <Home size={15} />
                    Inicio
                </button>
            </div>
        </div>
    );
}
