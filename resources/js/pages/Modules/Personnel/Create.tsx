import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent } from '@/components/ui/card';
import { store as storeRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    divisions: any[];
    units: any[];
    positions: any[];
    employmentStatuses: any[];
}

export default function Create({ divisions, units, positions, employmentStatuses }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_number: '',
        first_name: '',
        last_name: '',
        email: '',
        sex: '',
        date_of_birth: '',
        
        position_id: '',
        division_id: '',
        unit_id: '',
        employment_status_id: '',
        hire_date: '',
        years_in_service: '',
        plantilla_number: '',
        orig_date_of_appointment: '',
        date_of_latest_appointment: '',
        date_of_assumption: '',
        
        contact_number: '',
        address: '',
        
        gsis_bp_number: '',
        philhealth: '',
        hdmf_pagibig_no: '',
        tin_number: '',
        prc_id_no: '',
        prc_expiration: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = { ...data };

        if (payload.unit_id === 'none') {
            payload.unit_id = '';
        }

        post(storeRoute().url, {
            onSuccess: () => {
                toast.success('Employee created successfully');
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
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
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

Create.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Add Employee', href: '#' }
    ],
};
