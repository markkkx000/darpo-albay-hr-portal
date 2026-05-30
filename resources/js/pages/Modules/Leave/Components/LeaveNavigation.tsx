import { Link, usePage } from '@inertiajs/react';
import { Calendar, CalendarClock, Clock, Settings, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { index as credits_index } from '@/routes/leave/credits/index';
import { index, calendar, settings } from '@/routes/leave/index';
import { index as tardiness_index } from '@/routes/leave/tardiness/index';

export default function LeaveNavigation() {
    const { url } = usePage();
    const { auth } = usePage().props;

    const permissions = (auth.permissions || auth.user?.permissions || []) as string[];
    const canManageSettings = permissions.includes('leave.settings.manage');
    const canEncode = permissions.includes('leave.manage');
    const canViewCredits = permissions.includes('leave.credits.view') || permissions.includes('leave.credits.manage');
    const canManageTardiness = permissions.includes('leave.tardiness.manage');

    const tabs = [
        { name: 'Dashboard', href: index().url, icon: CalendarClock },
    ];

    if (canEncode) {
        tabs.push({ name: 'Calendar', href: calendar().url, icon: Calendar });
    }

    if (canViewCredits) {
        tabs.push({ name: 'Leave Credits', href: credits_index().url, icon: UserMinus });
    }

    if (canManageTardiness) {
        tabs.push({ name: 'Tardiness', href: tardiness_index().url, icon: Clock });
    }

    if (canManageSettings) {
        tabs.push({ name: 'Settings', href: settings().url, icon: Settings });
    }

    return (
        <div className="mb-6 flex space-x-4 border-b border-border-1 overflow-x-auto whitespace-nowrap pb-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const pathname = url.split('?')[0];
                const isActive = tab.href === index().url 
                    ? pathname === index().url || pathname.startsWith(index().url + '/create') || pathname.includes('/edit')
                    : pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            'relative flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-medium rounded-xl',
                            isActive
                                ? 'border-transparent font-semibold'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        )}
                    >
                        {isActive && (
                            <span
                                className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary shadow-[0_0_8px_var(--green-glow)]"
                            />
                        )}
                        <Icon
                            className={cn("h-4 w-4", isActive && "text-primary")}
                        />
                        <span className={cn(isActive && "text-primary font-bold")}>
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
