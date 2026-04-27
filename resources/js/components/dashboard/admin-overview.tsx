import { StatCard } from '@/components/dashboard/stat-card';

export function AdminOverview() {
    return (
        <>
        <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value="--"
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Active Sessions"
                    value="--"
                    accentColor="#38E54D"
                />
                <StatCard
                    title="System Health"
                    value="--"
                    accentColor="#9CFF2E"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2">
                <div className="group liquid-glass-card min-h-[400px]">
                    <div className="relative z-10 p-6">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent System Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#2192FF] rounded-full shadow-[0_0_8px_rgba(33,146,255,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#38E54D] rounded-full shadow-[0_0_8px_rgba(56,229,77,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">System backup completed</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:scale-[1.01]">
                                <div className="w-2 h-2 bg-[#FDFF00] rounded-full shadow-[0_0_8px_rgba(253,255,0,0.6)]"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Security update available</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group liquid-glass-card min-h-[400px]">
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
