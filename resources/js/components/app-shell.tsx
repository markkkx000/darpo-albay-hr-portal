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
            <div
                className="mesh-container pointer-events-none fixed inset-0 z-0"
                aria-hidden="true"
            >
                <div className="mesh-blob bg-green-glow -top-[20%] -left-[10%] h-[600px] w-[800px]" />
                <div className="mesh-blob bg-yellow-glow top-[40%] left-[30%] h-[600px] w-[600px] delay-75" />
                <div className="mesh-blob bg-green-glow -right-[15%] -bottom-[10%] h-[500px] w-[700px] delay-150" />
                <div className="grain-overlay opacity-[0.03] dark:opacity-[0.05]" />
            </div>
            <div className="relative z-10 flex min-h-svh w-full flex-col">
                <SidebarProvider defaultOpen={isOpen}>
                    {children}
                </SidebarProvider>
            </div>
        </div>
    );
}
