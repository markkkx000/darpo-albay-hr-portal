import { StatCard } from '@/components/dashboard/stat-card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

export function HROverview() {
    return (
        <>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <StatCard
                    title="Total Employees"
                    value="--"
                    gradientClasses="from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
                    titleClasses="text-emerald-600 dark:text-emerald-400"
                    valueClasses="text-emerald-800 dark:text-emerald-200"
                    patternClasses="stroke-emerald-900/10 dark:stroke-emerald-100/10"
                />
                <StatCard
                    title="Pending Leaves"
                    value="--"
                    gradientClasses="from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                    titleClasses="text-orange-600 dark:text-orange-400"
                    valueClasses="text-orange-800 dark:text-orange-200"
                    patternClasses="stroke-orange-900/10 dark:stroke-orange-100/10"
                />
                <StatCard
                    title="Active Today"
                    value="--"
                    gradientClasses="from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900"
                    titleClasses="text-indigo-600 dark:text-indigo-400"
                    valueClasses="text-indigo-800 dark:text-indigo-200"
                    patternClasses="stroke-indigo-900/10 dark:stroke-indigo-100/10"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent HR Activities</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New employee onboarded</p>
                                    <p className="text-xs text-gray-500">John Doe - IT Department</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Leave request approved</p>
                                    <p className="text-xs text-gray-500">Maria Santos - 3 days vacation</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Performance review completed</p>
                                    <p className="text-xs text-gray-500">Juan Dela Cruz - Q1 2026</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Training session scheduled</p>
                                    <p className="text-xs text-gray-500">Leadership Development - Next week</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                </div>

                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">HR Quick Actions</h3>
                        <div className="grid gap-3">
                            <button className="p-4 text-left bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors">
                                <div className="font-medium text-emerald-900 dark:text-emerald-100">Employee Management</div>
                                <div className="text-sm text-emerald-700 dark:text-emerald-300">View and manage employee records</div>
                            </button>
                            <button className="p-4 text-left bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors">
                                <div className="font-medium text-orange-900 dark:text-orange-100">Leave Management</div>
                                <div className="text-sm text-orange-700 dark:text-orange-300">Approve and manage leave requests</div>
                            </button>
                            <button className="p-4 text-left bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors">
                                <div className="font-medium text-indigo-900 dark:text-indigo-100">Attendance Reports</div>
                                <div className="text-sm text-indigo-700 dark:text-indigo-300">Generate attendance and payroll reports</div>
                            </button>
                            <button className="p-4 text-left bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors">
                                <div className="font-medium text-purple-900 dark:text-purple-100">Recruitment</div>
                                <div className="text-sm text-purple-700 dark:text-purple-300">Manage job postings and applications</div>
                            </button>
                        </div>
                    </div>
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                </div>
            </div>
        </>
    );
}
