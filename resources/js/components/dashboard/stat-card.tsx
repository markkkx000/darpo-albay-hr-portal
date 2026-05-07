import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    /** Hex color string e.g. '#2192FF'. Drives the Figma-style inner glow. */
    accentColor: string;
    titleClasses?: string;
    valueClasses?: string;
    subtitleClasses?: string;
    children?: ReactNode;
    // Legacy props kept for backward compat — ignored when accentColor is present
    gradientClasses?: string;
}

/**
 * Converts a hex color to an rgba() string with the given alpha.
 */
function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    const cardStyle: React.CSSProperties = {
        background: 'var(--stat-card-bg)',
        boxShadow: `
            inset 0 -80px 60px -30px ${hexToRgba(accentColor, 0.6)},
            inset 0 -40px 30px -8px ${hexToRgba(accentColor, 0.3)},
            inset 0 -20px 20px 0px rgba(255, 255, 255, 0.2),
            inset 0 0 6px -2px ${hexToRgba(accentColor, 0.1)},
            0 24px 60px var(--stat-card-shadow-base)
        `,
    };

    return (
        <div
            className="group relative min-h-[220px] md:min-h-[260px] overflow-hidden rounded-3xl border border-border-1 transition-all duration-300 hover:-translate-y-1 shadow-sm text-left"
            style={cardStyle}
        >
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-8">
                <div>
                    <div
                        className={cn(
                            "text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-2 transition-transform duration-300 group-hover:translate-x-1",
                            titleClasses
                        )}
                    >
                        {title}
                    </div>
                    <div className={cn("mt-1", valueClasses)}>
                        {isLoading ? (
                            <div
                                className="h-14 w-28 animate-pulse rounded-2xl"
                                style={{ background: hexToRgba(accentColor, 0.15) }}
                                aria-hidden="true"
                            />
                        ) : (
                            <div className="text-5xl md:text-6xl font-extrabold tracking-tighter text-foreground dark:text-white drop-shadow-sm">
                                {value}
                            </div>
                        )}
                    </div>
                </div>
                
                {(subtitle || children) && (
                    <div className="mt-auto">
                        {subtitle && (
                            <div className={cn("text-xl md:text-2xl font-bold tracking-tight text-foreground dark:text-white mb-1", subtitleClasses)}>
                                {subtitle}
                            </div>
                        )}
                        {children && (
                            <div className="text-sm md:text-base font-semibold tracking-wide opacity-90" style={{ color: accentColor }}>
                                {children}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
