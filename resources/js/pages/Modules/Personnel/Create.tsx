import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { EmployeeForm } from '@/components/Personnel/EmployeeForm';
import { Card, CardContent } from '@/components/ui/card';
import { store as storeRoute, index as indexRoute } from '@/routes/personnel';

interface Props {
    divisions: any[];
    units: any[];
    positions: any[];
    appointmentStatuses: any[];
}

export default function Create({ divisions, units, positions, appointmentStatuses }: Props) {
    const generateRandomPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const { data, setData, post, processing, errors, transform } = useForm({
        employee_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        sex: '',
        date_of_birth: '',
        civil_status: '',
        password: generateRandomPassword(),
        
        positions: [{ id: '', name: '', is_primary: true }],
        division_id: '',
        unit_id: '',
        appointment_status_id: '',
        hire_date: '',
        date_hired_government: '',
        years_in_service: '',
        plantilla_number: '',
        plantilla_position: '',
        item_number: '',
        office_per_appointment: '',
        orig_date_of_appointment: '',
        date_of_latest_appointment: '',
        date_of_assumption: '',
        date_of_separation: '',
        
        contact_number: '',
        present_address: '',
        address: '',
        
        gsis_bp_number: '',
        philhealth: '',
        hdmf_pagibig_no: '',
        tin_number: '',
        lbp_account_number: '',
        prc_id_no: '',
        prc_expiration: '',
        
        fund_code: '',
        func_activity_code: '',
        profile_picture: null as File | null,
        salary_grade: '',
        salary_step: '',
        monthly_salary: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            unit_id: data.unit_id === 'none' ? '' : data.unit_id,
        }));

        post(storeRoute().url, {
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
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            divisions={divisions}
                            units={units}
                            positions={positions}
                            appointmentStatuses={appointmentStatuses}
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
