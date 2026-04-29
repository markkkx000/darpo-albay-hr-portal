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
            
            <div className="p-4 w-full max-w-4xl mx-auto space-y-6">
                <div className="liquid-glass flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="liquid-glass-title text-3xl font-bold tracking-tight">Edit Employee Record</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Update the information for {employee.first_name} {employee.last_name}.
                        </p>
                    </div>
                </div>

                <Card className="liquid-glass-card border-none shadow-xl">
                    <CardContent className="pt-6">
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
