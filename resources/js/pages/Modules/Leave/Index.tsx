import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, CalendarX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ViewActionButton, EditActionButton } from '@/components/ActionButtons';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import Heading from '@/components/heading';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
}

interface LeaveType {
    id: number;
    name: string;
    color_code?: string;
}

interface LeaveStatus {
    id: number;
    name: string;
}

interface LeaveRequest {
    id: number;
    user?: User;
    leave_type?: LeaveType;
    specific_dates?: string[];
    start_date?: string;
    end_date?: string;
    days_requested: string | number;
    leave_status?: LeaveStatus;
    date_approved?: string | null;
    approved_by?: User | null;
    created_by?: User;
}

interface PaginatedLeaves {
    data: LeaveRequest[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Filters {
    search?: string;
    view?: 'mine' | 'all';
    sort?: 'desc' | 'asc';
    leave_type_id?: string;
    status_id?: string;
    approved_by_id?: string;
}

interface Props {
    leaves: PaginatedLeaves;
    allEmployees: User[];
    leaveTypes: LeaveType[];
    leaveStatuses: LeaveStatus[];
    filters?: Filters;
}

export default function LeaveDashboard({
    leaves,
    allEmployees,
    leaveTypes,
    leaveStatuses,
    filters,
}: Props) {
    const { auth } = usePage<any>().props;
    const canEncode = auth.permissions.includes('leave.manage');

    const [search, setSearch] = useState(filters?.search || '');
    const [viewMode, setViewMode] = useState(filters?.view || 'mine');
    const [sort, setSort] = useState(filters?.sort || 'desc');
    const [leaveType, setLeaveType] = useState(filters?.leave_type_id || 'all');
    const [status, setStatus] = useState(filters?.status_id || 'all');
    const [approvedBy, setApprovedBy] = useState(filters?.approved_by_id || '');

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        // Prevent initial mount request if params match
        const params: any = {};

        if (debouncedSearch) {
            params.search = debouncedSearch;
        }

        if (viewMode !== 'mine') {
            params.view = viewMode;
        }

        if (sort !== 'desc') {
            params.sort = sort;
        }

        if (leaveType !== 'all') {
            params.leave_type_id = leaveType;
        }

        if (status !== 'all') {
            params.status_id = status;
        }

        if (approvedBy) {
            params.approved_by_id = approvedBy;
        }

        // Check if anything actually changed from current filters
        const hasChanged =
            params.search !== filters?.search ||
            (params.view || 'mine') !== (filters?.view || 'mine') ||
            (params.sort || 'desc') !== (filters?.sort || 'desc') ||
            (params.leave_type_id || 'all') !==
                (filters?.leave_type_id || 'all') ||
            (params.status_id || 'all') !== (filters?.status_id || 'all') ||
            params.approved_by_id !== filters?.approved_by_id;

        if (hasChanged) {
            router.get(LeaveRoutes.index().url, params, {
                preserveState: true,
                replace: true,
            });
        }
    }, [
        debouncedSearch,
        viewMode,
        sort,
        leaveType,
        status,
        approvedBy,
        filters,
    ]);

    const formatDate = (dateString: string) => {
        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);

        return date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    };

    return (
        <>
            <Head title="Leave Tracking Dashboard" />
            <div className="w-full p-4">
                <div className="matte-card elev-2 mb-6 flex flex-col justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <Heading
                            title="Leave Tracking"
                            description="Manage and track employee leave requests."
                            as="h1"
                            variant="small"
                        />
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                        {canEncode && (
                            <Button
                                asChild
                                className="btn-ghost-specular border-none px-6"
                            >
                                <Link href={LeaveRoutes.create().url}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Encode
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <LeaveNavigation />

                <div className="matte-card elev-2 mb-6">
                    <div className="border-b bg-muted/20 p-4">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            {/* View Toggle (Only for Encoders) */}
                            {canEncode ? (
                                <div className="flex items-center space-x-1 rounded-full border border-border-1 bg-surface-2 p-1">
                                    <button
                                        onClick={() => setViewMode('all')}
                                        className={cn(
                                            'rounded-full px-4 py-1.5 text-sm font-bold transition-all',
                                            viewMode === 'all'
                                                ? 'btn-specular'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        All Leaves
                                    </button>
                                    <button
                                        onClick={() => setViewMode('mine')}
                                        className={cn(
                                            'rounded-full px-4 py-1.5 text-sm font-bold transition-all',
                                            viewMode === 'mine'
                                                ? 'btn-specular'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        My Leave History
                                    </button>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold">
                                    My Leave History
                                </div>
                            )}

                            {/* Filters Container */}
                            <div className="flex w-full flex-1 flex-wrap items-center gap-2 md:justify-end">
                                {viewMode === 'all' && (
                                    <>
                                        <div className="w-full md:w-64">
                                            <EmployeeSearch
                                                users={allEmployees}
                                                selectedId={search}
                                                onSelect={(val) =>
                                                    setSearch(
                                                        val === 'all'
                                                            ? ''
                                                            : val,
                                                    )
                                                }
                                                placeholder="Search Employee..."
                                                returnValue="name"
                                                withAllEmployees
                                            />
                                        </div>

                                        <div className="w-full md:w-56">
                                            <EmployeeSearch
                                                users={allEmployees}
                                                selectedId={approvedBy}
                                                onSelect={(val) =>
                                                    setApprovedBy(
                                                        val === 'all'
                                                            ? ''
                                                            : val,
                                                    )
                                                }
                                                placeholder="Filter by Approver..."
                                                returnValue="id"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="w-[140px]">
                                    <Select
                                        value={leaveType}
                                        onValueChange={setLeaveType}
                                    >
                                        <SelectTrigger className="w-full">
                                            <div className="flex-1 truncate text-left">
                                                <SelectValue placeholder="Leave Type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            {leaveTypes?.map((t: any) => (
                                                <SelectItem
                                                    key={t.id}
                                                    value={t.id.toString()}
                                                >
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-[140px]">
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger className="w-full">
                                            <div className="flex-1 truncate text-left">
                                                <SelectValue placeholder="Status" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Statuses
                                            </SelectItem>
                                            {leaveStatuses?.map((s: any) => (
                                                <SelectItem
                                                    key={s.id}
                                                    value={s.id.toString()}
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="w-[140px]">
                                    <Select
                                        value={sort}
                                        onValueChange={(val) =>
                                            setSort(val as 'desc' | 'asc')
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <div className="flex-1 truncate text-left">
                                                <SelectValue placeholder="Sort" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">
                                                Most Recent
                                            </SelectItem>
                                            <SelectItem value="asc">
                                                Oldest
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-4 text-left">
                                            Employee
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Leave Type
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Dates (mm/dd/yyyy)
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Days
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Date Approved
                                        </th>
                                        <th className="px-4 py-4 text-left">
                                            Approver / Encoder
                                        </th>
                                        <th className="px-4 py-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {leaves.data.map((leave: any) => (
                                        <tr
                                            key={leave.id}
                                            className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {leave.user?.first_name}{' '}
                                                {leave.user?.last_name}
                                                <div className="text-xs text-muted-foreground">
                                                    {
                                                        leave.user
                                                            ?.employee_number
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                leave.leave_type
                                                                    ?.color_code,
                                                        }}
                                                    ></div>
                                                    <span>
                                                        {leave.leave_type?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {leave.specific_dates &&
                                                leave.specific_dates.length >
                                                    0 ? (
                                                    leave.specific_dates
                                                        .length === 1 ? (
                                                        <span>
                                                            {formatDate(
                                                                leave
                                                                    .specific_dates[0],
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <ul className="list-inside list-disc text-sm">
                                                            {leave.specific_dates.map(
                                                                (
                                                                    d: string,
                                                                    i: number,
                                                                ) => (
                                                                    <li key={i}>
                                                                        {formatDate(
                                                                            d,
                                                                        )}
                                                                    </li>
                                                                ),
                                                            )}
                                                        </ul>
                                                    )
                                                ) : (
                                                    <span>
                                                        {leave.start_date ===
                                                        leave.end_date
                                                            ? formatDate(
                                                                  leave.start_date,
                                                              )
                                                            : `${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {leave.days_requested}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase shadow-sm',
                                                        (() => {
                                                            const name = (
                                                                leave
                                                                    .leave_status
                                                                    ?.name || ''
                                                            ).toLowerCase();

                                                            if (
                                                                name.includes(
                                                                    'approv',
                                                                )
                                                            ) {
                                                                return 'status-badge-permanent';
                                                            }

                                                            if (
                                                                name.includes(
                                                                    'pend',
                                                                ) ||
                                                                name.includes(
                                                                    'review',
                                                                ) ||
                                                                name.includes(
                                                                    'process',
                                                                )
                                                            ) {
                                                                return 'status-badge-contractual';
                                                            }

                                                            if (
                                                                name.includes(
                                                                    'reject',
                                                                ) ||
                                                                name.includes(
                                                                    'disapprov',
                                                                ) ||
                                                                name.includes(
                                                                    'cancel',
                                                                ) ||
                                                                name.includes(
                                                                    'denied',
                                                                )
                                                            ) {
                                                                return 'bg-destructive text-destructive-foreground';
                                                            }

                                                            return 'badge-premium';
                                                        })(),
                                                    )}
                                                >
                                                    {leave.leave_status?.name}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-sm">
                                                {leave.date_approved ? (
                                                    formatDate(
                                                        leave.date_approved,
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground italic">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                <div>
                                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                                        App:
                                                    </span>{' '}
                                                    {leave.approved_by
                                                        ? `${leave.approved_by.first_name} ${leave.approved_by.last_name}`
                                                        : 'Pending'}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                                        Enc:
                                                    </span>{' '}
                                                    {
                                                        leave.created_by
                                                            ?.first_name
                                                    }{' '}
                                                    {
                                                        leave.created_by
                                                            ?.last_name
                                                    }
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 transition-all duration-300 group-hover:opacity-100 sm:opacity-60">
                                                    <ViewActionButton
                                                        href={
                                                            LeaveRoutes.show({
                                                                leaveRequest:
                                                                    leave.id,
                                                            }).url
                                                        }
                                                        title="View Details"
                                                    />
                                                    {canEncode && (
                                                        <EditActionButton
                                                            href={
                                                                LeaveRoutes.edit(
                                                                    {
                                                                        leaveRequest:
                                                                            leave.id,
                                                                    },
                                                                ).url
                                                            }
                                                            title="Edit Request"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={canEncode ? 8 : 7}
                                                className="p-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <CalendarX className="h-10 w-10 text-muted-foreground/30" />
                                                    <span className="font-medium text-muted-foreground">
                                                        No leave requests found.
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {leaves.data.length > 0 && (
                            <div className="border-t border-border/40 p-4">
                                <Pagination
                                    links={leaves.links}
                                    meta={leaves}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

LeaveDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Leave Tracking',
            href: LeaveRoutes.index().url,
        },
    ],
};
