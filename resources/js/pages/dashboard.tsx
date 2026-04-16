import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { AdminOverview } from '@/components/dashboard/admin-overview';
import { HROverview } from '@/components/dashboard/hr-overview';
import { EmployeeOverview } from '@/components/dashboard/employee-overview';

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

                {isSuperAdmin && <AdminOverview />}
                {isHR && <HROverview />}
                {isEmployee && <EmployeeOverview />}
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
