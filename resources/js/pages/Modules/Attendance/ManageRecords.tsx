import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, User as UserIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AttendanceRecordModal } from '@/components/Attendance/AttendanceRecordModal';
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
import { index as attendanceIndexRoute } from '@/routes/attendance';
import { destroy as destroyRecord } from '@/routes/attendance/manage/records';

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
    };
    employees: User[];
    filters: {
        user_id?: string;
        date?: string;
    };
}

export default function ManageRecords({ records, employees }: Props) {
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

    return (
        <>
            <Head title="Manage Attendance Records" />
            
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Attendance Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Manually manage employee attendance records, correct timestamps, and resolve anomalies.
                        </p>
                    </div>
                    <Button onClick={handleAddNew} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Missing Record
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            Historical Records
                        </CardTitle>
                        <CardDescription>View and manage historical attendance logs for all staff.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-900/50 dark:text-gray-400 font-bold">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">Employee</th>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">Date</th>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">Clock In</th>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">Clock Out</th>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">Status</th>
                                        <th className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-muted-foreground border-b border-gray-100 dark:border-gray-800">
                                                No records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        records.data.map((record) => (
                                            <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="px-4 py-4 font-medium">
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                                        {record.user ? `${record.user.first_name} ${record.user.last_name}` : 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">{formatDate(record.date)}</td>
                                                <td className="px-4 py-4">{formatTime(record.clock_in)}</td>
                                                <td className="px-4 py-4">
                                                    {record.clock_out ? formatTime(record.clock_out) : (
                                                        <span className="text-muted-foreground italic text-xs">Incomplete</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={record.clock_out ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                                        {record.clock_out ? 'Completed' : 'Working'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4 text-right space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleEdit(record)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                                        Edit
                                                    </Button>
                                                    {canDelete && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm" 
                                                            onClick={() => confirmDelete(record)}
                                                            className="h-8 px-2"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                            Delete
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
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
