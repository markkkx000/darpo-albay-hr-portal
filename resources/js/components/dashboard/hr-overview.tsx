import { HrPriorityBoard } from '@/components/dashboard/hr-priority-board';
import { HrQuickLinks } from '@/components/dashboard/hr-quick-links';
import { LatestAnnouncements } from '@/components/dashboard/latest-announcements';
import { StatCard } from '@/components/dashboard/stat-card';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';

export function HROverview({ data, employeeData }: { data: any, employeeData?: any }) {
    const stats = data || { total_employees: 0, pending_leaves: 0, pending_docs: 0, active_today: 0, recentActivity: [], action_items: [] };

    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Employees"
                    value={stats.total_employees ?? 0}
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Pending Leaves"
                    value={stats.pending_leaves ?? 0}
                    accentColor="#38E54D"
                />
                <StatCard
                    title="Pending Docs"
                    value={stats.pending_docs ?? 0}
                    accentColor="#F43F5E"
                />
                <StatCard
                    title="Active Today"
                    value={stats.active_today ?? 0}
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2 mt-4">
                <HrPriorityBoard data={stats} layoutId="hr-overview-priority-tabs" />

                {/* Quick Links */}
                <HrQuickLinks />
            </div>

            {/* Row 3: Upcoming + Latest Announcements */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <UpcomingEvents events={employeeData?.calendar_events || []} />
                <LatestAnnouncements announcements={employeeData?.latest_announcements || []} />
            </div>
        </>
    );
}
