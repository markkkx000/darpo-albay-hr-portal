import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, User as UserIcon, ChevronLeft } from 'lucide-react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';
import { PromotionHistorySection } from '@/components/Personnel/PromotionHistorySection';
import type { Employee } from '@/components/Personnel/EmployeeCard';
import { Button } from '@/components/ui/button';
import { index as indexRoute, edit as editRoute } from '@/routes/personnel';

interface Props {
    employee: Employee;
    positions: any[];
}

export default function Show({ employee, positions }: Props) {
    const { auth } = usePage().props as any;
    const canEdit = auth.permissions?.includes('personnel.manage');

    return (
        <>
            <Head title={`${[employee.first_name, employee.middle_name, employee.last_name].filter(Boolean).join(' ')} - Profile`} />
            
            <div className="space-y-6 p-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={indexRoute().url} className="mr-2">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:item-hover-gradient transition-all">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="p-2 rounded-full bg-primary/10">
                            <UserIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
                    </div>
                    {canEdit && (
                        <Button asChild variant="ghost" className="btn-ghost-specular gap-2 px-6 py-5 border-none">
                            <Link href={editRoute({ user: employee.id }).url}>
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    )}
                </div>

                <EmployeeCard employee={employee} />
                <PromotionHistorySection employee={employee} positions={positions} />
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Employee Profile', href: '#' }
    ],
};
