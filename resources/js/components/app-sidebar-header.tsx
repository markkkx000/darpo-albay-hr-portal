import { Breadcrumbs } from '@/components/breadcrumbs';
import NotificationBell from '@/components/notifications/NotificationBell';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="bg-background/95 sticky top-0 z-[100] flex h-16 shrink-0 items-center justify-between border-b border-border/5 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <NotificationBell />
            </div>
        </header>
    );
}

