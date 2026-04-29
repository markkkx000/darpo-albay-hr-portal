import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <div className="relative min-h-svh w-full overflow-x-hidden">
            <div className="premium-bg-container pointer-events-none fixed inset-0 z-0" aria-hidden="true">
                <div className="liquid-orb" />
                <div className="orb-reflection" />
                <div className="liquid-orb-mini" />
                <div className="grain-overlay" />
            </div>
            <div className="relative z-10 flex min-h-svh w-full flex-col">
                <SidebarProvider defaultOpen={isOpen}>
                    {children}
                </SidebarProvider>
            </div>
        </div>
    );
}
