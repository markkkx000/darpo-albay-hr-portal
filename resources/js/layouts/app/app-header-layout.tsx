import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    const { component } = usePage();

    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent variant="header">
                <div key={component} className="animate-fade-up flex flex-1 flex-col w-full h-full">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
