import { Head, usePage } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.roles?.includes('super_admin');
    const isHR = auth.roles?.includes('hr_admin') || auth.roles?.includes('hr_staff');
    const isEmployee = !isSuperAdmin && !isHR;

    return (
        <>
            <Head title={`${isSuperAdmin ? 'Admin' : isHR ? 'HR' : 'Employee'} Dashboard`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isSuperAdmin ? 'Admin Dashboard' : isHR ? 'HR Dashboard' : 'Employee Dashboard'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSuperAdmin
                            ? 'System administration and management overview'
                            : isHR
                                ? 'Human Resources management and employee overview'
                                : 'Your personal workspace and attendance overview'
                        }
                    </p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {isSuperAdmin && (
                        <>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">Total Users</div>
                                        <div className="text-4xl font-bold text-blue-800 dark:text-blue-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-blue-900/10 dark:stroke-blue-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active Sessions</div>
                                        <div className="text-4xl font-bold text-green-800 dark:text-green-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-green-900/10 dark:stroke-green-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">System Health</div>
                                        <div className="text-4xl font-bold text-purple-800 dark:text-purple-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-purple-900/10 dark:stroke-purple-100/10" />
                            </div>
                        </>
                    )}

                    {isHR && (
                        <>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Total Employees</div>
                                        <div className="text-4xl font-bold text-emerald-800 dark:text-emerald-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-emerald-900/10 dark:stroke-emerald-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">Pending Leaves</div>
                                        <div className="text-4xl font-bold text-orange-800 dark:text-orange-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-orange-900/10 dark:stroke-orange-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Active Today</div>
                                        <div className="text-4xl font-bold text-indigo-800 dark:text-indigo-200">--</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-indigo-900/10 dark:stroke-indigo-100/10" />
                            </div>
                        </>
                    )}

                    {isEmployee && (
                        <>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">Today's Status</div>
                                        <div className="text-4xl font-bold text-cyan-800 dark:text-cyan-200">--</div>
                                        <div className="text-sm text-cyan-600 dark:text-cyan-400 mt-2">--:-- --</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-cyan-900/10 dark:stroke-cyan-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">Leave Balance</div>
                                        <div className="text-4xl font-bold text-rose-800 dark:text-rose-200">--</div>
                                        <div className="text-sm text-rose-600 dark:text-rose-400 mt-2">days remaining</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-rose-900/10 dark:stroke-rose-100/10" />
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">This Month</div>
                                        <div className="text-4xl font-bold text-amber-800 dark:text-amber-200">--</div>
                                        <div className="text-sm text-amber-600 dark:text-amber-400 mt-2">working days</div>
                                    </div>
                                </div>
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-amber-900/10 dark:stroke-amber-100/10" />
                            </div>
                        </>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {isSuperAdmin ? 'Recent Activity' : isHR ? 'Recent HR Activities' : 'Recent Activity'}
                            </h3>
                            <div className="space-y-3">
                                {isSuperAdmin && (
                                    <>
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
                                    </>
                                )}

                                {isHR && (
                                    <>
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
                                    </>
                                )}

                                {isEmployee && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                    </div>

                    <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {isSuperAdmin ? 'Quick Actions' : isHR ? 'HR Quick Actions' : 'Quick Actions'}
                            </h3>
                            <div className="grid gap-3">
                                {isSuperAdmin && (
                                    <>
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
                                    </>
                                )}

                                {isHR && (
                                    <>
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
                                    </>
                                )}

                                {isEmployee && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/5 dark:stroke-neutral-100/5" />
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
