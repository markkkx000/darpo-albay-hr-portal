import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SlidingTab {
    value: string;
    label: string | React.ReactNode;
    icon?: LucideIcon;
    href?: string;
    active: boolean;
}

interface SlidingTabsProps {
    tabs: SlidingTab[];
    layoutId: string;
    onChange?: (value: string) => void;
    className?: string;
}

export function SlidingTabs({ tabs, layoutId, onChange, className }: SlidingTabsProps) {
    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-full bg-surface-2 p-1 border border-border-1 w-fit',
                className
            )}
        >
            {tabs.map((tab) => {
                const content = (
                    <>
                        {tab.active && (
                            <motion.div
                                layoutId={layoutId}
                                className="sidebar-active-gradient absolute inset-0 rounded-full"
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {tab.icon && (
                                <tab.icon 
                                    className={cn(
                                        "h-4 w-4 transition-transform", 
                                        tab.active && "scale-110"
                                    )} 
                                />
                            )}
                            <span>{tab.label}</span>
                        </span>
                    </>
                );

                const commonClasses = cn(
                    'relative flex items-center justify-center rounded-full px-4 py-1.5 transition duration-300 text-sm focus:outline-none',
                    tab.active
                        ? 'text-black font-bold'
                        : 'text-muted-foreground hover:text-foreground font-medium'
                );

                if (tab.href) {
                    return (
                        <Link
                            key={tab.value}
                            href={tab.href}
                            className={commonClasses}
                        >
                            {content}
                        </Link>
                    );
                }

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={() => onChange?.(tab.value)}
                        className={commonClasses}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
}
