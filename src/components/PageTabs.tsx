import { cn } from '@/utils/cn';

interface Tab {
    id: string;
    label: string;
    icon?: string;
}

interface PageTabsProps {
    tabs: Tab[];
    active: string;
    onChange: (id: string) => void;
    scrollable?: boolean;
}

export function PageTabs({ tabs, active, onChange, scrollable = false }: PageTabsProps) {
    return (
        <div className={cn(
            'flex gap-1 p-1 rounded-2xl bg-ink-100 dark:bg-ink-800/60 mb-5',
            scrollable && 'overflow-x-auto scrollbar-hide',
        )}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        'flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap',
                        scrollable ? 'shrink-0 px-3' : 'flex-1',
                        active === tab.id
                            ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm'
                            : 'text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200',
                    )}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
