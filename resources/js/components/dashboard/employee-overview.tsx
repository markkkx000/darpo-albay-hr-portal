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
                <div className="group relative min-h-[400px] overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#2192FF] rounded-full shadow-[0_0_8px_rgba(33,146,255,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Clocked in</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Today at 8:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#38E54D] rounded-full shadow-[0_0_8px_rgba(56,229,77,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Leave request submitted</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Vacation - 3 days (Pending approval)</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#9CFF2E] rounded-full shadow-[0_0_8px_rgba(156,255,46,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Timesheet approved</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Week of April 8-14, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#FDFF00] rounded-full shadow-[0_0_8px_rgba(253,255,0,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Overtime logged</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">2 hours on April 10, 2026</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group relative min-h-[400px] overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="focus-glow p-4 text-left bg-[#2192FF]/10 dark:bg-[#2192FF]/20 hover:bg-[#2192FF]/20 dark:hover:bg-[#2192FF]/30 rounded-xl border border-[#2192FF]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-[#2192FF] dark:text-[#2192FF] drop-shadow-sm">Clock In/Out</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Record your attendance</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#38E54D]/10 dark:bg-[#38E54D]/20 hover:bg-[#38E54D]/20 dark:hover:bg-[#38E54D]/30 rounded-xl border border-[#38E54D]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#38E54D] drop-shadow-sm">Request Leave</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Submit vacation or sick leave requests</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#9CFF2E]/10 dark:bg-[#9CFF2E]/20 hover:bg-[#9CFF2E]/20 dark:hover:bg-[#9CFF2E]/30 rounded-xl border border-[#9CFF2E]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#9CFF2E] drop-shadow-sm">View Timesheet</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Check your work hours and overtime</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#FDFF00]/10 dark:bg-[#FDFF00]/20 hover:bg-[#FDFF00]/20 dark:hover:bg-[#FDFF00]/30 rounded-xl border border-[#FDFF00]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#FDFF00] drop-shadow-sm">My Profile</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Update personal information</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
