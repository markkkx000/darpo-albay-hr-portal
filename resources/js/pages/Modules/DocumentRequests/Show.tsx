import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, FileText } from 'lucide-react';
import { Clock, Send, Box, XCircle } from 'lucide-react';
import { useState } from 'react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import DocumentRequestsRoutes from '@/routes/documentrequests';
import { ReleaseModal } from './Components/ReleaseModal';

// We import formatting utilities if any.
function formatDate(dateStr: string | null) {
    if (!dateStr) {
        return 'N/A';
    }

    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

function getStatusClass(status: string) {
    switch (status) {
        case 'Pending':
            return 'status-badge-contractual';
        case 'Received':
            return 'status-badge-permanent';
        case 'Ready for Pickup':
            return 'badge-premium text-orange-700 bg-orange-100 border-orange-200';
        case 'Released':
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

export default function DocumentRequestsShow({
    documentRequest,
    isHr,
    users,
}: {
    documentRequest: any;
    isHr: boolean;
    users?: any[];
}) {
    const { auth } = usePage<any>().props;
    const isOwner = auth.user.id === documentRequest.user_id || auth.user.id === documentRequest.requested_by;

    const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
    const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
    const [pickupName, setPickupName] = useState('');

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusReason, setStatusReason] = useState('');
    const [statusAction, setStatusAction] = useState<'Rejected' | 'Cancelled' | null>(null);

    const handleStatusUpdate = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (statusAction) {
            router.post(
                DocumentRequestsRoutes.status({ documentRequest: documentRequest.id }).url,
                { status: statusAction, status_reason: statusReason },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsStatusModalOpen(false);
                        setStatusReason('');
                        setStatusAction(null);
                    }
                }
            );
        }
    };

    const handleAcknowledge = () => {
        router.post(
            DocumentRequestsRoutes.acknowledge({
                documentRequest: documentRequest.id,
            }).url,
            {},
            {
                onSuccess: () => {
                    setIsAcknowledgeModalOpen(false);
                }
            }
        );
    };

    const handleLogPickup = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (pickupName) {
            router.post(
                DocumentRequestsRoutes.pickedUp({ documentRequest: documentRequest.id }).url,
                { released_to: pickupName },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsPickupModalOpen(false);
                        setPickupName('');
                    }
                }
            );
        }
    };

    return (
        <>
            <Head title="Request Details" />
            <div className="w-full p-4">
                <PageHeader
                    title="Request Details"
                    description="View the status and details of this document request."
                    actions={
                        <div className="flex flex-col sm:flex-row gap-2">
                            {isHr && documentRequest.status === 'Pending' && (
                                <Button
                                    variant="outline"
                                    className="shadow-sm"
                                    onClick={() =>
                                        router.post(
                                            DocumentRequestsRoutes.receive({
                                                documentRequest: documentRequest.id,
                                            }).url
                                        )
                                    }
                                >
                                    <Clock className="h-4 w-4" />
                                    Mark Received
                                </Button>
                            )}
                            {isHr && (documentRequest.status === 'Pending' || documentRequest.status === 'Received') && (
                                <Button
                                    variant="destructive"
                                    className="shadow-sm"
                                    onClick={() => {
                                        setStatusAction('Rejected');
                                        setIsStatusModalOpen(true);
                                    }}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                            )}
                            {isHr && documentRequest.status === 'Received' && (
                                <Button
                                    variant="default"
                                    className="btn-premium shadow-sm"
                                    onClick={() => setIsReleaseModalOpen(true)}
                                >
                                    <Send className="h-4 w-4" />
                                    Process / Release
                                </Button>
                            )}
                            {isHr && documentRequest.status === 'Ready for Pickup' && (
                                <Button
                                    variant="outline"
                                    className="shadow-sm"
                                    onClick={() => setIsPickupModalOpen(true)}
                                >
                                    <Box className="h-4 w-4" />
                                    Log Pickup
                                </Button>
                            )}
                            {!isHr && documentRequest.status === 'Pending' && (
                                <Button
                                    variant="destructive"
                                    className="shadow-sm"
                                    onClick={() => {
                                        setStatusAction('Cancelled');
                                        setIsStatusModalOpen(true);
                                    }}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Cancel
                                </Button>
                            )}
                            <Button variant="outline" asChild>
                                <Link href={DocumentRequestsRoutes.index().url}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to List
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        <Card className="matte-card elev-2 border-0">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Requested Documents</CardTitle>
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase',
                                            getStatusClass(
                                                documentRequest.status,
                                            ),
                                        )}
                                    >
                                        {documentRequest.status}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Requested By
                                        </p>
                                        <p className="font-semibold">
                                            {documentRequest.user.first_name}{' '}
                                            {documentRequest.user.last_name}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Date Requested
                                        </p>
                                        <p className="font-semibold">
                                            {formatDate(
                                                documentRequest.created_at,
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Purpose
                                        </p>
                                        <p className="font-semibold">
                                            {documentRequest.purpose || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                                        Documents:
                                    </h4>
                                    <ul className="list-disc space-y-1 pl-5">
                                        {documentRequest.requests.map(
                                            (reqStr: string, idx: number) => (
                                                <li
                                                    key={idx}
                                                    className="font-medium"
                                                >
                                                    {reqStr}
                                                    {reqStr ===
                                                        'Certificate of Remittance' &&
                                                        documentRequest.specify_remittance &&
                                                        ` - ${documentRequest.specify_remittance}`}
                                                    {reqStr ===
                                                        'Certified True Copy of Documents' &&
                                                        documentRequest.specify_documents &&
                                                        ` - ${documentRequest.specify_documents}`}
                                                    {reqStr === 'Other' &&
                                                        documentRequest.specify_other &&
                                                        ` - ${documentRequest.specify_other}`}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Files Section (if electronic) */}
                        {documentRequest.is_electronic &&
                            documentRequest.file_urls &&
                            documentRequest.file_urls.length > 0 && (
                                <Card className="matte-card elev-2 border-0">
                                    <CardHeader>
                                        <CardTitle>Attached Files</CardTitle>
                                        <CardDescription>
                                            These documents were uploaded
                                            electronically.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col gap-2">
                                            {documentRequest.file_urls.map(
                                                (
                                                    url: string,
                                                    index: number,
                                                ) => (
                                                    <a
                                                        key={index}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
                                                    >
                                                        <FileText className="h-5 w-5 text-primary" />
                                                        <span className="text-sm font-medium">
                                                            Attachment{' '}
                                                            {index + 1}
                                                        </span>
                                                    </a>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                    </div>

                    <div className="space-y-6">
                        <Card className="matte-card elev-2 border-0">
                            <CardHeader>
                                <CardTitle>Timeline & Audit</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="ml-2 space-y-6 border-l-2 border-muted pl-4">
                                    <div className="relative">
                                        <div className="absolute -left-[1.35rem] mt-1 h-3 w-3 rounded-full bg-primary/20 ring-4 ring-background">
                                            <div className="h-full w-full rounded-full bg-primary" />
                                        </div>
                                        <p className="text-sm font-medium">
                                            Requested
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(
                                                documentRequest.created_at,
                                            )}
                                        </p>
                                    </div>

                                    {documentRequest.received_by && (
                                        <div className="relative">
                                            <div className="absolute -left-[1.35rem] mt-1 h-3 w-3 rounded-full bg-blue-500/20 ring-4 ring-background">
                                                <div className="h-full w-full rounded-full bg-blue-500" />
                                            </div>
                                            <p className="text-sm font-medium">
                                                {documentRequest.released_at
                                                    ? 'Processed'
                                                    : 'Processing...'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                By{' '}
                                                {
                                                    documentRequest.receiver
                                                        .first_name
                                                }{' '}
                                                {
                                                    documentRequest.receiver
                                                        .last_name
                                                }
                                            </p>
                                        </div>
                                    )}

                                    {documentRequest.released_at && (
                                        <div className="relative">
                                            <div className="absolute -left-[1.35rem] mt-1 h-3 w-3 rounded-full bg-indigo-500/20 ring-4 ring-background">
                                                <div className="h-full w-full rounded-full bg-indigo-500" />
                                            </div>
                                            <p className="text-sm font-medium">
                                                Released / Sent
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    documentRequest.released_at,
                                                )}
                                            </p>
                                            {documentRequest.released_to && (
                                                <p className="text-xs text-muted-foreground">
                                                    Given to:{' '}
                                                    {
                                                        documentRequest.released_to
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {documentRequest.acknowledged_at && (
                                        <div className="relative">
                                            <div className="absolute -left-[1.35rem] mt-1 h-3 w-3 rounded-full bg-emerald-500/20 ring-4 ring-background">
                                                <div className="h-full w-full rounded-full bg-emerald-500" />
                                            </div>
                                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                Acknowledged Receipt
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    documentRequest.acknowledged_at,
                                                )}
                                            </p>
                                            <div className="mt-2 rounded-md bg-muted/50 p-2 font-mono text-xs text-muted-foreground">
                                                IP:{' '}
                                                {
                                                    documentRequest.acknowledged_ip
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {(documentRequest.status === 'Rejected' || documentRequest.status === 'Cancelled') && (
                                        <div className="relative">
                                            <div className="absolute -left-[1.35rem] mt-1 h-3 w-3 rounded-full bg-destructive/20 ring-4 ring-background">
                                                <div className="h-full w-full rounded-full bg-destructive" />
                                            </div>
                                            <p className="text-sm font-medium text-destructive">
                                                {documentRequest.status}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDate(
                                                    documentRequest.updated_at,
                                                )}
                                            </p>
                                            {documentRequest.status_reason && (
                                                <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive border border-destructive/20">
                                                    <span className="font-semibold block mb-0.5">Reason:</span>
                                                    {documentRequest.status_reason}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            {/* Actions */}
                            {(isOwner || !isHr) &&
                                documentRequest.status === 'Released' && (
                                    <CardFooter className="bg-muted/30 pt-6">
                                        <Button
                                            size="lg"
                                            className="btn-premium w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                            onClick={() => setIsAcknowledgeModalOpen(true)}
                                        >
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Acknowledge Receipt
                                        </Button>
                                    </CardFooter>
                                )}
                        </Card>
                    </div>
                </div>
            </div>
            <Dialog open={isAcknowledgeModalOpen} onOpenChange={setIsAcknowledgeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Acknowledge Receipt</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to acknowledge receipt of these documents? This will finalize the request and confirm you have received all the files or physical copies.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAcknowledgeModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="btn-premium bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={handleAcknowledge}
                        >
                            Confirm Acknowledgment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ReleaseModal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
                documentRequestId={documentRequest.id}
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
                                Enter the name of the person picking up the
                                documents.
                                <br />
                                <br />
                                <strong className="text-primary font-semibold">
                                    Note:
                                </strong>{' '}
                                Please remind the receiver to log into their
                                portal and click "Acknowledge Receipt" as soon as
                                possible to complete the two-way verification
                                process.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="pickupName">Picked Up By</Label>
                                <EmployeeSearch
                                    users={users || []}
                                    selectedId={pickupName}
                                    onSelect={(val) =>
                                        setPickupName(val === 'all' ? '' : val)
                                    }
                                    returnValue="name"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPickupModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="btn-premium">
                                Confirm Pickup
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent>
                    <form onSubmit={handleStatusUpdate}>
                        <DialogHeader>
                            <DialogTitle>{statusAction === 'Rejected' ? 'Reject Request' : 'Cancel Request'}</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to {statusAction === 'Rejected' ? 'reject' : 'cancel'} this request?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reason"
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="Enter the reason here..."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsStatusModalOpen(false);
                                    setStatusReason('');
                                }}
                            >
                                Back
                            </Button>
                            <Button type="submit" variant="destructive">
                                Confirm {statusAction === 'Rejected' ? 'Rejection' : 'Cancellation'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

DocumentRequestsShow.layout = {
    breadcrumbs: [
        {
            title: 'Document Requests',
            href: DocumentRequestsRoutes.index().url,
        },
        {
            title: 'Request Details',
        },
    ],
};
