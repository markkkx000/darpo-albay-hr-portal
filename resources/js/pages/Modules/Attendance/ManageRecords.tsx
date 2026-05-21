import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Clock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AttendanceFilters } from '@/components/Attendance/AttendanceFilters';
import { AttendanceRecordModal } from '@/components/Attendance/AttendanceRecordModal';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { index as attendanceIndexRoute } from '@/routes/attendance';
import {
    index as manageRecordsIndexRoute,
    destroy as destroyRecord,
    restore as restoreRecord,
} from '@/routes/attendance/manage/records';

interface User {
    id: number;
    first_name: string;
    last_name: string;
}

interface AttendanceRecord {
    id: number;
    user_id: number;
    date: string;
    am_clock_in: string | null;
    am_clock_out: string | null;
    pm_clock_in: string | null;
    pm_clock_out: string | null;
    user?: User;
    deleted_at?: string | null;
}

interface Props {
    records: {
        data: AttendanceRecord[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
    };
    employees: User[];
    filters: {
        search?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    };
}

export default function ManageRecords({ records, employees, filters }: Props) {
    const { auth } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
        useState<AttendanceRecord | null>(null);
    const [recordToDelete, setRecordToDelete] =
        useState<AttendanceRecord | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const canDelete = auth.permissions?.includes('attendance.logs.manage');

    const handleEdit = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedRecord(null);
        setIsModalOpen(true);
    };

    const confirmDelete = (record: AttendanceRecord) => {
        setRecordToDelete(record);
    };

    const handleRestore = (record: AttendanceRecord) => {
        router.post(
            restoreRecord({ id: record.id }).url,
            {},
            {
                preserveScroll: true,
                onStart: () => setIsProcessing(true),
                onFinish: () => setIsProcessing(false),
                onSuccess: () => {
                    toast.success('Record restored successfully');
                    router.clearHistory();
                },
                onError: () => {
                    toast.error('Failed to restore record');
                },
            },
        );
    };

    const handleDelete = () => {
        if (recordToDelete) {
            router.delete(
                destroyRecord({ attendance: recordToDelete.id }).url,
                {
                    onStart: () => setIsProcessing(true),
                    onFinish: () => setIsProcessing(false),
                    onSuccess: () => {
                        toast.success('Record deleted successfully');
                        setRecordToDelete(null);
                        router.clearHistory();
                    },
                    onError: () => {
                        toast.error('Failed to delete record');
                        setRecordToDelete(null);
                    },
                },
            );
        }
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusInfo = (record: AttendanceRecord) => {
        if (record.deleted_at) {
            return { label: 'Archived', variant: 'outline' as const };
        }

        if (record.pm_clock_out) {
            return { label: 'Completed', variant: 'secondary' as const };
        }

        const recordDate = new Date(record.date).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);

        if (recordDate < today) {
            return { label: 'Incomplete', variant: 'destructive' as const };
        }

        return { label: 'Working', variant: 'default' as const };
    };

    return (
        <>
            <Head title="Manage Attendance Records" />

            <div className="animate-fade-up relative z-10 w-full space-y-8 p-4">
                <PageHeader
                    title="Attendance Management"
                    description="Systematically manage records and resolve logging anomalies."
                    actions={
                        <Button
                            onClick={handleAddNew}
                            size="lg"
                            className="btn-ghost-specular border-none px-6"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Missing Record
                        </Button>
                    }
                />

                <div className="space-y-6">
                    <AttendanceFilters
                        filters={filters}
                        routeName={manageRecordsIndexRoute().url}
                    />

                    <div className="matte-card elev-2 overflow-hidden border-none">
                        <div className="border-b border-border-1 bg-surface-2 p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="t-headline flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        Attendance Logs
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        View and manage historical attendance
                                        logs for all staff.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface-1 text-xs font-bold text-muted-foreground uppercase">
                                        <tr>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                Employee
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                Date
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                AM In
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                AM Out
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                PM In
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                PM Out
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4">
                                                Status
                                            </th>
                                            <th className="border-b border-border-1 px-6 py-4 text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-1">
                                        {records.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-20 text-center text-muted-foreground"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Clock className="h-8 w-8 opacity-20" />
                                                        <p>
                                                            No records found
                                                            matching your
                                                            filters.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            records.data.map((record) => {
                                                const status =
                                                    getStatusInfo(record);

                                                return (
                                                    <tr
                                                        key={record.id}
                                                        className="group transition-colors hover:bg-surface-2"
                                                    >
                                                        <td className="px-6 py-4 font-medium">
                                                            <div className="flex items-center gap-3">
                                                                <div className="sqicon sqicon-green flex h-8 w-8 items-center justify-center !rounded-[8px] text-[10px] font-bold uppercase">
                                                                    {
                                                                        record
                                                                            .user
                                                                            ?.first_name[0]
                                                                    }
                                                                    {
                                                                        record
                                                                            .user
                                                                            ?.last_name[0]
                                                                    }
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold text-foreground">
                                                                        {record.user
                                                                            ? `${record.user.first_name} ${record.user.last_name}`
                                                                            : 'Unknown'}
                                                                    </span>
                                                                    <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                                                                        Employee
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">
                                                                    {formatDate(
                                                                        record.date,
                                                                    )}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground uppercase">
                                                                    {new Date(
                                                                        record.date,
                                                                    ).toLocaleDateString(
                                                                        [],
                                                                        {
                                                                            weekday:
                                                                                'long',
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {record.am_clock_in ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-transparent bg-surface-2 font-mono text-foreground"
                                                                >
                                                                    {formatTime(record.am_clock_in)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {record.am_clock_out ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-transparent bg-surface-2 font-mono text-foreground"
                                                                >
                                                                    {formatTime(record.am_clock_out)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {record.pm_clock_in ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-transparent bg-surface-2 font-mono text-foreground"
                                                                >
                                                                    {formatTime(record.pm_clock_in)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {record.pm_clock_out ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="border-transparent bg-surface-2 font-mono text-foreground"
                                                                >
                                                                    {formatTime(record.pm_clock_out)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                variant={
                                                                    status.variant
                                                                }
                                                                className={cn(
                                                                    'px-2 py-0.5 text-[9px] font-bold tracking-tight uppercase shadow-sm',
                                                                    status.label ===
                                                                    'Completed' &&
                                                                    'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400',
                                                                    status.label ===
                                                                    'Incomplete' &&
                                                                    'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                                                    status.label ===
                                                                    'Working' &&
                                                                    'animate-pulse border-primary/20 bg-primary/10 text-primary',
                                                                    status.label ===
                                                                    'Archived' &&
                                                                    'border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
                                                                )}
                                                            >
                                                                {status.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2 opacity-60 transition-all duration-300 group-hover:opacity-100">
                                                                {record.deleted_at ? (
                                                                    canDelete && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleRestore(
                                                                                    record,
                                                                                )
                                                                            }
                                                                            className="btn-ghost-specular h-8 w-8 rounded-full border-none p-0"
                                                                            title="Restore Record"
                                                                        >
                                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    )
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                handleEdit(
                                                                                    record,
                                                                                )
                                                                            }
                                                                            className="btn-ghost-specular h-8 w-8 rounded-full border-none p-0"
                                                                            aria-label={`Edit record for ${record.user?.first_name} ${record.user?.last_name}`}
                                                                            title="Edit Record"
                                                                        >
                                                                            <Edit className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                        {canDelete && (
                                                                            <Button
                                                                                variant="ghost-destructive"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                    confirmDelete(
                                                                                        record,
                                                                                    )
                                                                                }
                                                                                className="btn-ghost-danger-specular h-8 w-8 rounded-full border-none p-0"
                                                                                aria-label={`Delete record for ${record.user?.first_name} ${record.user?.last_name}`}
                                                                                title="Delete Record"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-border-1 px-6">
                                <Pagination
                                    links={records.links}
                                    meta={records}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AttendanceRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                record={selectedRecord}
                employees={employees}
            />

            <Dialog
                open={!!recordToDelete}
                onOpenChange={(open) =>
                    !open && !isProcessing && setRecordToDelete(null)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will soft delete the attendance record for{' '}
                            {recordToDelete?.user?.first_name}{' '}
                            {recordToDelete?.user?.last_name} on{' '}
                            {recordToDelete
                                ? formatDate(recordToDelete.date)
                                : ''}
                            . It can be restored by a system administrator if
                            needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setRecordToDelete(null)}
                            className="btn-ghost-specular border-none px-6"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="ghost-destructive"
                            onClick={handleDelete}
                            className="btn-ghost-danger-specular border-none px-6"
                            disabled={isProcessing}
                        >
                            Delete Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ManageRecords.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendanceIndexRoute().url,
        },
        {
            title: 'Manage Records',
            href: '#',
        },
    ],
};
