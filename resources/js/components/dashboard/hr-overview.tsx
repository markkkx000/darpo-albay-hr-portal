import { Link } from '@inertiajs/react';
import { Activity, Clock, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import announcements from '@/routes/announcements';
import attendance from '@/routes/attendance';
import leave from '@/routes/leave';
import personnel from '@/routes/personnel';

export function HROverview({ data }: { data: any }) {
    const stats = data || { total_employees: 0, pending_leaves: 0, active_today: 0, recentActivity: [] };

    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
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
                    title="Active Today"
                    value={stats.active_today ?? 0}
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2 mt-4">
                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="t-headline mb-4">Recent HR Activities</h3>
                        {!stats.recentActivity || stats.recentActivity.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                                <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                                <p className="text-xs text-muted-foreground/60 max-w-[200px]">HR actions like leave approvals and onboarding will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                {stats.recentActivity.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            {activity.type === 'attendance_clock' ? (
                                                <Clock className="h-4 w-4" />
                                            ) : (
                                                <FileText className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground/75 whitespace-nowrap self-start mt-1">
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
                        <h3 className="t-headline mb-4">HR Quick Actions</h3>
                        <div className="grid gap-3">
                            <Link href={personnel.index().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">Employee Directory</div>
                                <div className="text-sm text-muted-foreground mt-1">View and manage employee profiles and position assignments</div>
                            </Link>
                            <Link href={leave.index().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">Leave Management</div>
                                <div className="text-sm text-muted-foreground mt-1">Approve and manage leave requests, review credits</div>
                            </Link>
                            <Link href={attendance.index().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">Attendance Records</div>
                                <div className="text-sm text-muted-foreground mt-1">Check employee daily time records and punch histories</div>
                            </Link>
                            <Link href={announcements.manage().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">Announcements</div>
                                <div className="text-sm text-muted-foreground mt-1">Publish notices, policy updates, and employee news</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
