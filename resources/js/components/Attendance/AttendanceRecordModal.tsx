import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { clsx  } from 'clsx';
import type {ClassValue} from 'clsx';
import { Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { DatePicker } from '@/components/date-picker';
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

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number?: string | null;
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
    const [query, setQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        user_id: record?.user_id?.toString() || '',
        date: record?.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
        am_clock_in: record?.am_clock_in ? extractTime(record.am_clock_in) : '',
        am_clock_out: record?.am_clock_out ? extractTime(record.am_clock_out) : '',
        pm_clock_in: record?.pm_clock_in ? extractTime(record.pm_clock_in) : '',
        pm_clock_out: record?.pm_clock_out ? extractTime(record.pm_clock_out) : '',
    });

    const filteredEmployees = useMemo(() => {
        const employeesArray = Array.isArray(employees) ? employees : [];

        // Identify selected employee display name to prevent dropdown truncation when clicking
        let selectedName = '';

        if (data.user_id) {
            const found = employeesArray.find((e) => e.id.toString() === data.user_id.toString());

            if (found) {
                selectedName = `${found.first_name} ${found.last_name}`;
            }
        }

        // If query is empty or matches the selected display name exactly, show all employees
        if (query === '' || query.toLowerCase() === selectedName.toLowerCase()) {
            return employeesArray;
        }

        return employeesArray.filter((employee) => {
            const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
            const employeeNum = (employee.employee_number || '').toLowerCase();
            const search = query.toLowerCase();

            return fullName.includes(search) || employeeNum.includes(search);
        });
    }, [query, employees, data.user_id]);

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
                                <Combobox 
                                    value={data.user_id} 
                                    onChange={(value) => setData('user_id', value as string)}
                                >
                                    <div className="relative">
                                        <div className="relative w-full cursor-default overflow-hidden rounded-xl border border-input bg-background text-left shadow-sm focus-within:ring-1 focus-within:ring-ring">
                                            <ComboboxInput
                                                className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-foreground bg-transparent focus:ring-0 outline-none"
                                                displayValue={() => {
                                                    return selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : '';
                                                }}
                                                placeholder="Search employee..."
                                                onChange={(event) => setQuery(event.target.value)}
                                            />
                                            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                            </ComboboxButton>
                                        </div>
                                        <Transition
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                            afterLeave={() => setQuery('')}
                                        >
                                            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-popover py-1 px-1.5 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border">
                                                {filteredEmployees.length === 0 && query !== '' ? (
                                                    <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
                                                        Nothing found.
                                                    </div>
                                                ) : (
                                                    filteredEmployees.map((person) => (
                                                        <ComboboxOption
                                                            key={person.id}
                                                            className={({ focus }) =>
                                                                cn(
                                                                    "relative cursor-default select-none py-2 pl-10 pr-4",
                                                                    focus ? "item-hover-gradient mx-1.5 my-0.5 rounded-[16px]" : "text-popover-foreground mx-1.5 my-0.5"
                                                                )
                                                            }
                                                            value={person.id.toString()}
                                                        >
                                                             {({ selected, focus }) => (
                                                                <>
                                                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                                                        {person.first_name} {person.last_name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-black font-extrabold" : "text-primary")}>
                                                                            <Check className="h-4 w-4" aria-hidden="true" />
                                                                        </span>
                                                                    ) : null}
                                                                </>
                                                            )}
                                                        </ComboboxOption>
                                                    ))
                                                )}
                                            </ComboboxOptions>
                                        </Transition>
                                    </div>
                                </Combobox>
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
