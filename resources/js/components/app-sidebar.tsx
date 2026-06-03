import { usePage } from '@inertiajs/react';
import { LayoutGrid, CircleHelp } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { SupportTicketModal } from '@/components/SupportTicketModal';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const dynamicNav = (auth.navigation || []) as NavItem[];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-border-1">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex h-12 w-full items-center gap-2 overflow-hidden px-2 text-left text-sm group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!">
                            <AppLogo auth={auth} />
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={[...mainNavItems, ...dynamicNav]} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SupportTicketModal>
                            <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:text-foreground cursor-pointer rounded-lg text-muted-foreground group-data-[collapsible=icon]:justify-center transition-colors">
                                <CircleHelp className="size-4 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden font-medium">Help & Support</span>
                            </button>
                        </SupportTicketModal>
                    </SidebarMenuItem>
                </SidebarMenu>

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
