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
                'inline-flex gap-1 rounded-xl bg-surface-2 p-1 backdrop-blur-md border border-border-1',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cn(
                        'relative flex items-center rounded-full px-4 py-2 transition-all duration-300',
                        appearance === value
                            ? 'text-black font-bold'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {appearance === value && (
                        <motion.div 
                            layoutId="appearance-active"
                            className="sidebar-active-gradient absolute inset-0 rounded-full"
                            transition={{ duration: 0.2, ease: 'easeOut' }}
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
