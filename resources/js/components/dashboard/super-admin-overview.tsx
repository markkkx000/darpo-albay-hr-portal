import { Link, router } from '@inertiajs/react';
import { Activity, FileText, Shield, Users, Settings } from 'lucide-react';
import { useState } from 'react';
import { HrPriorityBoard } from '@/components/dashboard/hr-priority-board';
import { HrQuickLinks } from '@/components/dashboard/hr-quick-links';
import { LatestAnnouncements } from '@/components/dashboard/latest-announcements';
import { StatCard } from '@/components/dashboard/stat-card';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { UpcomingMilestones } from '@/components/dashboard/upcoming-milestones';
import { Button } from '@/components/ui/button';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { userinfo } from '@/routes';
import auditRoutes from '@/routes/audit';
import personnel from '@/routes/personnel';
import roles from '@/routes/roles';

export function SuperAdminOverview({
    adminData,
    hrData,
    employeeData,
}: {
    adminData: any;
    hrData: any;
    employeeData?: any;
}) {
    const admin = adminData || {
        total_users: 0,
        active_sessions: 0,
        failed_jobs: 0,
        recentActivity: [],
    };
    const hr = hrData || {
        total_employees: 0,
        pending_leaves: 0,
        pending_docs: 0,
        active_today: 0,
        recentActivity: [],
        action_items: [],
    };
    const emp = employeeData || {
        calendar_events: [],
        latest_announcements: [],
    };

    const [topTab, setTopTab] = useState('system-admin');

    return (
        <>
            {/* Row 1: Unified Stat Cards */}
            <div className="animate-fade-up grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-6">
                <StatCard
                    title="Total Employees"
                    value={hr.total_employees ?? 0}
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Active Sessions"
                    value={admin.active_sessions ?? 0}
                    accentColor="#38E54D"
                />
                <StatCard
                    title="Failed Jobs"
                    value={admin.failed_jobs ?? 0}
                    accentColor={admin.failed_jobs > 0 ? '#F43F5E' : '#22c55e'}
                />
                <StatCard
                    title="Pending Leaves"
                    value={hr.pending_leaves ?? 0}
                    accentColor="#F59E0B"
                />
                <StatCard
                    title="Pending Docs"
                    value={hr.pending_docs ?? 0}
                    accentColor="#F43F5E"
                />
                <StatCard
                    title="Active Today"
                    value={hr.active_today ?? 0}
                    accentColor="#A855F7"
                />
            </div>

            {/* Row 2: Top-level tabs — System Admin vs HR Operations */}
            <div className="animate-fade-up-delay-1 mt-4">
                <div className="mb-3 flex justify-end">
                    <SlidingTabs
                        layoutId="super-admin-top-tabs"
                        tabs={[
                            {
                                value: 'system-admin',
                                label: 'System Administration',
                                active: topTab === 'system-admin',
                            },
                            {
                                value: 'hr-operations',
                                label: 'HR Operations',
                                active: topTab === 'hr-operations',
                            },
                        ]}
                        onChange={setTopTab}
                    />
                </div>

                {/* === System Administration Panel === */}
                {topTab === 'system-admin' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* System Audit Feed */}
                        <div className="matte-card elev-2 flex min-h-[400px] flex-col">
                            <div className="flex items-center justify-between border-b border-border-1 p-6">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <h3 className="t-headline">System Audit</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="btn-ghost-specular h-8"
                                    onClick={() =>
                                        router.visit(auditRoutes.index().url)
                                    }
                                >
                                    View Full Log
                                </Button>
                            </div>
                            <div className="max-h-[400px] flex-1 overflow-y-auto p-6">
                                {!admin.recentActivity ||
                                admin.recentActivity.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center opacity-50">
                                        <Activity className="h-10 w-10" />
                                        <p className="text-sm font-medium">
                                            No recent system activity
                                        </p>
                                        <p className="max-w-[200px] text-xs">
                                            System events and audit logs will
                                            appear here as they occur.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {admin.recentActivity.map(
                                            (activity: any) => (
                                                <div
                                                    key={activity.id}
                                                    className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-surface-2"
                                                >
                                                    <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                                                        <Shield className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-foreground">
                                                            {activity.title}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                                            {
                                                                activity.description
                                                            }
                                                        </p>
                                                    </div>
                                                    <span className="mt-1 self-start text-[10px] font-medium whitespace-nowrap text-muted-foreground/75">
                                                        {activity.time}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admin Quick Links — 2x2 grid */}
                        <div className="grid h-full grid-cols-2 gap-2">
                            <Link
                                href={roles.users.index().url}
                                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                            >
                                <Users className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                                <div className="text-sm font-bold">
                                    User Management
                                </div>
                            </Link>
                            <Link
                                href={roles.index().url}
                                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                            >
                                <Shield className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                                <div className="text-sm font-bold">
                                    Role Configuration
                                </div>
                            </Link>
                            <Link
                                href={personnel.index().url}
                                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                            >
                                <FileText className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                                <div className="text-sm font-bold">
                                    Employee Directory
                                </div>
                            </Link>
                            <Link
                                href={userinfo().url}
                                className="matte-card elev-2 group flex h-full min-h-[190px] flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                            >
                                <Settings className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                                <div className="text-sm font-bold">
                                    My Personnel Info
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* === HR Operations Panel === */}
                {topTab === 'hr-operations' && (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <HrPriorityBoard
                                data={hr}
                                layoutId="super-admin-hr-tabs"
                            />
                            <HrQuickLinks />
                        </div>

                        {/* Row 3: Calendar & Announcements */}
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <UpcomingEvents
                                events={emp.calendar_events || []}
                            />
                            <LatestAnnouncements
                                announcements={emp.latest_announcements || []}
                            />
                        </div>

                        {/* Row 4: Upcoming Milestones */}
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <UpcomingMilestones
                                milestones={hr.upcoming_milestones || []}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
