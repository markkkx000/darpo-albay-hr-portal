import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    gradientClasses: string;
    titleClasses: string;
    valueClasses: string;
    subtitleClasses?: string;
    children?: ReactNode;
}

export function StatCard({
    title,
    value,
    subtitle,
    gradientClasses,
    titleClasses,
    valueClasses,
    subtitleClasses,
    children,
}: StatCardProps) {
    const isLoading = value === '--';

    return (
        <div className={cn(
            "group relative aspect-video overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-gradient-to-br shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-md",
            gradientClasses
        )}>
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center w-full px-4">
                    <div className={cn("text-lg font-semibold tracking-tight transition-transform duration-300 group-hover:scale-105", titleClasses)}>{title}</div>
                    <div className={cn("mt-2 flex justify-center", valueClasses)}>
                        {isLoading ? (
                            <div className="h-10 w-24 animate-pulse rounded-md bg-black/10 dark:bg-white/10" aria-hidden="true" />
                        ) : (
                            <div className="text-4xl font-extrabold tracking-tight drop-shadow-sm">{value}</div>
                        )}
                    </div>
                    {subtitle && (
                        <div className={cn("text-sm font-medium mt-3 opacity-90", subtitleClasses)}>
                            {subtitle}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
