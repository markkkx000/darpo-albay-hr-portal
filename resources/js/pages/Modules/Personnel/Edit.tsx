import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { update as updateRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    employee: any;
    departments: any[];
    positions: any[];
    employmentStatuses: any[];
}

export default function Edit({ employee, departments, positions, employmentStatuses }: Props) {
    const handleSubmit = (data: any) => {
        router.put(updateRoute({ user: employee.id }).url, data, {
            onSuccess: () => toast.success('Employee record updated successfully'),
        });
    };

    return (
        <>
            <Head title={`Edit ${employee.first_name} ${employee.last_name}`} />
            
            <div className="p-4 max-w-4xl mx-auto">
                <Card className="liquid-glass-card border-none shadow-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Edit Employee Record</CardTitle>
                        <CardDescription>Update the information for {employee.first_name} {employee.last_name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployeeForm 
                            employee={employee}
                            departments={departments}
                            positions={positions}
                            employmentStatuses={employmentStatuses}
                            onSubmit={handleSubmit}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Edit Record', href: '#' }
    ],
};
