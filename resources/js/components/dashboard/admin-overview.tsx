import { Activity } from 'lucide-react';
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
                    <div className="relative z-10 p-6 h-full flex flex-col">
                        <h3 className="text-lg font-semibold tracking-tight drop-shadow-sm mb-4">Recent System Activity</h3>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px]">System events will appear here as they occur.</p>
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
