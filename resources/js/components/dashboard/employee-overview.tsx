import { StatCard } from '@/components/dashboard/stat-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export function EmployeeOverview() {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Today's Status"
                    value="--"
                    subtitle="--:-- --"
                    gradientClasses="from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900"
                    titleClasses="text-cyan-600 dark:text-cyan-400"
                    valueClasses="text-cyan-800 dark:text-cyan-200"
                    subtitleClasses="text-cyan-600 dark:text-cyan-400"
                    patternClasses="stroke-cyan-900/10 dark:stroke-cyan-100/10"
                />
                <StatCard
                    title="Leave Balance"
                    value="--"
                    subtitle="days remaining"
                    gradientClasses="from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900"
                    titleClasses="text-rose-600 dark:text-rose-400"
                    valueClasses="text-rose-800 dark:text-rose-200"
                    subtitleClasses="text-rose-600 dark:text-rose-400"
                    patternClasses="stroke-rose-900/10 dark:stroke-rose-100/10"
                />
                <StatCard
                    title="This Month"
                    value="--"
                    subtitle="working days"
                    gradientClasses="from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900"
                    titleClasses="text-amber-600 dark:text-amber-400"
                    valueClasses="text-amber-800 dark:text-amber-200"
                    subtitleClasses="text-amber-600 dark:text-amber-400"
                    patternClasses="stroke-amber-900/10 dark:stroke-amber-100/10"
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
                                    <p className="text-sm font-medium">Clocked in</p>
                                    <p className="text-xs text-gray-500">Today at 8:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Leave request submitted</p>
                                    <p className="text-xs text-gray-500">Vacation - 3 days (Pending approval)</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Timesheet approved</p>
                                    <p className="text-xs text-gray-500">Week of April 8-14, 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Overtime logged</p>
                                    <p className="text-xs text-gray-500">2 hours on April 10, 2026</p>
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
                            <button className="p-4 text-left bg-cyan-50 dark:bg-cyan-950 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-lg border border-cyan-200 dark:border-cyan-800 transition-colors">
                                <div className="font-medium text-cyan-900 dark:text-cyan-100">Clock In/Out</div>
                                <div className="text-sm text-cyan-700 dark:text-cyan-300">Record your attendance</div>
                            </button>
                            <button className="p-4 text-left bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors">
                                <div className="font-medium text-rose-900 dark:text-rose-100">Request Leave</div>
                                <div className="text-sm text-rose-700 dark:text-rose-300">Submit vacation or sick leave requests</div>
                            </button>
                            <button className="p-4 text-left bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors">
                                <div className="font-medium text-amber-900 dark:text-amber-100">View Timesheet</div>
                                <div className="text-sm text-amber-700 dark:text-amber-300">Check your work hours and overtime</div>
                            </button>
                            <button className="p-4 text-left bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors">
                                <div className="font-medium text-indigo-900 dark:text-indigo-100">My Profile</div>
                                <div className="text-sm text-indigo-700 dark:text-indigo-300">Update personal information</div>
                            </button>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                </div>
            </div>
        </>
    );
}
