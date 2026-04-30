import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/50 backdrop-blur-md border border-black/5 dark:border-white/5',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'relative flex items-center rounded-lg px-4 py-2 transition-all duration-300',
                        appearance === value
                            ? 'text-[#030f04] font-bold'
                            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200',
                    )}
                >
                    {appearance === value && (
                        <motion.div 
                            layoutId="appearance-active"
                            className="sidebar-active-gradient absolute inset-0 rounded-lg"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                    )}
                    <span className="relative z-10 flex items-center">
                        <Icon className={cn("-ml-1 h-4 w-4 transition-transform", appearance === value && "scale-110")} />
                        <span className="ml-2 text-sm">{label}</span>
                    </span>
                </button>
            ))}
        </div>
    );
}
