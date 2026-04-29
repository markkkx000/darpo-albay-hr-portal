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
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#2192FF]/10 dark:bg-[#2192FF]/20 rounded-xl border border-[#2192FF]/30 shadow-sm pointer-events-none opacity-60">
                                <div className="font-medium text-zinc-800 dark:text-[#2192FF] drop-shadow-sm transition-colors">Clock In/Out <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground opacity-90">Record your attendance</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#38E54D]/10 dark:bg-[#38E54D]/20 rounded-xl border border-[#38E54D]/30 shadow-sm pointer-events-none opacity-60">
                                <div className="font-medium text-zinc-800 dark:text-[#38E54D] drop-shadow-sm transition-colors">Request Leave <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground opacity-90">Submit vacation or sick leave requests</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#84cc16]/10 dark:bg-[#84cc16]/20 rounded-xl border border-[#84cc16]/30 shadow-sm pointer-events-none opacity-60">
                                <div className="font-medium text-zinc-800 dark:text-[#84cc16] drop-shadow-sm transition-colors">View Timesheet <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground opacity-90">Check your work hours and overtime</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#eab308]/10 dark:bg-[#eab308]/20 rounded-xl border border-[#eab308]/30 shadow-sm pointer-events-none opacity-60">
                                <div className="font-medium text-zinc-800 dark:text-[#eab308] drop-shadow-sm transition-colors">My Profile <span className="text-xs font-normal opacity-70 ml-1">(Coming Soon)</span></div>
                                <div className="text-sm text-muted-foreground opacity-90">Update personal information</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
