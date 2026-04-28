import { Link } from '@inertiajs/react';
import { DynamicIcon } from '@/components/dynamic-icon';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = isCurrentUrl(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={{ children: item.title }}
                                className="relative"
                            >
                                <Link href={item.href} prefetch className="relative">
                                    {active && (
                                        <div className="sidebar-active-gradient absolute inset-0 rounded-md" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {item.icon && (
                                            typeof item.icon === 'string' 
                                                ? <DynamicIcon name={item.icon} className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
                                                : <item.icon className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
                                        )}
                                        <span>{item.title}</span>
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
