import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

export default function LeaveShow({ leaveRequest }: any) {
    const formatDate = (dateString: string) => {
        if (!dateString) {
return 'N/A';
}

        const date = new Date(dateString);

        return date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    };

    const isHalfDay = leaveRequest.days_requested < 1.0 && leaveRequest.start_date === leaveRequest.end_date;

    return (
        <>
            <Head title={`Leave Details - ${leaveRequest.user?.last_name}`} />
            <div className="container mx-auto py-6 max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="t-title">Leave Details</h1>
                        <p className="text-muted-foreground">Detailed view of the leave request.</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={LeaveRoutes.index().url}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <LeaveNavigation />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-primary" />
                                Leave Information
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type of Leave</p>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: leaveRequest.leave_type?.color_code }}></div>
                                        <p className="font-semibold">{leaveRequest.leave_type?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                                        {leaveRequest.leave_status?.name}
                                    </span>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details / Remarks</p>
                                    <p className="p-3 bg-muted/30 rounded-xl text-sm italic">
                                        {leaveRequest.leave_details || 'No specific details provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-primary" />
                                Schedule & Duration
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</p>
                                    <p className="text-2xl font-black text-primary">
                                        {leaveRequest.days_requested} {leaveRequest.days_requested == 1 ? 'Day' : 'Days'}
                                        {isHalfDay && <span className="text-sm font-normal text-muted-foreground ml-2">(Half Day)</span>}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dates Requested</p>
                                    <div className="text-sm font-medium">
                                        {leaveRequest.specific_dates && leaveRequest.specific_dates.length > 0 ? (
                                            <ul className="list-disc list-inside">
                                                {leaveRequest.specific_dates.map((d: string, i: number) => (
                                                    <li key={i}>{formatDate(d)}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{formatDate(leaveRequest.start_date)} to {formatDate(leaveRequest.end_date)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.notes && (
                            <div className="matte-card elev-2 p-6 border-l-4 border-l-primary/50">
                                <h2 className="text-lg font-bold mb-2 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-primary" />
                                    Admin Notes
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {leaveRequest.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                Employee
                            </h2>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {leaveRequest.user?.first_name[0]}{leaveRequest.user?.last_name[0]}
                                </div>
                                <div>
                                    <p className="font-bold">{leaveRequest.user?.first_name} {leaveRequest.user?.last_name}</p>
                                    <p className="text-xs text-muted-foreground">{leaveRequest.user?.employee_number}</p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                Timeline
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Filed On</p>
                                    <p className="text-xs font-medium">{formatDate(leaveRequest.created_at)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Received On</p>
                                    <p className="text-xs font-medium">{formatDate(leaveRequest.date_received) || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Approved On</p>
                                    <p className="text-xs font-medium">{formatDate(leaveRequest.date_approved) || 'Pending'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest text-muted-foreground">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Authorization
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Encoded By</p>
                                    <p className="text-xs font-medium">{leaveRequest.created_by?.first_name} {leaveRequest.created_by?.last_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Approved By</p>
                                    <p className="text-xs font-medium">{leaveRequest.approved_by ? `${leaveRequest.approved_by.first_name} ${leaveRequest.approved_by.last_name}` : 'Pending'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

LeaveShow.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: LeaveRoutes.index().url },
        { title: 'View Details', href: '#' },
    ],
};
