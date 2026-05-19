import { Link } from '@inertiajs/react';
import { Activity, Clock, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import attendance from '@/routes/attendance';
import leave from '@/routes/leave';
import profile from '@/routes/profile';

export function EmployeeOverview({ data }: { data: any }) {
    const stats = data || {
        today_status: 'Not Clocked In',
        today_time: '--:-- --',
        leave_balances: [],
        this_month_working_days: 0,
        recentActivity: []
    };

    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Today's Status"
                    value={stats.today_status ?? 'Not Clocked In'}
                    subtitle={stats.today_time ?? '--:-- --'}
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Leave Balance"
                    value={stats.leave_balances && stats.leave_balances.length > 0 ? "" : "0"}
                    subtitle={stats.leave_balances && stats.leave_balances.length > 0 ? undefined : "days remaining"}
                    accentColor="#38E54D"
                >
                    {stats.leave_balances && stats.leave_balances.length > 0 && (
                        <div className="space-y-2 pr-2 -mt-4 max-h-[120px] overflow-y-auto scrollbar-thin pointer-events-auto">
                            {stats.leave_balances.map((lb: any) => (
                                <div key={lb.type} className="flex justify-between items-center border-b border-white/5 pb-1 last:border-0 last:pb-0">
                                    <span className="text-[11px] font-bold text-muted-foreground/90 uppercase tracking-wider truncate max-w-[125px]">{lb.type}</span>
                                    <span className="text-xl font-black text-foreground dark:text-white">{lb.balance} <span className="text-xs font-normal text-muted-foreground">days</span></span>
                                </div>
                            ))}
                        </div>
                    )}
                </StatCard>
                <StatCard
                    title="This Month"
                    value={stats.this_month_working_days ?? 0}
                    subtitle="working days"
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2 mt-4">
                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="t-headline mb-4">Recent Activity</h3>
                        {!stats.recentActivity || stats.recentActivity.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                                <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                                <p className="text-xs text-muted-foreground/60 max-w-[200px]">Your clock-in history, leave requests, and timesheets will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                {stats.recentActivity.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            {activity.type === 'my_attendance' ? (
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
                        <h3 className="t-headline mb-4">Quick Actions</h3>
                        <div className="grid gap-3">
                            <Link href={attendance.index().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">Clock In/Out</div>
                                <div className="text-sm text-muted-foreground mt-1">Record your daily time attendance logs</div>
                            </Link>
                            <Link href={leave.index().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">My Leave History</div>
                                <div className="text-sm text-muted-foreground mt-1">Check status of your leave filings and credits</div>
                            </Link>
                            <Link href={profile.edit().url} className="matte-card elev-2 p-4 text-left spring-hover block border border-border-2">
                                <div className="font-semibold text-foreground transition-colors">My Profile</div>
                                <div className="text-sm text-muted-foreground mt-1">Update contact information and review employee details</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
