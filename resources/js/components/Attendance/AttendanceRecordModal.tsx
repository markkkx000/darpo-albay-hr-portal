import { useForm } from '@inertiajs/react';

import { User as UserIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/date-picker';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store as storeRecord, update as updateRecord } from '@/routes/attendance/manage/records';


interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
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
}

interface AttendanceRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AttendanceRecord | null;
    employees: User[];
}

function extractTime(dateTimeString: string | null) {
    if (!dateTimeString) {
        return '';
    }

    try {
        const date = new Date(dateTimeString.replace(' ', 'T'));

        if (isNaN(date.getTime())) {
            return '08:00:00';
        }

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    } catch {
        return '';
    }
}

export function AttendanceRecordModal({ isOpen, onClose, record, employees }: AttendanceRecordModalProps) {
    const isEditing = !!record;

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        user_id: record?.user_id?.toString() || '',
        date: record?.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
        am_clock_in: record?.am_clock_in ? extractTime(record.am_clock_in) : '',
        am_clock_out: record?.am_clock_out ? extractTime(record.am_clock_out) : '',
        pm_clock_in: record?.pm_clock_in ? extractTime(record.pm_clock_in) : '',
        pm_clock_out: record?.pm_clock_out ? extractTime(record.pm_clock_out) : '',
    });


    const selectedEmployee = useMemo(() => {
        return employees.find((e) => e.id.toString() === data.user_id);
    }, [data.user_id, employees]);

    useEffect(() => {
        if (isOpen) {
            if (record) {
                setData({
                    user_id: record.user_id.toString(),
                    date: record.date,
                    am_clock_in: record.am_clock_in ? extractTime(record.am_clock_in) : '',
                    am_clock_out: record.am_clock_out ? extractTime(record.am_clock_out) : '',
                    pm_clock_in: record.pm_clock_in ? extractTime(record.pm_clock_in) : '',
                    pm_clock_out: record.pm_clock_out ? extractTime(record.pm_clock_out) : '',
                });
            } else {
                setData({
                    user_id: '',
                    date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
                    am_clock_in: '',
                    am_clock_out: '',
                    pm_clock_in: '',
                    pm_clock_out: '',
                });
            }

            clearErrors();
        }
    }, [record, isOpen, setData, clearErrors]);

    // Transform date and time into the expected backend format before submission
    transform((data) => {
        const appendSeconds = (timeStr: string | null) => {
            if (!timeStr) {
return null;
}

            if (timeStr.split(':').length === 2) {
return `${timeStr}:00`;
}

            return timeStr;
        };
        
        return {
            ...data,
            am_clock_in: data.am_clock_in ? `${data.date} ${appendSeconds(data.am_clock_in)}` : null,
            am_clock_out: data.am_clock_out ? `${data.date} ${appendSeconds(data.am_clock_out)}` : null,
            pm_clock_in: data.pm_clock_in ? `${data.date} ${appendSeconds(data.pm_clock_in)}` : null,
            pm_clock_out: data.pm_clock_out ? `${data.date} ${appendSeconds(data.pm_clock_out)}` : null,
        };
    });

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (isEditing && record) {
            put(updateRecord({ attendance: record.id }).url, {
                onSuccess: () => {
                    toast.success('Attendance record updated successfully');
                    onClose();
                },
            });
        } else {
            post(storeRecord().url, {
                onSuccess: () => {
                    toast.success('Attendance record created successfully');
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-surface-1 border-border-1 rounded-2xl shadow-2xl !fixed">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Attendance Record' : 'Add Missing Record'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? "Correct the timestamps for this attendance record." 
                            : "Manually create an attendance record for an employee."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label>Employee</Label>
                        {isEditing ? (
                            <div className="flex items-center gap-2 p-2 rounded-xl border bg-muted/50 text-muted-foreground cursor-not-allowed">
                                <UserIcon className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Unknown'}
                                </span>
                            </div>
                        ) : (
                            <div className="relative">
                                <EmployeeSearch
                                    users={employees}
                                    selectedId={data.user_id}
                                    onSelect={(val) => setData('user_id', val === 'all' ? '' : val)}
                                    returnValue="id"
                                    error={!!errors.user_id}
                                />
                            </div>
                        )}
                        {errors.user_id && <p className="text-xs text-red-500">{errors.user_id}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <DatePicker
                            id="date"
                            value={data.date}
                            onChange={(val) => setData('date', val || '')}
                            aria-invalid={!!errors.date}
                        />
                        {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="am_clock_in">AM Clock In</Label>
                            <Input
                                id="am_clock_in"
                                type="time"
                                step="1"
                                value={data.am_clock_in}
                                onChange={(e) => setData('am_clock_in', e.target.value)}
                            />
                            {errors.am_clock_in && <p className="text-xs text-red-500">{errors.am_clock_in}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="am_clock_out">AM Clock Out</Label>
                            <Input
                                id="am_clock_out"
                                type="time"
                                step="1"
                                value={data.am_clock_out}
                                onChange={(e) => setData('am_clock_out', e.target.value)}
                            />
                            {errors.am_clock_out && <p className="text-xs text-red-500">{errors.am_clock_out}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="pm_clock_in">PM Clock In</Label>
                            <Input
                                id="pm_clock_in"
                                type="time"
                                step="1"
                                value={data.pm_clock_in}
                                onChange={(e) => setData('pm_clock_in', e.target.value)}
                            />
                            {errors.pm_clock_in && <p className="text-xs text-red-500">{errors.pm_clock_in}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="pm_clock_out">PM Clock Out</Label>
                            <Input
                                id="pm_clock_out"
                                type="time"
                                step="1"
                                value={data.pm_clock_out}
                                onChange={(e) => setData('pm_clock_out', e.target.value)}
                            />
                            {errors.pm_clock_out && <p className="text-xs text-red-500">{errors.pm_clock_out}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="btn-specular px-6 border-none">
                            {isEditing ? 'Save Changes' : 'Create Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
