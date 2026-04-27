import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeaveNavigation from './Components/LeaveNavigation';
import { Pagination } from '@/components/Pagination';
import { EmployeeSearch } from '@/components/EmployeeSearch';


export default function LeaveDashboard({ leaves, allEmployees, filters }: { leaves: any, allEmployees: any[], filters: any }) {
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { timeZone: 'Asia/Manila' });
    };

    return (
        <>
            <Head title="Leave Tracking Dashboard" />
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Leave Tracking</h1>
                        <p className="text-muted-foreground">Manage and track employee leave requests.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <EmployeeSearch 
                            users={allEmployees} 
                            selectedId={filters?.search} 
                            route="/leave"
                        />
                        <Button asChild>
                            <Link href="/leave/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Encode
                            </Link>
                        </Button>
                    </div>
                </div>

                <LeaveNavigation />

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Employee</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Leave Type</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Dates</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Days</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Encoded By</th>
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
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {leave.leave_status?.name}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                                {leave.created_by?.first_name} {leave.created_by?.last_name}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/leave/${leave.id}/edit`}>Edit</Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                No leave requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {leaves.data.length > 0 && (
                            <div className="mt-4">
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
            href: '/leave',
        },
    ],
};
