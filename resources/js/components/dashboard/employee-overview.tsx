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
                    accentColor="#9CFF2E"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent Activity</h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px]">Your clock-in history, leave requests, and timesheets will appear here.</p>
                        </div>
                    </div>
                </div>

                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="focus-glow p-4 text-left bg-[#2192FF]/10 dark:bg-[#2192FF]/20 hover:bg-[#2192FF]/20 dark:hover:bg-[#2192FF]/30 rounded-xl border border-[#2192FF]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-[#2192FF] drop-shadow-sm">Clock In/Out</div>
                                <div className="text-sm text-muted-foreground opacity-90">Record your attendance</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#38E54D]/10 dark:bg-[#38E54D]/20 hover:bg-[#38E54D]/20 dark:hover:bg-[#38E54D]/30 rounded-xl border border-[#38E54D]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-foreground dark:text-[#38E54D] drop-shadow-sm">Request Leave</div>
                                <div className="text-sm text-muted-foreground opacity-90">Submit vacation or sick leave requests</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#9CFF2E]/10 dark:bg-[#9CFF2E]/20 hover:bg-[#9CFF2E]/20 dark:hover:bg-[#9CFF2E]/30 rounded-xl border border-[#9CFF2E]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-foreground dark:text-[#9CFF2E] drop-shadow-sm">View Timesheet</div>
                                <div className="text-sm text-muted-foreground opacity-90">Check your work hours and overtime</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#FDFF00]/10 dark:bg-[#FDFF00]/20 hover:bg-[#FDFF00]/20 dark:hover:bg-[#FDFF00]/30 rounded-xl border border-[#FDFF00]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-foreground dark:text-[#FDFF00] drop-shadow-sm">My Profile</div>
                                <div className="text-sm text-muted-foreground opacity-90">Update personal information</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
