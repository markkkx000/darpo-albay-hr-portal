import { Head, Link, usePage, router } from '@inertiajs/react';
import { Edit, User as UserIcon, ChevronLeft, ShieldOff } from 'lucide-react';
import { EmployeeCard } from '@/components/Personnel/EmployeeCard';
import type { Employee } from '@/components/Personnel/EmployeeCard';
import { PromotionHistorySection } from '@/components/Personnel/PromotionHistorySection';
import { Button } from '@/components/ui/button';
import { index as indexRoute, edit as editRoute } from '@/routes/personnel';
import type { PageProps } from '@/types';

interface Props {
    employee: Employee;
    positions: any[];
}

export default function Show({ employee, positions }: Props) {
    const { auth } = usePage<PageProps>().props;
    const canEdit = auth.permissions?.includes('personnel.manage');
    const isSuperAdmin = auth.roles?.includes('super_admin');

    const disableMfa = () => {
        if (
            confirm(
                'Are you sure you want to disable Two-Factor Authentication for this user?',
            )
        ) {
            router.post(
                `/personnel/${employee.id}/disable-mfa`,
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    return (
        <>
            <Head
                title={`${[employee.first_name, employee.middle_name, employee.last_name].filter(Boolean).join(' ')} - Profile`}
            />

            <div className="mx-auto max-w-5xl space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={indexRoute().url} className="mr-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl transition hover:item-hover-gradient"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="rounded-full bg-primary/10 p-2">
                            <UserIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Employee Profile
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        {isSuperAdmin && employee.mfa_enabled && (
                            <Button
                                onClick={disableMfa}
                                variant="outline"
                                className="gap-2 border-destructive px-6 py-5 text-destructive hover:bg-destructive/10"
                            >
                                <ShieldOff className="h-4 w-4" />
                                Disable MFA
                            </Button>
                        )}
                        {canEdit && (
                            <Button
                                asChild
                                variant="ghost"
                                className="btn-ghost-specular gap-2 border-none px-6 py-5"
                            >
                                <Link
                                    href={editRoute({ user: employee.id }).url}
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <EmployeeCard employee={employee} />
                <PromotionHistorySection
                    employee={employee}
                    positions={positions}
                />
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
        { title: 'Employee Profile', href: '#' },
    ],
};
