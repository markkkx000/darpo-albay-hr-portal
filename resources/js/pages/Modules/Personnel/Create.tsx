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
            
            <div className="p-4 w-full max-w-4xl mx-auto space-y-6">
                <div className="liquid-glass flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="liquid-glass-title text-3xl font-bold tracking-tight">Add New Employee</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Enter the personal and professional details for the new staff member.
                        </p>
                    </div>
                </div>
                
                <Card className="liquid-glass-card border-none shadow-xl">
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
