import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent } from '@/components/ui/card';
import { store as storeRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    departments: any[];
    positions: any[];
    employmentStatuses: any[];
}

export default function Create({ departments, positions, employmentStatuses }: Props) {
    const handleSubmit = (data: any) => {
        router.post(storeRoute().url, data, {
            onSuccess: () => {
                toast.success('Employee created successfully');
                router.clearHistory();
            },
        });
    };

    return (
        <>
            <Head title="Add Employee" />
            
            <div className="p-4 w-full max-w-4xl mx-auto space-y-6">
                <div className="matte-card elev-1 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Add New Employee</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Enter the personal and professional details for the new staff member.
                        </p>
                    </div>
                </div>
                
                <Card className="matte-card elev-2 border-none">
                    <CardContent className="pt-6">
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
