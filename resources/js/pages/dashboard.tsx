import { Head, usePage } from '@inertiajs/react';
import { AdminOverview } from '@/components/dashboard/admin-overview';
import { EmployeeOverview } from '@/components/dashboard/employee-overview';
import { HROverview } from '@/components/dashboard/hr-overview';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const { auth } = usePage().props;
    const isSuperAdmin = auth.roles?.includes('super_admin');
    const isHR = auth.roles?.includes('hr_admin') || auth.roles?.includes('hr_staff');
    const isEmployee = !isSuperAdmin && !isHR;

    return (
        <>
            <Head title={`${isSuperAdmin ? 'Admin' : isHR ? 'HR' : 'Employee'} Dashboard`} />
            <div className="flex animate-fade-up h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6 transition-all duration-500">
                <div className="mb-8 px-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm mb-2 transition-all">
                        {isSuperAdmin ? 'Admin Dashboard' : isHR ? 'HR Dashboard' : 'Employee Dashboard'}
                    </h1>
                    <p className="text-lg font-medium text-gray-500 dark:text-gray-400 tracking-wide opacity-90">
                        {isSuperAdmin
                            ? 'System administration and management overview'
                            : isHR
                                ? 'Human Resources management and employee overview'
                                : 'Your personal workspace and attendance overview'
                        }
                    </p>
                </div>

                <div className="space-y-8">
                    {isSuperAdmin && <AdminOverview />}
                    {isHR && <HROverview />}
                    {isEmployee && <EmployeeOverview />}
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
