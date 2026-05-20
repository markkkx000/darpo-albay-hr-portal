import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
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
            <div className="container mx-auto py-6 max-w-4xl px-4 lg:px-0">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="t-display !text-4xl lg:!text-5xl">Leave Details</h1>
                        <p className="text-muted-foreground mt-1">Detailed view of the leave request.</p>
                    </div>
                    <Button variant="outline" asChild className="btn-ghost-specular border-none">
                        <Link href={LeaveRoutes.index().url}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </div>

                <LeaveNavigation />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="matte-card elev-3 p-6 sm:p-8">
                            <h2 className="t-headline mb-6 flex items-center">
                                <FileText className="mr-2.5 h-5 w-5 text-primary" />
                                Leave Information (Section 6)
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                                <div className="space-y-1.5 col-span-2">
                                    <p className="t-caption">Type of Leave</p>
                                    <div className="flex items-center space-x-2.5">
                                        <div 
                                            className="h-3.5 w-3.5 rounded-full shadow-[0_0_8px_currentColor]" 
                                            style={{ 
                                                backgroundColor: leaveRequest.leave_type?.color_code,
                                                color: leaveRequest.leave_type?.color_code 
                                            }}
                                        ></div>
                                        <p className="font-extrabold text-lg tracking-tight uppercase">{leaveRequest.leave_type?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="t-caption">Status</p>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        (() => {
                                            const status = (leaveRequest.leave_status?.name || '').toLowerCase();

                                            if (status.includes('approved')) {
                                                return 'status-badge-permanent';
                                            }

                                            if (status.includes('pending')) {
                                                return 'status-badge-warning';
                                            }

                                            if (status.includes('disapproved') || status.includes('cancelled')) {
                                                return 'status-badge-danger';
                                            }

                                            return 'status-badge-unknown';
                                        })()
                                    )}>
                                        {leaveRequest.leave_status?.name}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="t-caption">Pay Status</p>
                                    <div className="flex flex-col gap-1.5">
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                                            leaveRequest.pay_status === 'with_pay' ? 'status-badge-permanent' : 
                                            leaveRequest.pay_status === 'partial' ? 'status-badge-warning' :
                                            'status-badge-danger text-white'
                                        )}>
                                            {leaveRequest.pay_status === 'with_pay' ? 'Full Pay' : 
                                             leaveRequest.pay_status === 'partial' ? 'Partial Pay' : 
                                             'Without Pay'}
                                        </span>
                                        {(parseFloat(leaveRequest.days_with_pay) > 0 || parseFloat(leaveRequest.days_without_pay) > 0) && (
                                            <div className="text-[10px] text-muted-foreground flex gap-2 font-black uppercase tracking-tighter tabular-nums">
                                                {parseFloat(leaveRequest.days_with_pay) > 0 && (
                                                    <span className="flex items-center text-green-600/80">
                                                        {leaveRequest.days_with_pay}d pd
                                                    </span>
                                                )}
                                                {parseFloat(leaveRequest.days_without_pay) > 0 && (
                                                    <span className="flex items-center text-red-600/80">
                                                        {leaveRequest.days_without_pay}d upd
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="t-caption">Verification</p>
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm",
                                        leaveRequest.is_filed ? 'badge-hr-admin' : 'status-badge-warning'
                                    )}>
                                        {leaveRequest.is_filed ? 'Verified' : 'Pending'}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="t-caption">Salary</p>
                                    <p className="font-bold tabular-nums text-foreground/90">{formatCurrency(leaveRequest.salary)}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="t-caption">Date Filed</p>
                                    <p className="font-bold text-foreground/90 tabular-nums">{formatDate(leaveRequest.date_filed)}</p>
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <p className="t-caption">Specific Leave Category</p>
                                    <p className="font-bold text-foreground uppercase tracking-tight truncate">{leaveRequest.leave_detail_type || 'N/A'}</p>
                                </div>

                                <div className="space-y-1.5">
                                    <p className="t-caption">Commutation</p>
                                    <p className="font-bold text-foreground/90">{leaveRequest.commutation_requested ? 'Requested' : 'Not Requested'}</p>
                                </div>

                                <div className="space-y-2 col-span-full">
                                    <p className="t-caption">Remarks / Specifics</p>
                                    <div className="p-4 bg-muted/20 border border-border/5 rounded-2xl text-sm italic text-muted-foreground/90 leading-relaxed shadow-inner">
                                        {leaveRequest.leave_detail_remarks || leaveRequest.leave_details || 'No specific remarks provided.'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-3 p-6 sm:p-8">
                            <h2 className="t-headline mb-6 flex items-center">
                                <Calendar className="mr-2.5 h-5 w-5 text-primary" />
                                Schedule & Duration
                            </h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-1.5">
                                    <p className="t-caption">Duration</p>
                                    <p className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                        {leaveRequest.days_requested} 
                                        <span className="text-xl ml-1 font-bold text-muted-foreground uppercase">{leaveRequest.days_requested == 1 ? 'Day' : 'Days'}</span>
                                        {isHalfDay && <span className="text-sm font-medium text-amber-600 ml-2">(Half Day)</span>}
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="t-caption">Dates Requested</p>
                                    <div className="text-sm font-bold tabular-nums text-foreground/90">
                                        {leaveRequest.specific_dates && leaveRequest.specific_dates.length > 0 ? (
                                            <ul className="flex flex-wrap gap-2">
                                                {leaveRequest.specific_dates.map((d: string, i: number) => (
                                                    <li key={i} className="bg-muted/40 px-2 py-1 rounded-md border border-border/10">{formatDate(d)}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="bg-muted/40 px-2 py-1 rounded-md border border-border/10">{formatDate(leaveRequest.start_date)}</span>
                                                <span className="text-muted-foreground/50">&mdash;</span>
                                                <span className="bg-muted/40 px-2 py-1 rounded-md border border-border/10">{formatDate(leaveRequest.end_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4 col-span-full border-t border-border/20 pt-6 mt-2">
                                    <p className="t-caption">Pay Status Highlights</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/5">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Days with pay</span>
                                            <span className="text-2xl font-black text-green-600 tabular-nums">{leaveRequest.days_with_pay}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-border/5">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">Days without pay</span>
                                            <span className="text-2xl font-black text-amber-600 tabular-nums">{leaveRequest.days_without_pay}</span>
                                        </div>
                                        {leaveRequest.others_pay_remarks && (
                                            <div className="col-span-full p-4 bg-muted/10 rounded-2xl border border-border/5 flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase">Pay Remarks</span>
                                                <span className="text-sm italic text-foreground/80">{leaveRequest.others_pay_remarks}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.notes && (
                            <div className="matte-card elev-3 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40"></div>
                                <h2 className="t-headline mb-3 flex items-center">
                                    <FileText className="mr-2.5 h-5 w-5 text-primary" />
                                    Admin Notes
                                </h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {leaveRequest.notes}
                                </p>
                            </div>
                        )}

                        {leaveRequest.maternity_allocation_details && (
                            <div className="matte-card elev-3 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500/40"></div>
                                <h2 className="t-headline mb-3 flex items-center">
                                    <CheckCircle className="mr-2.5 h-5 w-5 text-pink-500" />
                                    Maternity Allocation (CS Form 6a)
                                </h2>
                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                    {leaveRequest.maternity_allocation_details}
                                </p>
                            </div>
                        )}

                        <div className="matte-card elev-3 p-6 sm:p-8">
                            <h2 className="t-headline mb-6 flex items-center">
                                <Clock className="mr-2.5 h-5 w-5 text-primary" />
                                Credential State at Filing
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="matte-card elev-1 p-5 rounded-2xl border border-primary/5 bg-gradient-to-br from-background to-primary/5">
                                    <p className="t-caption mb-3">Vacation Leave Balance</p>
                                    <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
                                        {parseFloat(leaveRequest.vl_balance_at_filing || 0).toFixed(3)}
                                    </p>
                                </div>
                                <div className="matte-card elev-1 p-5 rounded-2xl border border-primary/5 bg-gradient-to-br from-background to-primary/5">
                                    <p className="t-caption mb-3">Sick Leave Balance</p>
                                    <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
                                        {parseFloat(leaveRequest.sl_balance_at_filing || 0).toFixed(3)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="matte-card elev-3 p-6">
                            <h2 className="t-caption mb-6 block">Employee</h2>
                            <div className="flex items-center space-x-4">
                                <div className="sqicon sqicon-green h-12 w-12 !rounded-[14px]">
                                    {leaveRequest.user?.first_name[0]}{leaveRequest.user?.last_name[0]}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-extrabold text-foreground truncate">{leaveRequest.user?.first_name} {leaveRequest.user?.last_name}</p>
                                    <p className="text-[10px] font-mono font-bold text-muted-foreground tracking-tighter uppercase">{leaveRequest.user?.employee_number}</p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-3 p-6">
                            <h2 className="t-caption mb-6 block">Timeline</h2>
                            <div className="space-y-5">
                                <div className="space-y-1 relative pl-4 border-l border-border/40">
                                    <div className="absolute top-1 -left-[4.5px] h-2 w-2 rounded-full bg-border"></div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Filed On</p>
                                    <p className="text-xs font-bold tabular-nums">{formatDate(leaveRequest.created_at)}</p>
                                </div>
                                <div className="space-y-1 relative pl-4 border-l border-border/40">
                                    <div className="absolute top-1 -left-[4.5px] h-2 w-2 rounded-full bg-border"></div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Received On</p>
                                    <p className="text-xs font-bold tabular-nums">{formatDate(leaveRequest.date_received) || 'N/A'}</p>
                                </div>
                                <div className={cn(
                                    "space-y-1 relative pl-4 border-l border-border/40",
                                    leaveRequest.date_approved ? "" : "opacity-50"
                                )}>
                                    <div className={cn("absolute top-1 -left-[4.5px] h-2 w-2 rounded-full", leaveRequest.date_approved ? "bg-primary" : "bg-border")}></div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Approved On</p>
                                    <p className="text-xs font-bold tabular-nums">{formatDate(leaveRequest.date_approved) || 'Pending'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-3 p-6">
                            <h2 className="t-caption mb-6 block">Authorization</h2>
                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Encoded By</p>
                                    <p className="text-xs font-bold">{leaveRequest.created_by?.first_name} {leaveRequest.created_by?.last_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Approved By</p>
                                    <p className="text-xs font-bold truncate">
                                        {leaveRequest.approved_by 
                                            ? `${leaveRequest.approved_by.first_name} ${leaveRequest.approved_by.last_name}` 
                                            : (leaveRequest.approved_by_official || <span className="italic opacity-50">Pending</span>)
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.attachment_urls && leaveRequest.attachment_urls.length > 0 && leaveRequest.attachment_urls.some((url: string) => !!url) && (
                            <div className="matte-card elev-3 p-6">
                                <h2 className="t-caption mb-6 block">Attachments</h2>
                                <div className="space-y-3">
                                    {leaveRequest.attachment_urls.map((url: string, i: number) => url && (
                                        <Button 
                                            key={i} 
                                            variant="secondary" 
                                            className="btn-ghost-specular w-full justify-start overflow-hidden px-4 border-none" 
                                            asChild 
                                            title={url}
                                        >
                                            <a href={url} target="_blank" rel="noreferrer">
                                                <FileText className="mr-2.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-12" />
                                                <span className="truncate flex-1">View Attachment {leaveRequest.attachment_urls.length > 1 ? i + 1 : ''}</span>
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {leaveRequest.has_attachments && leaveRequest.supporting_documents?.length > 0 && (
                            <div className="matte-card elev-3 p-6">
                                <h2 className="t-caption mb-6 block">Supporting Docs</h2>
                                <ul className="space-y-3">
                                    {leaveRequest.supporting_documents.map((doc: string) => (
                                        <li key={doc} className="text-[11px] font-bold flex items-center text-foreground/80 uppercase tracking-tight">
                                            <CheckCircle className="h-3.5 w-3.5 mr-2.5 text-primary shrink-0" />
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
