import { Head } from '@inertiajs/react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';

interface Props {
    employee: any;
}

export default function MyRecord({ employee }: Props) {
    return (
        <>
            <Head title={`My Personnel Record`} />
            
            <div className="space-y-6 p-4 max-w-5xl mx-auto">
                <EmployeeCard employee={employee} />
            </div>
        </>
    );
}

MyRecord.layout = {
    breadcrumbs: [
        { title: 'Profile', href: '#' }
    ],
};
