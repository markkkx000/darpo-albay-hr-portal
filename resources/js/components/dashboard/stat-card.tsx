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
        background: 'linear-gradient(180deg, #040909 0%, #20101F 100%)',
        boxShadow: `
            inset 0 -80px 60px -30px ${hexToRgba(accentColor, 0.9)},
            inset 0 -40px 30px -8px ${hexToRgba(accentColor, 0.45)},
            inset 0 -20px 20px 0px rgba(255, 255, 255, 0.08),
            inset 0 0 6px -2px ${hexToRgba(accentColor, 0.2)},
            0 24px 60px rgba(0, 0, 0, 0.5)
        `,
    };

    return (
        <div
            className="group relative aspect-video overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:-translate-y-1"
            style={cardStyle}
        >
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center w-full px-4">
                    <div
                        className={cn(
                            "text-lg font-semibold tracking-tight transition-transform duration-300 group-hover:scale-105",
                            titleClasses
                        )}
                        style={{ color: accentColor }}
                    >
                        {title}
                    </div>
                    <div className={cn("mt-2 flex justify-center", valueClasses)}>
                        {isLoading ? (
                            <div
                                className="h-10 w-24 animate-pulse rounded-md"
                                style={{ background: hexToRgba(accentColor, 0.15) }}
                                aria-hidden="true"
                            />
                        ) : (
                            <div className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                                {value}
                            </div>
                        )}
                    </div>
                    {subtitle && (
                        <div className={cn("text-sm font-medium mt-3 opacity-80", subtitleClasses)}
                            style={{ color: accentColor }}>
                            {subtitle}
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
