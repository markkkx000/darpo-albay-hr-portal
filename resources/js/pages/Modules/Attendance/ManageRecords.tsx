import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AttendanceFilters } from '@/components/Attendance/AttendanceFilters';
import { AttendanceRecordModal } from '@/components/Attendance/AttendanceRecordModal';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { index as manageRecordsIndexRoute, destroy as destroyRecord } from '@/routes/attendance/manage/records';

interface User {
    id: number;
    first_name: string;
    last_name: string;
}

interface AttendanceRecord {
    id: number;
    user_id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
    user?: User;
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
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const canDelete = auth.permissions?.includes('attendance.delete');

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

    const handleDelete = () => {
        if (recordToDelete) {
            router.delete(destroyRecord({ attendance: recordToDelete.id }).url, {
                onSuccess: () => {
                    toast.success('Record deleted successfully');
                    setRecordToDelete(null);
                },
                onError: () => {
                    toast.error('Failed to delete record');
                    setRecordToDelete(null);
                }
            });
        }
    };

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const getStatusInfo = (record: AttendanceRecord) => {
        if (record.clock_out) {
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

            <div className="relative z-10 p-6 lg:p-10 w-full animate-fade-up space-y-8">
                <div className="matte-card elev-2 flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 mb-6">
                    <div>
                        <h1 className="t-title">Attendance Management</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Systematically manage records and resolve logging anomalies.
                        </p>
                    </div>
                    <Button onClick={handleAddNew} size="lg" className="btn-specular">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Missing Record
                    </Button>
                </div>

                <div className="space-y-6">
                    <AttendanceFilters
                        filters={filters}
                        routeName={manageRecordsIndexRoute().url}
                    />

                    <Card className="overflow-hidden border-none shadow-xl">
                    <CardHeader className="bg-surface-2 pb-4 border-b border-border-1">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 t-headline">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Attendance Logs
                                </CardTitle>
                                <CardDescription>View and manage historical attendance logs for all staff.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase font-bold bg-surface-1">
                                    <tr>
                                        <th className="px-6 py-4 border-b border-border-1">Employee</th>
                                        <th className="px-6 py-4 border-b border-border-1">Date</th>
                                        <th className="px-6 py-4 border-b border-border-1">Clock In</th>
                                        <th className="px-6 py-4 border-b border-border-1">Clock Out</th>
                                        <th className="px-6 py-4 border-b border-border-1">Status</th>
                                        <th className="px-6 py-4 border-b border-border-1 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-1">
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-20 text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Clock className="h-8 w-8 opacity-20" />
                                                    <p>No records found matching your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        records.data.map((record) => {
                                            const status = getStatusInfo(record);

                                            return (
                                                <tr key={record.id} className="hover:bg-surface-2 transition-colors group">
                                                    <td className="px-6 py-4 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                                {record.user?.first_name[0]}{record.user?.last_name[0]}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-foreground">
                                                                    {record.user ? `${record.user.first_name} ${record.user.last_name}` : 'Unknown'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Employee</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{formatDate(record.date)}</span>
                                                            <span className="text-[10px] text-muted-foreground uppercase">{new Date(record.date).toLocaleDateString([], { weekday: 'long' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="outline" className="font-mono bg-surface-2 text-foreground border-transparent">
                                                            {formatTime(record.clock_in)}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {record.clock_out ? (
                                                            <Badge variant="outline" className="font-mono bg-surface-2 text-foreground border-transparent">
                                                                {formatTime(record.clock_out)}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground italic text-xs flex items-center gap-1">
                                                                <X className="h-3 w-3" />
                                                                Missed
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge 
                                                            variant={status.variant} 
                                                            className={cn(
                                                                "uppercase text-[9px] px-2 py-0.5 font-bold tracking-tight shadow-sm",
                                                                status.label === 'Completed' && "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
                                                                status.label === 'Incomplete' && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                                                status.label === 'Working' && "bg-primary/10 text-primary border-primary/20 animate-pulse"
                                                            )}
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(record)}
                                                                className="h-8 w-8 p-0"
                                                                title="Edit Record"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Button>
                                                            {canDelete && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => confirmDelete(record)}
                                                                    className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                                                    title="Delete Record"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
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
                        <div className="px-6 border-t border-border-1">
                            <Pagination links={records.links} meta={records} />
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>

            <AttendanceRecordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                record={selectedRecord}
                employees={employees}
            />

            <Dialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will soft delete the attendance record for {recordToDelete?.user?.first_name} {recordToDelete?.user?.last_name} on {recordToDelete ? formatDate(recordToDelete.date) : ''}.
                            It can be restored by a system administrator if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRecordToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>
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
