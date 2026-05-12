import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent } from '@/components/ui/card';
import { update as updateRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    employee: any;
    divisions: any[];
    units: any[];
    positions: any[];
    employmentStatuses: any[];
}

export default function Edit({ employee, divisions, units, positions, employmentStatuses }: Props) {
    const handleSubmit = (data: any) => {
        router.put(updateRoute({ user: employee.id }).url, data, {
            onSuccess: () => {
                toast.success('Employee record updated successfully');
                router.clearHistory();
            },
        });
    };

    return (
        <>
            <Head title={`Edit ${employee.first_name} ${employee.last_name}`} />
            
            <div className="p-4 w-full max-w-4xl mx-auto space-y-6">
                <div className="matte-card elev-1 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Edit Employee Record</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Update the information for {employee.first_name} {employee.last_name}.
                        </p>
                    </div>
                </div>

                <Card className="matte-card elev-2 border-none">
                    <CardContent className="pt-6">
                        <EmployeeForm 
                            employee={employee}
                            divisions={divisions}
                            units={units}
                            positions={positions}
                            employmentStatuses={employmentStatuses}
                            onSubmit={handleSubmit}
                            cancelUrl={indexRoute().url}
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
