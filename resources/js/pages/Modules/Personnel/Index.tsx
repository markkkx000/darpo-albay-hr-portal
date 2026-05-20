import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Search, Archive } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/page-header';
import { EmployeeTable } from '@/components/Personnel/EmployeeTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import PersonnelRoutes from '@/routes/personnel';

const createRoute = () => PersonnelRoutes.create();
const indexRoute = () => PersonnelRoutes.index();
const archivedRoute = () => PersonnelRoutes.archived();

interface Props {
    employees: any;
    filters: {
        search?: string;
        division_id?: string;
        appointment_status_id?: string;
    };
    divisions: any[];
    appointmentStatuses: any[];
}

export default function Index({ employees, filters, divisions = [], appointmentStatuses = [] }: Props) {
    const { auth } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(search, 500);
    const [divisionId, setDivisionId] = useState(filters?.division_id || 'all');
    const [statusId, setStatusId] = useState(filters?.appointment_status_id || 'all');

    const canCreate = auth?.permissions?.includes('personnel.manage');

    const handleFilter = useCallback((searchTerm: string) => {
        router.get(indexRoute().url, {
            search: searchTerm || undefined,
            division_id: divisionId === 'all' ? undefined : divisionId,
            appointment_status_id: statusId === 'all' ? undefined : statusId,
        }, {
            preserveState: true,
            replace: true,
        });
    }, [divisionId, statusId]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '')) {
            handleFilter(debouncedSearch);
        }
    }, [debouncedSearch, filters?.search, handleFilter]);

    const handleDivisionChange = (val: string) => {
        setDivisionId(val);
        router.get(indexRoute().url, {
            search: search || undefined,
            division_id: val === 'all' ? undefined : val,
            appointment_status_id: statusId === 'all' ? undefined : statusId
        }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (val: string) => {
        setStatusId(val);
        router.get(indexRoute().url, {
            search: search || undefined,
            division_id: divisionId === 'all' ? undefined : divisionId,
            appointment_status_id: val === 'all' ? undefined : val
        }, { preserveState: true, replace: true });
    };

    if (!employees) {
        return (
            <div className="p-4 w-full space-y-6">
                <div className="matte-card elev-2 p-6 rounded-2xl">
                    <Skeleton className="h-8 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="matte-card elev-2 p-4 rounded-2xl space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Personnel Directory" />

            <div className="p-4 w-full">
                <PageHeader
                    title="Personnel Directory"
                    description="Manage and view all employee records across the agency."
                    actions={
                        <>
                            <Button asChild variant="ghost" className="btn-ghost-specular gap-2 border-none">
                                <Link href={archivedRoute().url}>
                                    <Archive className="h-4 w-4" />
                                    View Archived
                                </Link>
                            </Button>
                            {canCreate && (
                                <>
                                    <Button asChild variant="ghost" className="btn-ghost-specular border-none">
                                        <Link href={PersonnelRoutes.organization.index().url}>
                                            Manage Organization
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" className="btn-ghost-specular px-6 border-none">
                                        <Link href={createRoute().url}>
                                            <Plus className="h-4 w-4" />
                                            Add Employee
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </>
                    }
                />

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 matte-card elev-2 px-4 py-4 rounded-2xl mb-6">
                    <div className="relative md:col-span-6">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by name or ID..."
                            className="input-etched !pl-11"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleFilter(search);
                                }
                            }}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Select value={divisionId} onValueChange={handleDivisionChange}>
                            <SelectTrigger className="input-etched w-full">
                                <div className="truncate text-left flex-1">
                                    <SelectValue placeholder="Division" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Divisions</SelectItem>
                                {Array.isArray(divisions) && divisions.map(d => (
                                    <SelectItem key={d.id} value={d.id?.toString() || ''}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3">
                        <Select value={statusId} onValueChange={handleStatusChange}>
                            <SelectTrigger className="input-etched w-full">
                                <div className="truncate text-left flex-1">
                                    <SelectValue placeholder="Employment Status" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Array.isArray(appointmentStatuses) && appointmentStatuses.map((s: any) => (
                                    <SelectItem key={s.id} value={s.id?.toString() || ''}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <EmployeeTable
                    employees={employees}
                    canEdit={auth?.permissions?.includes('personnel.manage')}
                    canDelete={auth?.permissions?.includes('personnel.manage')}
                    canResetPassword={auth?.roles?.includes('super_admin')}
                />
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Personnel Directory', href: indexRoute().url },
    ],
};
