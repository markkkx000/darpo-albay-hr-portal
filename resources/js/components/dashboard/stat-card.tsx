import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    /** Hex color string e.g. '#2192FF' */
    accentColor: string;
    titleClasses?: string;
    valueClasses?: string;
    subtitleClasses?: string;
    children?: ReactNode;
}

export function StatCard({
    title,
    value,
    subtitle,
    accentColor,
    titleClasses,
    valueClasses,
    subtitleClasses,
    children,
}: StatCardProps) {
    const isLoading = value === '--';

    return (
        <div className="matte-card elev-2 relative flex flex-col gap-2 overflow-hidden p-5">
            {/* Subtle accent line on the left edge */}
            <div
                className="absolute top-0 bottom-0 left-0 w-1 opacity-80"
                style={{ backgroundColor: accentColor }}
            />

            <div
                className={cn(
                    't-caption flex items-center gap-2 pl-1',
                    titleClasses,
                )}
            >
                <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                />
                {title}
            </div>

            <div className={cn('mt-1 pl-1', valueClasses)}>
                {isLoading ? (
                    <div
                        className="h-8 w-16 animate-pulse rounded bg-muted/20"
                        aria-hidden="true"
                    />
                ) : (
                    <div className="text-3xl font-bold tracking-tight text-foreground">
                        {value}
                    </div>
                )}
            </div>

            {(subtitle || children) && (
                <div className="mt-2 flex items-center justify-between pl-1">
                    {subtitle && (
                        <div
                            className={cn(
                                'text-xs text-muted-foreground',
                                subtitleClasses,
                            )}
                        >
                            {subtitle}
                        </div>
                    )}
                    {children && (
                        <div
                            className="text-xs font-semibold"
                            style={{ color: accentColor }}
                        >
                            {children}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
