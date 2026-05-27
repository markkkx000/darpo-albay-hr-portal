import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    User,
    FileText,
    CheckCircle,
    Clock,
} from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LeaveRoutes from '@/routes/leave';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    employee_number: string | null;
    avatar?: string | null;
    [key: string]: any;
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
    leave_status?: LeaveStatus;
    start_date: string;
    end_date: string;
    specific_dates?: string[];
    days_requested: number;
    pay_status?: string;
    days_with_pay: string;
    days_without_pay: string;
    others_pay_remarks: string | null;
    is_filed: boolean;
    salary: string | number | null;
    date_filed: string;
    date_received: string | null;
    date_approved: string | null;
    approved_by?: User | null;
    approved_by_official?: string | null;
    created_by?: User;
    created_at: string;
    updated_at?: string;
    leave_details?: string | null;
    leave_detail_type?: string | null;
    leave_detail_remarks?: string | null;
    commutation_requested: boolean;
    notes?: string | null;
    attachment_urls: string[];
    has_attachments: boolean;
    supporting_documents: string[];
    maternity_allocation_details?: string | null;

}

interface Props {
    leaveRequest: LeaveRequest;
}

export default function LeaveShow({ leaveRequest }: Props) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) {
            return '';
        }

        return new Date(dateString).toLocaleDateString('en-US', {
            timeZone: 'Asia/Manila',
        });
    };

    const formatCurrency = (amount: number | string | null) => {
        if (!amount) {
            return '';
        }

        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(Number(amount));
    };

    const isHalfDay =
        Number(leaveRequest.days_requested) < 1.0 &&
        leaveRequest.start_date === leaveRequest.end_date;

    return (
        <>
            <Head title={`Leave Details - ${leaveRequest.user?.last_name}`} />
            <div className="relative mx-auto w-full max-w-4xl p-4 md:p-8">
                {/* Visual Depth Component */}
                <div className="mesh-halo pointer-events-none" />

                <PageHeader
                    title="Leave Details"
                    description="Archival record of the employee's application, including leave credit certification and authorization timeline."
                    actions={
                        <Button variant="ghost" className="btn-ghost-specular" asChild>
                            <Link href={LeaveRoutes.index().url}>
                                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Back to Dashboard
                            </Link>
                        </Button>
                    }
                />

                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="matte-card elev-2 p-6 md:p-8">
                            <h2 className="t-headline mb-6 flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-primary" />
                                Leave Information (Section 6)
                            </h2>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                <div className="col-span-2 space-y-1">
                                    <p className="t-caption">
                                        Type of Leave
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    leaveRequest.leave_type
                                                        ?.color_code,
                                            }}
                                        ></div>
                                        <p className="font-bold text-foreground">
                                            {leaveRequest.leave_type?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Status
                                    </p>
                                    <div className="flex">
                                        <span
                                            className={cn(
                                                'status-badge-permanent inline-flex items-center rounded-full px-3 py-1 text-xs shadow-sm',
                                                leaveRequest.leave_status?.name
                                                    ?.toLowerCase()
                                                    .includes('approve')
                                                    ? 'status-badge-permanent'
                                                    : leaveRequest.leave_status?.name
                                                            ?.toLowerCase()
                                                            .includes('disapprove') ||
                                                      leaveRequest.leave_status?.name
                                                            ?.toLowerCase()
                                                            .includes('cancel')
                                                    ? 'status-badge-danger'
                                                    : 'status-badge-warning',
                                            )}
                                        >
                                            {leaveRequest.leave_status?.name}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Pay Status
                                    </p>
                                    <div className="flex flex-col gap-1.5">
                                         <span
                                            className={cn(
                                                'inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold tracking-tight shadow-sm',
                                                leaveRequest.pay_status === 'with_pay'
                                                    ? 'status-badge-permanent'
                                                    : leaveRequest.pay_status === 'partial'
                                                      ? 'status-badge-contractual'
                                                      : 'status-badge-danger',
                                            )}
                                        >
                                            {leaveRequest.pay_status === 'with_pay'
                                                ? 'Full Pay'
                                                : leaveRequest.pay_status === 'partial'
                                                  ? 'Partial Pay'
                                                  : 'Without Pay'}
                                        </span>
                                        {(parseFloat(
                                            leaveRequest.days_with_pay,
                                        ) > 0 ||
                                            parseFloat(
                                                leaveRequest.days_without_pay,
                                            ) > 0) && (
                                            <div className="flex gap-2 text-[10px] font-bold tabular-nums text-muted-foreground uppercase tracking-wider">
                                                {parseFloat(
                                                    leaveRequest.days_with_pay,
                                                ) > 0 && (
                                                    <span className="flex items-center text-green-600 dark:text-green-400">
                                                        {
                                                            leaveRequest.days_with_pay
                                                        }{' '}
                                                        days paid
                                                    </span>
                                                )}
                                                {parseFloat(
                                                    leaveRequest.days_without_pay,
                                                ) > 0 && (
                                                    <span className="flex items-center text-red-600 dark:text-red-400">
                                                        {
                                                            leaveRequest.days_without_pay
                                                        }{' '}
                                                        days unpaid
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Properly Filed
                                    </p>
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-3 py-1 text-xs shadow-sm',
                                            leaveRequest.is_filed
                                                ? 'status-badge-permanent'
                                                : 'status-badge-warning',
                                        )}
                                    >
                                        {leaveRequest.is_filed
                                            ? 'Verified'
                                            : 'Pending Verification'}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Salary
                                    </p>
                                    <p className="font-semibold tabular-nums text-foreground">
                                        {formatCurrency(leaveRequest.salary)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Date Filed
                                    </p>
                                    <p className="font-semibold tabular-nums text-foreground">
                                        {formatDate(leaveRequest.date_filed)}
                                    </p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="t-caption">
                                        Details Type
                                    </p>
                                    <p className="font-bold text-foreground">
                                        {leaveRequest.leave_detail_type || 'N/A'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Commutation
                                    </p>
                                    <p className="font-bold text-foreground">
                                        {leaveRequest.commutation_requested
                                            ? 'Requested'
                                            : 'Not Requested'}
                                    </p>
                                </div>

                                <div className="col-span-4 space-y-1">
                                    <p className="t-caption">
                                        Remarks / Specifics
                                    </p>
                                    <p className="rounded-xl bg-muted/30 p-4 text-sm italic leading-relaxed text-foreground/80">
                                        {leaveRequest.leave_detail_remarks ||
                                            leaveRequest.leave_details ||
                                            'No additional remarks provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6 md:p-8">
                            <h2 className="t-headline mb-6 flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-primary" />
                                Schedule & Duration
                            </h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Duration
                                    </p>
                                    <p className="t-title tabular-nums">
                                        {leaveRequest.days_requested}{' '}
                                        {Number(leaveRequest.days_requested) === 1
                                            ? 'Day'
                                            : 'Days'}
                                        {isHalfDay && (
                                            <span className="ml-2 t-headline font-normal text-muted-foreground">
                                                (Half Day)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Dates Requested
                                    </p>
                                    <div className="font-semibold text-foreground">
                                        {leaveRequest.specific_dates &&
                                        leaveRequest.specific_dates.length >
                                            0 ? (
                                            <ul className="list-inside list-disc tabular-nums">
                                                {leaveRequest.specific_dates.map(
                                                    (d: string, i: number) => (
                                                        <li key={i}>
                                                            {formatDate(d)}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        ) : (
                                            <p className="tabular-nums">
                                                {formatDate(
                                                    leaveRequest.start_date,
                                                )}{' '}
                                                <span className="mx-1 text-muted-foreground">to</span>{' '}
                                                {formatDate(
                                                    leaveRequest.end_date,
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 space-y-4 border-t pt-6 sm:col-span-2">
                                    <p className="t-caption">
                                        Pay Status Breakdown
                                    </p>
                                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                                                <CheckCircle className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="t-headline tabular-nums leading-none">
                                                    {leaveRequest.days_with_pay}
                                                </span>
                                                <span className="t-caption lowercase tracking-normal">
                                                    Days with pay
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="t-headline tabular-nums leading-none">
                                                    {leaveRequest.days_without_pay}
                                                </span>
                                                <span className="t-caption lowercase tracking-normal">
                                                    Days without pay
                                                </span>
                                            </div>
                                        </div>
                                        {leaveRequest.others_pay_remarks && (
                                            <div className="flex items-center gap-3 border-l pl-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        {leaveRequest.others_pay_remarks}
                                                    </span>
                                                    <span className="t-caption lowercase tracking-normal">
                                                        Other Remarks
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.notes && (
                            <div className="matte-card elev-2 border-l-4 border-l-green-500/50 p-6 md:p-8">
                                <h2 className="t-headline mb-4 flex items-center">
                                    <FileText className="mr-2 h-5 w-5 text-primary" />
                                    Admin Remarks
                                </h2>
                                <p className="text-sm leading-relaxed text-muted-foreground italic">
                                    "{leaveRequest.notes}"
                                </p>
                            </div>
                        )}

                        {leaveRequest.maternity_allocation_details && (
                            <div className="matte-card elev-2 border-l-4 border-l-pink-500/50 p-6 md:p-8">
                                <h2 className="t-headline mb-4 flex items-center">
                                    <CheckCircle className="mr-2 h-5 w-5 text-pink-500" />
                                    Maternity Allocation (CS Form 6a)
                                </h2>
                                <div className="rounded-xl bg-pink-500/5 p-4 italic text-sm leading-relaxed text-muted-foreground border border-pink-500/10">
                                    {leaveRequest.maternity_allocation_details}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="matte-card elev-2 p-0 overflow-hidden">
                            <div className="bg-primary/5 p-4 border-b border-primary/10">
                                <h2 className="t-caption flex items-center text-primary">
                                    <User className="mr-2 h-4 w-4" />
                                    Employee Profile
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-bold text-xl text-primary border-2 border-primary/20 shadow-inner">
                                        {leaveRequest.user?.first_name?.[0] || 'U'}
                                        {leaveRequest.user?.last_name?.[0] || ''}
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-lg font-bold text-foreground leading-tight">
                                            {leaveRequest.user?.first_name}{' '}
                                            {leaveRequest.user?.last_name}
                                        </p>
                                        <p className="t-caption lowercase tracking-normal text-muted-foreground mt-1">
                                            {leaveRequest.user?.employee_number}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <h2 className="t-caption mb-4 flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                Timeline
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Filed On
                                    </p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">
                                        {formatDate(leaveRequest.created_at)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Received On
                                    </p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">
                                        {formatDate(
                                            leaveRequest.date_received,
                                        ) || 'Not yet received'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Approved On
                                    </p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">
                                        {formatDate(
                                            leaveRequest.date_approved,
                                        ) || 'Pending approval'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <h2 className="t-caption mb-4 flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Authorization
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Encoded By
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {leaveRequest.created_by?.first_name}{' '}
                                        {leaveRequest.created_by?.last_name}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="t-caption">
                                        Approved By
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {leaveRequest.approved_by
                                            ? `${leaveRequest.approved_by.first_name} ${leaveRequest.approved_by.last_name}`
                                            : leaveRequest.approved_by_official ||
                                              'Pending'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {leaveRequest.attachment_urls &&
                            leaveRequest.attachment_urls.length > 0 &&
                            leaveRequest.attachment_urls.some(
                                (url: string) => !!url,
                            ) && (
                                    <div className="matte-card elev-2 p-0 overflow-hidden">
                                        <div className="bg-muted/30 p-4 border-b border-border/50">
                                            <h2 className="t-caption flex items-center">
                                                <FileText className="mr-2 h-4 w-4 text-primary" />
                                                Attachment/s
                                            </h2>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {leaveRequest.attachment_urls.map(
                                                (url: string, i: number) =>
                                                    url && (
                                                        <Button
                                                            key={i}
                                                            variant="secondary"
                                                            className="w-full justify-start overflow-hidden text-ellipsis whitespace-nowrap btn-ghost-specular rounded-xl h-11"
                                                            asChild
                                                            title={url}
                                                        >
                                                            <a
                                                                href={url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <FileText className="mr-2 h-4 w-4 shrink-0 text-primary" />
                                                                <span className="truncate font-semibold">
                                                                    View Document{' '}
                                                                    {leaveRequest
                                                                        .attachment_urls
                                                                        .length > 1
                                                                        ? i + 1
                                                                        : ''}
                                                                </span>
                                                            </a>
                                                        </Button>
                                                    ),
                                            )}
                                        </div>
                                    </div>
                            )}

                        {leaveRequest.has_attachments &&
                            leaveRequest.supporting_documents?.length > 0 && (
                                <div className="matte-card elev-2 p-6">
                                    <h2 className="t-caption mb-4 flex items-center border-b pb-3">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Supporting Docs
                                    </h2>
                                    <ul className="space-y-3 mt-4">
                                        {leaveRequest.supporting_documents.map(
                                            (doc: string) => (
                                                <li
                                                    key={doc}
                                                    className="flex items-center text-sm font-medium text-foreground"
                                                >
                                                    <div className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                                                        <CheckCircle className="h-3 w-3" />
                                                    </div>
                                                    {doc}
                                                </li>
                                            ),
                                        )}
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
