import { StatCard } from '@/components/dashboard/stat-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export function AdminOverview() {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Users"
                    value="--"
                    gradientClasses="from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                    titleClasses="text-blue-600 dark:text-blue-400"
                    valueClasses="text-blue-800 dark:text-blue-200"
                    patternClasses="stroke-blue-900/10 dark:stroke-blue-100/10"
                />
                <StatCard
                    title="Active Sessions"
                    value="--"
                    gradientClasses="from-green-50 to-green-100 dark:from-green-950 dark:to-green-900"
                    titleClasses="text-green-600 dark:text-green-400"
                    valueClasses="text-green-800 dark:text-green-200"
                    patternClasses="stroke-green-900/10 dark:stroke-green-100/10"
                />
                <StatCard
                    title="System Health"
                    value="--"
                    gradientClasses="from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                    titleClasses="text-purple-600 dark:text-purple-400"
                    valueClasses="text-purple-800 dark:text-purple-200"
                    patternClasses="stroke-purple-900/10 dark:stroke-purple-100/10"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">System backup completed</p>
                                    <p className="text-xs text-gray-500">1 hour ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Security update available</p>
                                    <p className="text-xs text-gray-500">3 hours ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                </div>

                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="p-4 text-left bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
                                <div className="font-medium text-blue-900 dark:text-blue-100">User Management</div>
                                <div className="text-sm text-blue-700 dark:text-blue-300">Manage user accounts and permissions</div>
                            </button>
                            <button className="p-4 text-left bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
                                <div className="font-medium text-green-900 dark:text-green-100">System Settings</div>
                                <div className="text-sm text-green-700 dark:text-green-300">Configure system preferences</div>
                            </button>
                            <button className="p-4 text-left bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                                <div className="font-medium text-purple-900 dark:text-purple-100">Reports</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Generate system reports</div>
                            </button>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                </div>
            </div>
        </>
    );
}
