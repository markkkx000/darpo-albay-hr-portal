import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { clsx  } from 'clsx';
import type {ClassValue} from 'clsx';
import { Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
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
}

interface AttendanceRecord {
    id: number;
    user_id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
    user?: User;
}

interface AttendanceRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AttendanceRecord | null;
    employees: User[];
}

function extractTime(dateTimeString: string) {
    if (!dateTimeString) {
        return '08:00:00';
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
        return '08:00:00';
    }
}

export function AttendanceRecordModal({ isOpen, onClose, record, employees }: AttendanceRecordModalProps) {
    const isEditing = !!record;
    const [query, setQuery] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        user_id: record?.user_id?.toString() || '',
        date: record?.date || new Date().toISOString().split('T')[0],
        clock_in: record?.clock_in ? extractTime(record.clock_in) : '08:00:00',
        clock_out: record?.clock_out ? extractTime(record.clock_out) : '17:00:00',
    });

    const filteredEmployees = useMemo(() => {
        return query === ''
            ? employees
            : employees.filter((employee) => {
                  const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();

                  return fullName.includes(query.toLowerCase());
              });
    }, [query, employees]);

    const selectedEmployee = useMemo(() => {
        return employees.find((e) => e.id.toString() === data.user_id);
    }, [data.user_id, employees]);

    useEffect(() => {
        if (isOpen) {
            if (record) {
                setData({
                    user_id: record.user_id.toString(),
                    date: record.date,
                    clock_in: extractTime(record.clock_in),
                    clock_out: record.clock_out ? extractTime(record.clock_out) : '17:00:00',
                });
            } else {
                setData({
                    user_id: '',
                    date: new Date().toISOString().split('T')[0],
                    clock_in: '08:00:00',
                    clock_out: '17:00:00',
                });
            }

            clearErrors();
        }
    }, [record, isOpen, setData, clearErrors]);

    // Transform date and time into the expected backend format before submission
    transform((data) => ({
        ...data,
        clock_in: `${data.date} ${data.clock_in}`,
        clock_out: data.clock_out ? `${data.date} ${data.clock_out}` : null,
    }));

    const handleSubmit = (e: React.FormEvent) => {
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
                                            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-popover py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 border">
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
                                                                    focus ? "bg-accent text-accent-foreground" : "text-popover-foreground"
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
                                                                        <span className={cn("absolute inset-y-0 left-0 flex items-center pl-3", focus ? "text-accent-foreground" : "text-primary")}>
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
                        <Input
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                        />
                        {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="clock_in">Clock In Time</Label>
                            <Input
                                id="clock_in"
                                type="time"
                                step="1"
                                value={data.clock_in}
                                onChange={(e) => setData('clock_in', e.target.value)}
                            />
                            {errors.clock_in && <p className="text-xs text-red-500">{errors.clock_in}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="clock_out">Clock Out Time</Label>
                            <Input
                                id="clock_out"
                                type="time"
                                step="1"
                                value={data.clock_out}
                                onChange={(e) => setData('clock_out', e.target.value)}
                            />
                            {errors.clock_out && <p className="text-xs text-red-500">{errors.clock_out}</p>}
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
