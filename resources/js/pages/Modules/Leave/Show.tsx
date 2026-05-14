import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

export default function LeaveShow({ leaveRequest }: any) {
    const formatDate = (dateString: string) => {
        if (!dateString) {
return '';
}

        return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    };

    const formatCurrency = (amount: number | string | null) => {
        if (!amount) {
return '';
}

        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount));
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
                                Leave Information (Section 6)
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1 col-span-2">
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
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pay Status</p>
                                    <div className="flex flex-col gap-1.5">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit",
                                            leaveRequest.pay_status === 'with_pay' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                                            leaveRequest.pay_status === 'partial' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                            'bg-red-500/10 text-red-600 border-red-500/20'
                                        )}>
                                            {leaveRequest.pay_status === 'with_pay' ? 'Full Pay' : 
                                             leaveRequest.pay_status === 'partial' ? 'Partial Pay' : 
                                             'Without Pay'}
                                        </span>
                                        {(parseFloat(leaveRequest.days_with_pay) > 0 || parseFloat(leaveRequest.days_without_pay) > 0) && (
                                            <div className="text-[10px] text-muted-foreground flex gap-2 font-medium">
                                                {parseFloat(leaveRequest.days_with_pay) > 0 && (
                                                    <span className="flex items-center text-green-600/80">
                                                        {leaveRequest.days_with_pay} days paid
                                                    </span>
                                                )}
                                                {parseFloat(leaveRequest.days_without_pay) > 0 && (
                                                    <span className="flex items-center text-red-600/80">
                                                        {leaveRequest.days_without_pay} days unpaid
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Properly Filed</p>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                        leaveRequest.is_filed ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    )}>
                                        {leaveRequest.is_filed ? 'Verified' : 'Pending Verification'}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Salary</p>
                                    <p className="font-medium">{formatCurrency(leaveRequest.salary)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date Filed</p>
                                    <p className="font-medium">{formatDate(leaveRequest.date_filed)}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details Type</p>
                                    <p className="font-medium">{leaveRequest.leave_detail_type || ''}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Commutation</p>
                                    <p className="font-medium">{leaveRequest.commutation_requested ? 'Requested' : 'Not Requested'}</p>
                                </div>

                                <div className="space-y-1 col-span-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Remarks / Specifics</p>
                                    <p className="p-3 bg-muted/30 rounded-xl text-sm italic">
                                        {leaveRequest.leave_detail_remarks || leaveRequest.leave_details || ''}
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
                                    <p className="text-2xl font-black text-foreground">
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
                                <div className="space-y-1 col-span-2 border-t pt-4 mt-2">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pay Status Breakdown</p>
                                    <div className="flex flex-wrap gap-6 mt-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-black text-green-600">{leaveRequest.days_with_pay}</span>
                                            <span className="text-muted-foreground font-medium">Days with pay</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-black text-amber-600">{leaveRequest.days_without_pay}</span>
                                            <span className="text-muted-foreground font-medium">Days without pay</span>
                                        </div>
                                        {leaveRequest.others_pay_remarks && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="font-medium text-muted-foreground">Others:</span>
                                                <span className="italic">{leaveRequest.others_pay_remarks}</span>
                                            </div>
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

                        {leaveRequest.maternity_allocation_details && (
                            <div className="matte-card elev-2 p-6 border-l-4 border-l-pink-500/50">
                                <h2 className="text-lg font-bold mb-2 flex items-center">
                                    <CheckCircle className="mr-2 h-5 w-5 text-pink-500" />
                                    Maternity Allocation (CS Form 6a)
                                </h2>
                                <p className="text-sm text-muted-foreground italic">
                                    {leaveRequest.maternity_allocation_details}
                                </p>
                            </div>
                        )}

                        <div className="matte-card elev-2 p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center">
                                <Clock className="mr-2 h-5 w-5 text-primary" />
                                Credit Balances at Filing
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Vacation Leave Balance</p>
                                    <p className="text-2xl font-black">{parseFloat(leaveRequest.vl_balance_at_filing || 0).toFixed(3)}</p>
                                </div>
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Sick Leave Balance</p>
                                    <p className="text-2xl font-black">{parseFloat(leaveRequest.sl_balance_at_filing || 0).toFixed(3)}</p>
                                </div>
                            </div>
                        </div>
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
                                    <p className="text-xs font-medium">{formatDate(leaveRequest.date_received) || ''}</p>
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
                                    <p className="text-xs font-medium">{leaveRequest.approved_by ? `${leaveRequest.approved_by.first_name} ${leaveRequest.approved_by.last_name}` : (leaveRequest.approved_by_official || 'Pending')}</p>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.attachment_urls && leaveRequest.attachment_urls.length > 0 && leaveRequest.attachment_urls.some((url: string) => !!url) && (
                            <div className="matte-card elev-2 p-6">
                                <h2 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest text-muted-foreground">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Attachment/s
                                </h2>
                                <div className="space-y-2">
                                    {leaveRequest.attachment_urls.map((url: string, i: number) => url && (
                                        <Button key={i} variant="secondary" className="w-full justify-start overflow-hidden text-ellipsis whitespace-nowrap" asChild title={url}>
                                            <a href={url} target="_blank" rel="noreferrer">
                                                <FileText className="mr-2 h-4 w-4 shrink-0" />
                                                <span className="truncate">View Link {leaveRequest.attachment_urls.length > 1 ? i + 1 : ''}</span>
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {leaveRequest.has_attachments && leaveRequest.supporting_documents?.length > 0 && (
                            <div className="matte-card elev-2 p-6">
                                <h2 className="text-sm font-bold mb-4 flex items-center uppercase tracking-widest text-muted-foreground">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Supporting Docs
                                </h2>
                                <ul className="space-y-2">
                                    {leaveRequest.supporting_documents.map((doc: string) => (
                                        <li key={doc} className="text-xs flex items-center">
                                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
