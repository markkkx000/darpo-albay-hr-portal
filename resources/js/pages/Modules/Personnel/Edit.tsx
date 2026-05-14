import { Head, useForm, router } from '@inertiajs/react';
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
    const { data, setData, put, processing, errors, transform } = useForm({
        employee_number: employee?.employee_number || '',
        first_name: employee?.first_name || '',
        middle_name: employee?.middle_name || '',
        last_name: employee?.last_name || '',
        email: employee?.email || '',
        sex: employee?.sex || '',
        date_of_birth: employee?.date_of_birth ? String(employee.date_of_birth).split('T')[0] : '',
        
        positions: employee?.positions?.length > 0
            ? employee.positions.map((p: any) => ({
                id: p.id,
                name: p.name,
                is_primary: p.pivot?.is_primary || false
            }))
            : [{ id: '', name: '', is_primary: true }],
        division_id: employee?.division_id?.toString() || '',
        unit_id: employee?.unit_id?.toString() || '',
        employment_status_id: employee?.employment_status_id?.toString() || '',
        hire_date: employee?.hire_date ? String(employee.hire_date).split('T')[0] : '',
        years_in_service: employee?.years_in_service || '',
        plantilla_number: employee?.plantilla_number || '',
        orig_date_of_appointment: employee?.orig_date_of_appointment ? String(employee.orig_date_of_appointment).split('T')[0] : '',
        date_of_latest_appointment: employee?.date_of_latest_appointment ? String(employee.date_of_latest_appointment).split('T')[0] : '',
        date_of_assumption: employee?.date_of_assumption ? String(employee.date_of_assumption).split('T')[0] : '',
        
        contact_number: employee?.contact_number || '',
        address: employee?.address || '',
        
        gsis_bp_number: employee?.gsis_bp_number || '',
        philhealth: employee?.philhealth || '',
        hdmf_pagibig_no: employee?.hdmf_pagibig_no || '',
        tin_number: employee?.tin_number || '',
        prc_id_no: employee?.prc_id_no || '',
        prc_expiration: employee?.prc_expiration ? String(employee.prc_expiration).split('T')[0] : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        transform((data) => ({
            ...data,
            unit_id: data.unit_id === 'none' ? '' : data.unit_id,
        }));

        put(updateRoute({ user: employee.id }).url, {
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
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
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
