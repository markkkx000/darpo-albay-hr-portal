import { Head, usePage } from '@inertiajs/react';
import { EmployeeOverview } from '@/components/dashboard/employee-overview';
import { HROverview } from '@/components/dashboard/hr-overview';
import { SuperAdminOverview } from '@/components/dashboard/super-admin-overview';
import { dashboard } from '@/routes';

export default function Dashboard({ adminData, hrData, employeeData }: any) {
    const { auth } = usePage<any>().props;
    const isSuperAdmin = auth.permissions?.includes('roles.manage');
    const isHR = auth.permissions?.includes('personnel.view') || auth.permissions?.includes('leave.manage');

    const isEmployee = !isSuperAdmin && !isHR;

    return (
        <>
            <Head title={`${isSuperAdmin ? 'Admin' : isHR ? 'HR' : 'Employee'} Dashboard`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 md:p-6 transition-opacity duration-300 ease-out">
                <div className="mb-8 px-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm mb-2">
                        {isSuperAdmin ? 'Admin Dashboard' : isHR ? 'HR Dashboard' : 'Employee Dashboard'}
                    </h1>
                    <p className="text-lg font-medium text-muted-foreground tracking-wide opacity-90">
                        {isSuperAdmin
                            ? 'System administration and management overview'
                            : isHR
                                ? 'Human Resources management and employee overview'
                                : 'Your personal workspace and attendance overview'
                        }
                    </p>
                </div>

                <div className="space-y-8">
                    {isSuperAdmin && <SuperAdminOverview adminData={adminData} hrData={hrData} employeeData={employeeData} />}
                    {!isSuperAdmin && (isSuperAdmin || isHR) && <HROverview data={hrData} employeeData={employeeData} />}
                    {isEmployee && <EmployeeOverview data={employeeData} />}
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
