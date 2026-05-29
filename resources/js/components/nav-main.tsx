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
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const active = isCurrentOrParentUrl(item.href);

                    return (
                        /*
                         * `relative` lives here on the <li> so the active pill
                         * is NOT a child of the `overflow-hidden` SidebarMenuButton,
                         * which would clip it invisible.
                         */
                        <SidebarMenuItem
                            key={item.title}
                            className={cn('relative', active && 'z-20')}
                        >
                            {/* Active pill — sits at the <li> level, never clipped */}
                            {active && (
                                <motion.div
                                    layoutId="sidebar-active-pill"
                                    className="sidebar-active-gradient pointer-events-none absolute inset-0 rounded-xl"
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                />
                            )}

                            <SidebarMenuButton
                                asChild
                                isActive={false}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'relative z-10 p-0 focus-visible:!ring-0',
                                    active
                                        ? 'sidebar-transparent-hover'
                                        : 'sidebar-neutral-hover',
                                )}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        'group/link flex w-full items-center rounded-xl px-2.5 py-2',
                                        active
                                            ? 'sidebar-active-text font-bold'
                                            : 'text-sidebar-foreground/80',
                                    )}
                                >
                                    {/* Content */}
                                    <span className="flex w-full items-center group-data-[collapsible=icon]:justify-center">
                                        {item.icon && (
                                            <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                                {typeof item.icon ===
                                                'string' ? (
                                                    <DynamicIcon
                                                        name={item.icon}
                                                        className={cn(
                                                            'h-4 w-4 transition-transform duration-200',
                                                            active
                                                                ? 'scale-110 text-black'
                                                                : 'text-sidebar-foreground/80',
                                                        )}
                                                    />
                                                ) : (
                                                    <item.icon
                                                        className={cn(
                                                            'h-4 w-4 transition-transform duration-200',
                                                            active
                                                                ? 'scale-110 text-black'
                                                                : 'text-sidebar-foreground/80',
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        <span className="ml-2 truncate group-data-[collapsible=icon]:hidden">
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
