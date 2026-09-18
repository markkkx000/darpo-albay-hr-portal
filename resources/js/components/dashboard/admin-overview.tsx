import { Link } from '@inertiajs/react';
import { Activity, UserPlus, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { userinfo } from '@/routes';
import roles from '@/routes/roles';

export function AdminOverview({ data }: { data: any }) {
    const stats = data || {
        total_users: 0,
        active_sessions: 0,
        system_health: '0%',
        recentActivity: [],
    };

    return (
        <>
            <div className="animate-fade-up grid auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value={stats.total_users ?? 0}
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Active Sessions"
                    value={stats.active_sessions ?? 0}
                    accentColor="#38E54D"
                />
                <StatCard
                    title="System Health"
                    value={stats.system_health ?? '0%'}
                    accentColor="#84cc16"
                />
            </div>

            <div className="animate-fade-up-delay-1 mt-4 grid gap-4 md:grid-cols-2">
                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 flex h-full flex-col p-6">
                        <h3 className="t-headline mb-4">
                            Recent System Activity
                        </h3>
                        {!stats.recentActivity ||
                        stats.recentActivity.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                                <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                <p className="text-sm font-medium text-muted-foreground">
                                    No recent activity
                                </p>
                                <p className="max-w-[200px] text-xs text-muted-foreground/60">
                                    System events will appear here as they
                                    occur.
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[350px] space-y-4 overflow-y-auto pr-2">
                                {stats.recentActivity.map((activity: any) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-4 rounded-lg p-3"
                                    >
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            {activity.type ===
                                            'user_registered' ? (
                                                <UserPlus className="h-4 w-4" />
                                            ) : (
                                                <FileText className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">
                                                {activity.title}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {activity.description}
                                            </p>
                                        </div>
                                        <span className="mt-1 self-start text-[10px] font-medium whitespace-nowrap text-muted-foreground/75">
                                            {activity.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="t-headline mb-4">Admin Quick Actions</h3>
                        <div className="grid gap-3">
                            <Link
                                href={roles.users.index().url}
                                className="matte-card elev-2 block border border-border-2 p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1"
                            >
                                <div className="font-semibold text-foreground transition-colors">
                                    User Management
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Manage user accounts and permissions
                                </div>
                            </Link>
                            <Link
                                href={roles.index().url}
                                className="matte-card elev-2 block border border-border-2 p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1"
                            >
                                <div className="font-semibold text-foreground transition-colors">
                                    Role Configuration
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Configure system roles and permission sets
                                </div>
                            </Link>
                            <Link
                                href={userinfo().url}
                                className="matte-card elev-2 block border border-border-2 p-4 text-left transition-transform duration-200 ease-out hover:-translate-y-1"
                            >
                                <div className="font-semibold text-foreground transition-colors">
                                    My Personnel Info
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    Update personal information
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
