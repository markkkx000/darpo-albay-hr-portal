import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, User as UserIcon, ChevronLeft } from 'lucide-react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';
import { Button } from '@/components/ui/button';
import { index as indexRoute, edit as editRoute } from '@/routes/personnel';

interface Props {
    employee: any;
}

export default function Show({ employee }: Props) {
    const { auth } = usePage().props as any;
    const canEdit = auth.permissions?.includes('personnel.manage');

    return (
        <>
            <Head title={`${employee.first_name} ${employee.last_name} - Profile`} />
            
            <div className="space-y-6 p-4 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={indexRoute().url} className="mr-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="p-2 rounded-full bg-primary/10">
                            <UserIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Employee Profile</h1>
                    </div>
                    {canEdit && (
                        <Button asChild className="btn-ghost-specular gap-2 px-6 py-5 border-none">
                            <Link href={editRoute({ user: employee.id }).url}>
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Link>
                        </Button>
                    )}
                </div>

                <EmployeeCard employee={employee} />
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
