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
        <div className="matte-card elev-2 p-5 flex flex-col gap-2 relative overflow-hidden">
            {/* Subtle accent line on the left edge */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-80" 
                style={{ backgroundColor: accentColor }} 
            />
            
            <div className={cn("t-caption pl-1 flex items-center gap-2", titleClasses)}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                {title}
            </div>
            
            <div className={cn("pl-1 mt-1", valueClasses)}>
                {isLoading ? (
                    <div className="h-8 w-16 animate-pulse rounded bg-muted/20" aria-hidden="true" />
                ) : (
                    <div className="text-3xl font-bold tracking-tight text-foreground">
                        {value}
                    </div>
                )}
            </div>

            {(subtitle || children) && (
                <div className="pl-1 mt-2 flex items-center justify-between">
                    {subtitle && (
                        <div className={cn("text-xs text-muted-foreground", subtitleClasses)}>
                            {subtitle}
                        </div>
                    )}
                    {children && (
                        <div className="text-xs font-semibold" style={{ color: accentColor }}>
                            {children}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
