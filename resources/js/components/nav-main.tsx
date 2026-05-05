import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { DynamicIcon } from '@/components/dynamic-icon';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

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
                                        <motion.div 
                                            layoutId="sidebar-active"
                                            className="sidebar-active-gradient absolute inset-0 rounded-xl"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center group-data-[collapsible=icon]:justify-center w-full">
                                        {item.icon && (
                                            <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                                {typeof item.icon === 'string' 
                                                    ? <DynamicIcon name={item.icon} className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
                                                    : <item.icon className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
                                                }
                                            </div>
                                        )}
                                        <span className="ml-2 truncate transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
                                            {item.title}
                                        </span>
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
