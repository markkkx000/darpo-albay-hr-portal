import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Search, Archive } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { EmployeeTable } from '@/components/Personnel/EmployeeTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import * as PersonnelRoutes from '@/routes/personnel';

const createRoute = () => PersonnelRoutes.create();
const indexRoute = () => PersonnelRoutes.index();
const archivedRoute = () => PersonnelRoutes.archived();

interface Props {
    employees: any;
    filters: {
        search?: string;
        department_id?: string;
        employment_status_id?: string;
    };
    departments: any[];
    employmentStatuses: any[];
}

export default function Index({ employees, filters, departments = [], employmentStatuses = [] }: Props) {
    const { auth } = usePage().props as any;

    const [search, setSearch] = useState(filters?.search || '');
    const [deptId, setDeptId] = useState(filters?.department_id || 'all');
    const [statusId, setStatusId] = useState(filters?.employment_status_id || 'all');

    const canCreate = auth?.permissions?.includes('personnel.create');

    const handleFilter = useCallback(() => {
        router.get(indexRoute().url, {
            search,
            department_id: deptId === 'all' ? undefined : deptId,
            employment_status_id: statusId === 'all' ? undefined : statusId,
        }, {
            preserveState: true,
            replace: true,
        });
    }, [search, deptId, statusId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                handleFilter();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters?.search, handleFilter]);

    const handleDeptChange = (val: string) => {
        setDeptId(val);
        router.get(indexRoute().url, {
            search,
            department_id: val === 'all' ? undefined : val,
            employment_status_id: statusId === 'all' ? undefined : statusId
        }, { preserveState: true, replace: true });
    };

    const handleStatusChange = (val: string) => {
        setStatusId(val);
        router.get(indexRoute().url, {
            search,
            department_id: deptId === 'all' ? undefined : deptId,
            employment_status_id: val === 'all' ? undefined : val
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
                <div className="matte-card elev-2 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Personnel Directory</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Manage and view all employee records across the agency.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild className="btn-ghost-specular gap-2 border-none">
                            <Link href={archivedRoute().url}>
                                <Archive className="h-4 w-4" />
                                View Archived
                            </Link>
                        </Button>
                        {canCreate && (
                            <Button asChild className="btn-ghost-specular px-6 border-none">
                                <Link href={createRoute().url}>
                                    <Plus className="h-4 w-4" />
                                    Add Employee
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

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
                                    handleFilter();
                                }
                            }}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Select value={deptId} onValueChange={handleDeptChange}>
                            <SelectTrigger className="input-etched w-full">
                                <div className="truncate text-left flex-1">
                                    <SelectValue placeholder="Department" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {Array.isArray(departments) && departments.map(d => (
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
                                {Array.isArray(employmentStatuses) && employmentStatuses.map(s => (
                                    <SelectItem key={s.id} value={s.id?.toString() || ''}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <EmployeeTable
                    employees={employees}
                    canEdit={auth?.permissions?.includes('personnel.update')}
                    canDelete={auth?.permissions?.includes('personnel.delete')}
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
