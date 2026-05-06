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
    const canManageSettings = permissions.includes('leave.manage_settings');
    const canEncode = permissions.includes('leave.encode');
    const canManageCredits = permissions.includes('leave.manage_credits');
    const canManageTardiness = permissions.includes('leave.manage_tardiness');

    const tabs = [
        { name: 'Dashboard', href: index().url, icon: CalendarClock },
    ];

    if (canEncode) {
        tabs.push({ name: 'Calendar', href: calendar().url, icon: Calendar });
    }

    if (canManageCredits) {
        tabs.push({ name: 'Leave Credits', href: credits_index().url, icon: UserMinus });
    }

    if (canManageTardiness) {
        tabs.push({ name: 'Tardiness', href: tardiness_index().url, icon: Clock });
    }

    if (canManageSettings) {
        tabs.push({ name: 'Settings', href: settings().url, icon: Settings });
    }

    return (
        <div className="mb-6 flex space-x-4 border-b border-border-1">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.href === index().url 
                    ? url === index().url || url.startsWith(index().url + '/create') || url.includes('/edit')
                    : url.startsWith(tab.href);

                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                            'relative flex items-center space-x-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                            isActive
                                ? 'border-transparent font-semibold'
                                : 'border-transparent text-muted-foreground hover:border-border-2 hover:text-foreground'
                        )}
                    >
                        {isActive && (
                            <span
                                className="pointer-events-none absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                style={{ background: 'var(--grad-primary)' }}
                            />
                        )}
                        <Icon
                            className="h-4 w-4"
                            style={isActive ? { color: 'var(--color-primary)' } : {}}
                        />
                        <span
                            style={isActive ? {
                                background: 'var(--grad-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            } : {}}
                        >
                            {tab.name}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
