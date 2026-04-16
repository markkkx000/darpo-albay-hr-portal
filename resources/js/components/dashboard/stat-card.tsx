import type { ReactNode } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    gradientClasses: string;
    titleClasses: string;
    valueClasses: string;
    subtitleClasses?: string;
    patternClasses: string;
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
    patternClasses,
    children,
}: StatCardProps) {
    return (
        <div className={cn(
            "relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br",
            gradientClasses
        )}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className={cn("text-2xl font-bold", titleClasses)}>{title}</div>
                    <div className={cn("text-4xl font-bold", valueClasses)}>{value}</div>
                    {subtitle && (
                        <div className={cn("text-sm mt-2", subtitleClasses)}>
                            {subtitle}
                        </div>
                    )}
                    {children}
                </div>
            </div>
            <PlaceholderPattern className={cn("absolute inset-0 size-full", patternClasses)} />
        </div>
    );
}
