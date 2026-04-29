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
        <SidebarProvider defaultOpen={isOpen}>
            <div className="premium-bg-container pointer-events-none z-[-1]" aria-hidden="true">
                <div 
                    className="blob-background bg-[#2192FF]" 
                    style={{ "--size": "700px", "--speed": "25s", "--color-1": "#2192FF", "--color-2": "#38E54D" } as any} 
                />
                <div 
                    className="blob-background bg-[#9CFF2E]" 
                    style={{ "--size": "500px", "--speed": "30s", "--color-1": "#9CFF2E", "--color-2": "#FDFF00", "top": "30%", "left": "70%" } as any} 
                />
                <div 
                    className="blob-background bg-[#1440CD]" 
                    style={{ "--size": "400px", "--speed": "20s", "--color-1": "#1440CD", "--color-2": "#2192FF", "top": "70%", "left": "20%" } as any} 
                />
                <div className="grain-overlay" />
            </div>
            {children}
        </SidebarProvider>
    );
}
