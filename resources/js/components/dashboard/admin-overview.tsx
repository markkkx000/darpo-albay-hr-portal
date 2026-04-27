import { StatCard } from '@/components/dashboard/stat-card';

export function AdminOverview() {
    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value="--"
                    gradientClasses="from-[#2192FF]/10 to-[#2192FF]/20 dark:from-[#2192FF]/20 dark:to-[#2192FF]/10"
                    titleClasses="text-[#2192FF] dark:text-[#2192FF]"
                    valueClasses="text-zinc-900 dark:text-white"
                    subtitleClasses="text-[#2192FF] dark:text-[#2192FF]"
                />
                <StatCard
                    title="Active Sessions"
                    value="--"
                    gradientClasses="from-[#38E54D]/10 to-[#38E54D]/20 dark:from-[#38E54D]/20 dark:to-[#38E54D]/10"
                    titleClasses="text-zinc-800 dark:text-[#38E54D]"
                    valueClasses="text-zinc-900 dark:text-white"
                    subtitleClasses="text-zinc-700 dark:text-[#38E54D]"
                />
                <StatCard
                    title="System Health"
                    value="--"
                    gradientClasses="from-[#9CFF2E]/10 to-[#9CFF2E]/20 dark:from-[#9CFF2E]/20 dark:to-[#9CFF2E]/10"
                    titleClasses="text-zinc-800 dark:text-[#9CFF2E]"
                    valueClasses="text-zinc-900 dark:text-white"
                    subtitleClasses="text-zinc-700 dark:text-[#9CFF2E]"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="group relative min-h-[400px] overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent System Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#2192FF] rounded-full shadow-[0_0_8px_rgba(33,146,255,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#38E54D] rounded-full shadow-[0_0_8px_rgba(56,229,77,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">System backup completed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-sm rounded-xl border border-white/30 dark:border-white/5 opacity-90 transition-all hover:opacity-100 hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#FDFF00] rounded-full shadow-[0_0_8px_rgba(253,255,0,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Security update available</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group relative min-h-[400px] overflow-hidden rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Admin Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="focus-glow p-4 text-left bg-[#2192FF]/10 dark:bg-[#2192FF]/20 hover:bg-[#2192FF]/20 dark:hover:bg-[#2192FF]/30 rounded-xl border border-[#2192FF]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-[#2192FF] dark:text-[#2192FF] drop-shadow-sm">User Management</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Manage user accounts and permissions</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#38E54D]/10 dark:bg-[#38E54D]/20 hover:bg-[#38E54D]/20 dark:hover:bg-[#38E54D]/30 rounded-xl border border-[#38E54D]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#38E54D] drop-shadow-sm">System Settings</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Configure system preferences</div>
                            </button>
                            <button className="focus-glow p-4 text-left bg-[#9CFF2E]/10 dark:bg-[#9CFF2E]/20 hover:bg-[#9CFF2E]/20 dark:hover:bg-[#9CFF2E]/30 rounded-xl border border-[#9CFF2E]/30 shadow-sm transition-all duration-300 hover:-translate-y-0.5">
                                <div className="font-medium text-zinc-800 dark:text-[#9CFF2E] drop-shadow-sm">Reports</div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 opacity-90">Generate system reports</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
