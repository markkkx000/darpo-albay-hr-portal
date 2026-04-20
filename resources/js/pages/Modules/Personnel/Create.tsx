import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { store as storeRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    departments: any[];
    positions: any[];
    employmentStatuses: any[];
}

export default function Create({ departments, positions, employmentStatuses }: Props) {
    const handleSubmit = (data: any) => {
        router.post(storeRoute().url, data, {
            onSuccess: () => toast.success('Employee created successfully'),
        });
    };

    return (
        <>
            <Head title="Add Employee" />
            
            <div className="p-4 max-w-4xl mx-auto">
                <Card className="border-none shadow-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Add New Employee</CardTitle>
                        <CardDescription>Enter the personal and professional details for the new staff member.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <EmployeeForm 
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

Create.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Add Employee', href: '#' }
    ],
};
