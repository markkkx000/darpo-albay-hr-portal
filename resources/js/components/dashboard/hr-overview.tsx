import { Activity } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';

export function HROverview() {
    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Employees"
                    value="--"
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Pending Leaves"
                    value="--"
                    accentColor="#38E54D"
                />
                <StatCard
                    title="Active Today"
                    value="--"
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent HR Activities</h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px]">HR actions like leave approvals and onboarding will appear here.</p>
                        </div>
                    </div>
                </div>

                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">HR Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#2192FF]/10 dark:bg-[#2192FF]/20 hover:bg-[#2192FF]/20 dark:hover:bg-[#2192FF]/30 rounded-xl border border-[#2192FF]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#2192FF] drop-shadow-sm group-hover/btn:text-[#2192FF] transition-colors">Employee Management</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">View and manage employee records</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#38E54D]/10 dark:bg-[#38E54D]/20 hover:bg-[#38E54D]/20 dark:hover:bg-[#38E54D]/30 rounded-xl border border-[#38E54D]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#38E54D] drop-shadow-sm group-hover/btn:text-[#38E54D] transition-colors">Leave Management</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Approve and manage leave requests</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#84cc16]/10 dark:bg-[#84cc16]/20 hover:bg-[#84cc16]/20 dark:hover:bg-[#84cc16]/30 rounded-xl border border-[#84cc16]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#84cc16] drop-shadow-sm group-hover/btn:text-[#84cc16] transition-colors">Attendance Reports</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Generate attendance and payroll reports</div>
                            </button>
                            <button className="group/btn focus-glow p-4 text-left backdrop-blur-md bg-[#FDFF00]/10 dark:bg-[#FDFF00]/20 hover:bg-[#FDFF00]/20 dark:hover:bg-[#FDFF00]/30 rounded-xl border border-[#FDFF00]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#FDFF00] drop-shadow-sm group-hover/btn:text-[#FDFF00] transition-colors">Recruitment</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Manage job postings and applications</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
