import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, CalendarX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { cn } from '@/lib/utils';
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

        return date.toLocaleDateString('en-GB', { timeZone: 'Asia/Manila' });
    };

    return (
        <>
            <Head title="Leave Tracking Dashboard" />
            <div className="p-4 w-full">
                <div className="matte-card elev-2 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Heading title="Leave Tracking" description="Manage and track employee leave requests." as="h1" variant="small" />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {canEncode && (
                            <Button asChild className="btn-ghost-specular border-none px-6">
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
                                        className={cn(
                                            "px-4 py-1.5 text-sm font-bold rounded-full transition-all",
                                            viewMode === 'all' ? 'btn-specular' : 'text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        All Leaves
                                    </button>
                                    <button
                                        onClick={() => setViewMode('mine')}
                                        className={cn(
                                            "px-4 py-1.5 text-sm font-bold rounded-full transition-all",
                                            viewMode === 'mine' ? 'btn-specular' : 'text-muted-foreground hover:text-foreground'
                                        )}
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
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Days</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date Approved</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Approver / Encoder</th>
                                        {canEncode && <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>}
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
                                                    <ul className="list-disc list-inside text-sm">
                                                        {leave.specific_dates.map((d: string, i: number) => (
                                                            <li key={i}>{formatDate(d)}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span>{formatDate(leave.start_date)} to {formatDate(leave.end_date)}</span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle">{leave.days_requested}</td>
                                            <td className="p-4 align-middle">
                                                <Badge variant="secondary">
                                                    {leave.leave_status?.name}
                                                </Badge>
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
                                            {canEncode && (
                                                <td className="p-4 align-middle text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={LeaveRoutes.edit({ leaveRequest: leave.id }).url}>Edit</Link>
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td colSpan={canEncode ? 8 : 7} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <CalendarX className="h-10 w-10 text-muted-foreground/30" />
                                                    <span className="text-muted-foreground font-medium">No leave requests found.</span>
                                                </div>
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
