import React from 'react';

export function LiquidBackground() {
    return (
        <div className="premium-bg-container pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            <div className="liquid-orb opacity-40 dark:opacity-30" />
            <div className="orb-reflection opacity-20" />
            <div className="liquid-orb-mini opacity-30 dark:opacity-20" />
            <div className="grain-overlay" />
        </div>
    );
}
