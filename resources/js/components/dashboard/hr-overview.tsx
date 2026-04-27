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
                    accentColor="#9CFF2E"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent HR Activities</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#2192FF] rounded-full shadow-[0_0_8px_rgba(33,146,255,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New employee onboarded</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">John Doe - IT Department</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#38E54D] rounded-full shadow-[0_0_8px_rgba(56,229,77,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Leave request approved</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Maria Santos - 3 days vacation</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#9CFF2E] rounded-full shadow-[0_0_8px_rgba(156,255,46,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Performance review completed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Juan Dela Cruz - Q1 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#FDFF00] rounded-full shadow-[0_0_8px_rgba(253,255,0,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Training session scheduled</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Leadership Development - Next week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">HR Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="focus-glow p-4 text-left bg-[#2192FF]/10 dark:bg-[#2192FF]/20 hover:bg-[#2192FF]/20 dark:hover:bg-[#2192FF]/30 rounded-xl border border-[#2192FF]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-[#2192FF] dark:text-[#2192FF] drop-shadow-sm">Employee Management</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">View and manage employee records</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#38E54D]/10 dark:bg-[#38E54D]/20 hover:bg-[#38E54D]/20 dark:hover:bg-[#38E54D]/30 rounded-xl border border-[#38E54D]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#38E54D] drop-shadow-sm">Leave Management</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Approve and manage leave requests</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#9CFF2E]/10 dark:bg-[#9CFF2E]/20 hover:bg-[#9CFF2E]/20 dark:hover:bg-[#9CFF2E]/30 rounded-xl border border-[#9CFF2E]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#9CFF2E] drop-shadow-sm">Attendance Reports</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Generate attendance and payroll reports</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#FDFF00]/10 dark:bg-[#FDFF00]/20 hover:bg-[#FDFF00]/20 dark:hover:bg-[#FDFF00]/30 rounded-xl border border-[#FDFF00]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#FDFF00] drop-shadow-sm">Recruitment</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Manage job postings and applications</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
