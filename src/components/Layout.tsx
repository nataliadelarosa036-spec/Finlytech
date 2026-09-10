import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useTheme } from '@/hooks/useTheme';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useTheme(); // applies .dark class to <html> based on store

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 transition-colors duration-200">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          {/* Subtle grid overlay — desktop only */}
          <div
            className="hidden lg:block fixed inset-0 pointer-events-none opacity-[0.25] dark:opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(19,168,161,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(19,168,161,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-8 lg:max-w-3xl">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
