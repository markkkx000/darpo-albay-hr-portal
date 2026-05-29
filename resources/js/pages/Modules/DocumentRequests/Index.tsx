import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    Plus,
    Files,
    CheckCircle,
    XCircle,
    Clock,
    Box,
    Send,
    FileText,
    ArrowDown,
    ArrowUp,
    Eye,
} from 'lucide-react';
import { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import DocumentRequestsRoutes from '@/routes/documentrequests';
import { ReleaseModal } from './Components/ReleaseModal';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
}

interface DocumentRequest {
    id: number;
    requests: string[];
    purpose: string;
    status: string;
    created_at: string;
    user?: User;
    requester?: User;
    receiver?: User;
    is_electronic: boolean;
    released_to?: string;
}

interface Props {
    documentRequests: {
        data: DocumentRequest[];
        links: any[];
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
        last_page: number;
    };
    isHr: boolean;
    users?: User[];
    filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        document?: string;
        sort_date?: 'desc' | 'asc';
    };
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'Pending':
            return <Clock className="mr-1 h-3 w-3" />;
        case 'Received':
            return <FileText className="mr-1 h-3 w-3" />;
        case 'Ready for Pickup':
            return <Box className="mr-1 h-3 w-3" />;
        case 'Released/Sent':
            return <Send className="mr-1 h-3 w-3" />;
        case 'Completed':
            return <CheckCircle className="mr-1 h-3 w-3" />;
        case 'Rejected':
        case 'Cancelled':
            return <XCircle className="mr-1 h-3 w-3" />;
        default:
            return null;
    }
}

function getStatusClass(status: string) {
    switch (status) {
        case 'Pending':
            return 'status-badge-contractual';
        case 'Received':
            return 'status-badge-permanent';
        case 'Ready for Pickup':
            return 'badge-premium text-orange-700 bg-orange-100 border-orange-200';
        case 'Released/Sent':
            return 'badge-premium text-indigo-700 bg-indigo-100 border-indigo-200';
        case 'Completed':
            return 'badge-premium text-emerald-700 bg-emerald-100 border-emerald-200';
        case 'Rejected':
        case 'Cancelled':
            return 'bg-destructive text-destructive-foreground';
        default:
            return 'badge-premium';
    }
}

export default function DocumentRequestsIndex({
    documentRequests,
    isHr,
    users,
    filters = {},
}: Props) {
    // Automatically refresh the list every 15 seconds to prevent stale data
    usePoll(15000, { only: ['documentRequests'] });

    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
    const [pickupName, setPickupName] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectAction, setRejectAction] = useState<'Reject' | 'Cancel'>('Reject');
    const [requestToConfirm, setRequestToConfirm] = useState<number | null>(null);
    const [statusReason, setStatusReason] = useState('');

    const openRejectConfirm = (id: number, action: 'Reject' | 'Cancel') => {
        setRequestToConfirm(id);
        setRejectAction(action);
        setIsRejectModalOpen(true);
    };

    const handleConfirmReject = (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestToConfirm) {
            return;
        }
        
        router.post(
            DocumentRequestsRoutes.status({ documentRequest: requestToConfirm }).url,
            { 
                status: rejectAction === 'Reject' ? 'Rejected' : 'Cancelled',
                status_reason: statusReason
            },
            { 
                preserveScroll: true,
                onSuccess: () => {
                    setIsRejectModalOpen(false);
                    setStatusReason('');
                }
            }
        );
    };

    const handleLogPickup = (e: React.FormEvent) => {
        e.preventDefault();

        if (pickupName && selectedRequestId) {
            router.post(
                DocumentRequestsRoutes.pickedUp({ documentRequest: selectedRequestId }).url,
                { released_to: pickupName },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsPickupModalOpen(false);
                        setPickupName('');
                        setSelectedRequestId(null);
                    }
                }
            );
        }
    };

    const [filterState, setFilterState] = useState({
        status: filters.status || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        document: filters.document || 'all',
        sort_date: filters.sort_date || 'desc',
    });

    const toggleSort = () => {
        const newSort = filterState.sort_date === 'desc' ? 'asc' : 'desc';
        setFilterState(prev => ({ ...prev, sort_date: newSort }));
        router.get(
            DocumentRequestsRoutes.index().url,
            { ...filterState, sort_date: newSort } as any,
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const updateFilter = (key: keyof typeof filterState, value: any) => {
        const newState = { ...filterState, [key]: value };
        setFilterState(newState);
        router.get(
            DocumentRequestsRoutes.index().url,
            newState as any,
            { preserveState: true, replace: true }
        );
    };

    const clearFilters = () => {
        setFilterState({ status: 'all', date_from: '', date_to: '', document: 'all', sort_date: 'desc' });
        router.get(DocumentRequestsRoutes.index().url);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
    };

    return (
        <>
            <Head title="Document Requests" />
            <div className="w-full p-4">
                <PageHeader
                    title="Document Requests"
                    description={
                        isHr
                            ? 'Manage and process employee document requests.'
                            : 'Request HR documents such as Service Records and Certificates.'
                    }
                    actions={
                        <Button
                            asChild
                            variant="ghost"
                            className="btn-ghost-specular border-none"
                        >
                            <Link href={DocumentRequestsRoutes.create().url}>
                                <Plus className="h-4 w-4" />
                                New Request
                            </Link>
                        </Button>
                    }
                />

                <div className="matte-card elev-2 mb-6">
                    <div className="border-b bg-muted/20 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold">
                                {isHr ? 'Request Queue' : 'My Requests'}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end xl:w-[85%]">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <Select
                                    value={filterState.status}
                                    onValueChange={(val) => updateFilter('status', val)}
                                >
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Received">Received</SelectItem>
                                        <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                                        <SelectItem value="Released/Sent">Released/Sent</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Document Type</Label>
                                <Select
                                    value={filterState.document}
                                    onValueChange={(val) => updateFilter('document', val)}
                                >
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="All Documents" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Documents</SelectItem>
                                        <SelectItem value="Service Record">Service Record</SelectItem>
                                        <SelectItem value="Certificate of Employment (CE)">CE</SelectItem>
                                        <SelectItem value="Certificate of Employment with Compensation (CEC)">CEC</SelectItem>
                                        <SelectItem value="Pay Slip">Pay Slip</SelectItem>
                                        <SelectItem value="Certificate of Remittance">Remittance</SelectItem>
                                        <SelectItem value="Certified True Copy of Documents">CTC</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">From</Label>
                                <DatePicker
                                    className="w-full"
                                    value={filterState.date_from}
                                    onChange={(date) => updateFilter('date_from', date || '')}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">To</Label>
                                <DatePicker
                                    className="w-full"
                                    value={filterState.date_to}
                                    onChange={(date) => updateFilter('date_to', date || '')}
                                />
                            </div>
                            <div className="flex items-center gap-2 pb-0.5">
                                {(filterState.status !== 'all' || filterState.document !== 'all' || filterState.date_from || filterState.date_to) && (
                                    <Button onClick={clearFilters} variant="ghost" size="sm" className="h-9 text-xs px-3 text-muted-foreground flex-1 md:flex-none">Clear Filters</Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    <tr>
                                        {isHr && (
                                            <th
                                                scope="col"
                                                className="px-4 py-4 text-left"
                                            >
                                                Employee
                                            </th>
                                        )}
                                        <th
                                            scope="col"
                                            className="px-4 py-4 text-left"
                                        >
                                            Documents Requested
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-4 text-left cursor-pointer hover:bg-muted/60 transition-colors group"
                                            onClick={toggleSort}
                                        >
                                            <div className="flex items-center gap-1 select-none">
                                                Date Requested
                                                <span className="text-muted-foreground/50 group-hover:text-foreground transition-colors">
                                                    {filterState.sort_date === 'desc' ? (
                                                        <ArrowDown className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowUp className="h-3.5 w-3.5" />
                                                    )}
                                                </span>
                                            </div>
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-4 text-left"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-4 text-right"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {documentRequests.data.map((req) => (
                                        <tr
                                            key={req.id}
                                            className="group border-b transition-colors hover:bg-muted/50"
                                        >
                                            {isHr && (
                                                <td className="p-4 align-middle">
                                                    <div className="font-medium">
                                                        {req.user?.first_name} {req.user?.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                                        {req.user?.employee_number || 'N/A'}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-4 align-middle">
                                                <ul className="list-inside list-disc">
                                                    {req.requests.map(
                                                        (doc, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="text-sm"
                                                            >
                                                                {doc}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {formatDate(req.created_at)}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase shadow-sm',
                                                        getStatusClass(
                                                            req.status,
                                                        ),
                                                    )}
                                                >
                                                    {getStatusIcon(req.status)}
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="flex justify-end gap-2 p-4 text-right align-middle">
                                                {/* Main Action Buttons */}
                                                {isHr && req.status === 'Pending' && (
                                                    <Button
                                                        variant="outline"
                                                        className="shadow-sm"
                                                        onClick={() =>
                                                            router.post(DocumentRequestsRoutes.receive({ documentRequest: req.id }).url)
                                                        }
                                                    >
                                                        <Clock className="h-4 w-4" />
                                                        Mark Received
                                                    </Button>
                                                )}
                                                {isHr && req.status === 'Received' && (
                                                    <Button
                                                        variant="default"
                                                        className="btn-premium shadow-sm"
                                                        onClick={() => {
                                                            setSelectedRequestId(req.id);
                                                            setIsReleaseModalOpen(true);
                                                        }}
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        Release
                                                    </Button>
                                                )}
                                                {isHr && req.status === 'Ready for Pickup' && (
                                                    <Button
                                                        variant="outline"
                                                        className="shadow-sm"
                                                        onClick={() => {
                                                            setSelectedRequestId(req.id);
                                                            setIsPickupModalOpen(true);
                                                        }}
                                                    >
                                                        <Box className="h-4 w-4" />
                                                        Log Pickup
                                                    </Button>
                                                )}

                                                {/* View Details Button (Eye icon only) */}
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="shadow-sm"
                                                    asChild
                                                    title="View Details"
                                                >
                                                    <Link href={DocumentRequestsRoutes.show({ documentRequest: req.id }).url}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {/* Reject/Cancel Button (X icon only) */}
                                                {isHr && (req.status === 'Pending' || req.status === 'Received') && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent"
                                                        onClick={() => openRejectConfirm(req.id, 'Reject')}
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {!isHr && req.status === 'Pending' && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent"
                                                        onClick={() => openRejectConfirm(req.id, 'Cancel')}
                                                        title="Cancel"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {documentRequests.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={isHr ? 5 : 4}
                                                className="p-24 text-center"
                                            >
                                                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                                                        <Files className="h-10 w-10 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="mt-4 text-lg font-semibold">
                                                        No requests found
                                                    </h3>
                                                    <p className="mt-2 mb-4 text-sm text-muted-foreground">
                                                        There are currently no
                                                        document requests in the
                                                        queue.
                                                    </p>
                                                    {!isHr && (
                                                        <Button
                                                            asChild
                                                            className="btn-premium"
                                                        >
                                                            <Link
                                                                href={
                                                                    DocumentRequestsRoutes.create()
                                                                        .url
                                                                }
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" />
                                                                Create Request
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {documentRequests.data.length > 0 && (
                            <div className="border-t border-border/40 p-4">
                                <Pagination
                                    links={documentRequests.links}
                                    meta={documentRequests as any}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReleaseModal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
                documentRequestId={selectedRequestId}
            />

            <Dialog open={isPickupModalOpen} onOpenChange={setIsPickupModalOpen}>
                <DialogContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;

                        if (
                            target.closest('[data-headlessui-portal]') ||
                            target.closest('ul[role="listbox"]') ||
                            target.closest('[role="option"]')
                        ) {
                            e.preventDefault();
                        }
                    }}
                >
                    <form onSubmit={handleLogPickup}>
                        <DialogHeader>
                            <DialogTitle>Log Document Pickup</DialogTitle>
                            <DialogDescription>
                                Enter the name of the person picking up the documents.
                                <br /><br />
                                <strong className="text-primary font-semibold">Note:</strong> Please remind the receiver to log into their portal and click "Acknowledge Receipt" as soon as possible to complete the two-way verification process.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pickupName">Picked Up By</Label>
                                <EmployeeSearch
                                    users={users || []}
                                    selectedId={pickupName}
                                    onSelect={(val) => setPickupName(val === 'all' ? '' : val)}
                                    returnValue="name"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPickupModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="btn-premium">Confirm Pickup</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom Confirm Reject/Cancel Dialog */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <form onSubmit={handleConfirmReject}>
                        <DialogHeader>
                            <DialogTitle>Confirm {rejectAction}</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {rejectAction.toLowerCase()} this document request? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="indexReason">Reason (Optional)</Label>
                                <Textarea
                                    id="indexReason"
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="Enter the reason here..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setIsRejectModalOpen(false);
                                setStatusReason('');
                            }}>
                                Keep Request
                            </Button>
                            <Button type="submit" variant="destructive">
                                Yes, {rejectAction}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DocumentRequestsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Document Requests',
            href: DocumentRequestsRoutes.index().url,
        },
    ],
};
