import { Activity } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

export function EmployeeOverview() {
    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Today's Status"
                    value="--"
                    subtitle="--:-- --"
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Leave Balance"
                    value="--"
                    subtitle="days remaining"
                    accentColor="#38E54D"
                />
                <StatCard
                    title="This Month"
                    value="--"
                    subtitle="working days"
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="t-headline mb-4">Recent Activity</h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px]">Your clock-in history, leave requests, and timesheets will appear here.</p>
                        </div>
                    </div>
                </div>

                <div className="matte-card elev-2 min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="t-headline mb-4">Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="matte-card elev-1 p-4 text-left border border-border-2 pointer-events-none opacity-60">
                                <div className="font-medium text-foreground transition-colors">Clock In/Out <span className="text-xs font-normal text-muted-foreground ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground mt-1">Record your attendance</div>
                            </button>
                            <button className="matte-card elev-1 p-4 text-left border border-border-2 pointer-events-none opacity-60">
                                <div className="font-medium text-foreground transition-colors">Request Leave <span className="text-xs font-normal text-muted-foreground ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground mt-1">Submit vacation or sick leave requests</div>
                            </button>
                            <button className="matte-card elev-1 p-4 text-left border border-border-2 pointer-events-none opacity-60">
                                <div className="font-medium text-foreground transition-colors">View Timesheet <span className="text-xs font-normal text-muted-foreground ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground mt-1">Check your work hours and overtime</div>
                            </button>
                            <button className="matte-card elev-1 p-4 text-left border border-border-2 pointer-events-none opacity-60">
                                <div className="font-medium text-foreground transition-colors">My Profile <span className="text-xs font-normal text-muted-foreground ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground mt-1">Update personal information</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
