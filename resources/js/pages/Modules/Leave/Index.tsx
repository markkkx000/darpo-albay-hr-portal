import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ViewActionButton, EditActionButton } from '@/components/ActionButtons';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

export default function LeaveDashboard({ leaves, allEmployees, leaveTypes, leaveStatuses, filters }: any) {
    const { auth } = usePage<any>().props;
    const canEncode = auth.permissions.includes('leave.encode');

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
            (params.leave_type_id || 'all') !== (filters?.leave_type_id || 'all') ||
            (params.status_id || 'all') !== (filters?.status_id || 'all') ||
            params.approved_by_id !== filters?.approved_by_id;

        if (hasChanged) {
            router.get(LeaveRoutes.index().url, params, { preserveState: true, replace: true });
        }
    }, [debouncedSearch, viewMode, sort, leaveType, status, approvedBy, filters]);

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
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="t-title">Leave Tracking</h1>
                        <p className="text-muted-foreground">Manage and track employee leave requests.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {canEncode && (
                            <Button asChild>
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
                    <div className="p-4 border-b bg-muted/20">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            
                            {/* View Toggle (Only for Encoders) */}
                            {canEncode ? (
                                <div className="flex items-center space-x-1 rounded-full border border-border-1 bg-surface-2 p-1">
                                    <button
                                        onClick={() => setViewMode('all')}
                                        className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${viewMode === 'all' ? 'btn-specular' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        All Leaves
                                    </button>
                                    <button
                                        onClick={() => setViewMode('mine')}
                                        className={`px-4 py-1.5 text-sm font-bold rounded-full transition-all ${viewMode === 'mine' ? 'btn-specular' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        My Leave History
                                    </button>
                                </div>
                            ) : (
                                <div className="text-lg font-semibold">My Leave History</div>
                            )}

                            {/* Filters Container */}
                            <div className="flex flex-wrap items-center gap-2 flex-1 md:justify-end w-full">
                                
                                {viewMode === 'all' && (
                                    <>
                                        <div className="w-full md:w-64">
                                            <EmployeeSearch 
                                                users={allEmployees} 
                                                selectedId={search} 
                                                onSelect={(val) => setSearch(val === 'all' ? '' : val)}
                                                placeholder="Search Employee..."
                                                returnValue="name"
                                                withAllEmployees
                                            />
                                        </div>

                                        <div className="w-full md:w-56">
                                            <EmployeeSearch 
                                                users={allEmployees} 
                                                selectedId={approvedBy} 
                                                onSelect={(val) => setApprovedBy(val === 'all' ? '' : val)}
                                                placeholder="Filter by Approver..."
                                                returnValue="id"
                                            />
                                        </div>
                                    </>
                                )}

                                <Select value={leaveType} onValueChange={setLeaveType}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Leave Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {leaveTypes?.map((t: any) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {leaveStatuses?.map((s: any) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={sort} onValueChange={setSort}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Most Recent</SelectItem>
                                        <SelectItem value="asc">Oldest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>
                    <div className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Leave Type</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates (mm/dd/yyyy)</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Days</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Approved</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Approver / Encoder</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {leaves.data.map((leave: any) => (
                                        <tr key={leave.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">
                                                {leave.user?.first_name} {leave.user?.last_name}
                                                <div className="text-xs text-muted-foreground">{leave.user?.employee_number}</div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center space-x-2">
                                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leave.leave_type?.color_code }}></div>
                                                    <span>{leave.leave_type?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {leave.specific_dates && leave.specific_dates.length > 0 ? (
                                                    leave.specific_dates.length === 1 ? (
                                                        <span>{formatDate(leave.specific_dates[0])}</span>
                                                    ) : (
                                                        <ul className="list-disc list-inside text-sm">
                                                            {leave.specific_dates.map((d: string, i: number) => (
                                                                <li key={i}>{formatDate(d)}</li>
                                                            ))}
                                                        </ul>
                                                    )
                                                ) : (
                                                    <span>
                                                        {leave.start_date === leave.end_date 
                                                            ? formatDate(leave.start_date) 
                                                            : `${formatDate(leave.start_date)} to ${formatDate(leave.end_date)}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">{leave.days_requested}</td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {leave.leave_status?.name}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-sm">
                                                {leave.date_approved ? formatDate(leave.date_approved) : <span className="text-muted-foreground italic">Pending</span>}
                                            </td>
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                <div>
                                                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">App:</span> {leave.approved_by ? `${leave.approved_by.first_name} ${leave.approved_by.last_name}` : 'Pending'}
                                                </div>
                                                <div className="mt-1">
                                                    <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/70">Enc:</span> {leave.created_by?.first_name} {leave.created_by?.last_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 sm:opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                    <ViewActionButton 
                                                        href={LeaveRoutes.show({ leaveRequest: leave.id }).url} 
                                                        title="View Details" 
                                                    />
                                                    {canEncode && (
                                                        <EditActionButton 
                                                            href={LeaveRoutes.edit({ leaveRequest: leave.id }).url} 
                                                            title="Edit Request" 
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="p-4 text-center text-muted-foreground">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {leaves.data.length > 0 && (
                            <div className="p-4 border-t">
                                <Pagination links={leaves.links} meta={leaves} />
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
