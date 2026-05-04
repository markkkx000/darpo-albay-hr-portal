import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-2 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <Link 
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'relative flex items-center rounded-xl px-4 py-2.5 transition-all duration-300',
                                        active
                                            ? 'text-[#030f04] font-bold'
                                            : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/5',
                                    )}
                                >
                                    {active && (
                                        <motion.div 
                                            layoutId="settings-active"
                                            className="sidebar-active-gradient absolute inset-0 rounded-xl"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center">
                                        {item.icon && (
                                            <item.icon className={cn("mr-2 h-4 w-4 transition-transform", active && "scale-110")} />
                                        )}
                                        {item.title}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
