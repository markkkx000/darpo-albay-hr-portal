import { Head, router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
};


export default function LeaveForm({ leaveRequest, users, leaveTypes, leaveStatuses }: any) {
    const isEdit = !!leaveRequest;

    const { data, setData, post, processing, errors, transform } = useForm({
        user_id: leaveRequest?.user_id?.toString() || '',
        leave_type_id: leaveRequest?.leave_type_id?.toString() || '',
        leave_status_id: leaveRequest?.leave_status_id?.toString() || '',
        start_date: formatDateForInput(leaveRequest?.start_date),
        end_date: formatDateForInput(leaveRequest?.end_date),
        days_requested: leaveRequest?.days_requested || '',
        dates: '', // Dummy field for backend overlap validation errors
        date_received: formatDateForInput(leaveRequest?.date_received),
        date_approved: formatDateForInput(leaveRequest?.date_approved),
        approved_by_id: leaveRequest?.approved_by_id?.toString() || '',
        leave_details: leaveRequest?.leave_details || '',
        commutation_requested: leaveRequest?.commutation_requested || false,
        is_filed: leaveRequest?.is_filed || false,
        notes: leaveRequest?.notes || '',
        attachment: null as File | null,
        specific_dates: (leaveRequest?.specific_dates || []).map(formatDateForInput),
    });

    const [dateMode, setDateMode] = useState<'range' | 'specific'>(
        leaveRequest?.specific_dates && leaveRequest.specific_dates.length > 0 ? 'specific' : 'range'
    );
    const [specificDateInput, setSpecificDateInput] = useState('');
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    const isFirstRender = useRef(true);
    const prevInputs = useRef('');

    useEffect(() => {
        transform((data) => {
            if (dateMode === 'range' && data.start_date === data.end_date && data.start_date) {
                return {
                    ...data,
                    specific_dates: [data.start_date],
                    start_date: '',
                    end_date: '',
                };
            }

            return data;
        });
    }, [dateMode, transform]);



    const parseLocalDate = (dateString: string) => {
        const [y, m, d] = dateString.split('-').map(Number);

        return new Date(y, m - 1, d);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const currentInputs = `${dateMode}-${data.start_date}-${data.end_date}-${JSON.stringify(data.specific_dates)}`;

        if (prevInputs.current === currentInputs) {
            return;
        }

        prevInputs.current = currentInputs;

        let calculatedDays = '';

        if (dateMode === 'range') {
            if (data.start_date && data.end_date) {
                const start = parseLocalDate(data.start_date);
                const end = parseLocalDate(data.end_date);
                
                if (end >= start) {
                    let weekdays = 0;
                    const current = new Date(start);

                    while (current <= end) {
                        const day = current.getDay();

                        if (day !== 0 && day !== 6) {
                            weekdays++;
                        }

                        current.setDate(current.getDate() + 1);
                    }

                    calculatedDays = weekdays.toString();
                }
            }
        } else {
            const weekdayCount = data.specific_dates.filter((d: string) => {
                const day = parseLocalDate(d).getDay();

                return day !== 0 && day !== 6;
            }).length;

            calculatedDays = weekdayCount.toString();
        }

        if (calculatedDays !== '') {
            setData('days_requested', calculatedDays);
        }
    }, [data.start_date, data.end_date, data.specific_dates, dateMode, setData]);

    const addSpecificDate = () => {
        if (specificDateInput && !data.specific_dates.includes(specificDateInput)) {
            setData('specific_dates', [...data.specific_dates, specificDateInput].sort());
            setSpecificDateInput('');
        }
    };

    const removeSpecificDate = (dateToRemove: string) => {
        setData('specific_dates', data.specific_dates.filter((d: string) => d !== dateToRemove));
    };

    const toggleDateMode = (mode: 'range' | 'specific') => {
        setDateMode(mode);

        if (mode === 'range') {
            setData('specific_dates', []);
        } else {
            setData('start_date', '');
            setData('end_date', '');
        }
    };

    const selectedLeaveType = leaveTypes.find((t: any) => t.id.toString() === data.leave_type_id);
    const typeName = selectedLeaveType?.name?.toLowerCase() || '';

    const getDetailsOptions = (name: string) => {
        if (!name) {
return [];
}

        if (name.includes('vacation') || name.includes('special privilege')) {
            return ['Within the Philippines', 'Abroad'];
        }

        if (name.includes('sick')) {
            return ['In Hospital', 'Out Patient'];
        }

        if (name.includes('women')) {
            return ['Illness'];
        }

        if (name.includes('study')) {
            return ['Completion of Master\'s Degree', 'BAR/Board Examination Review', 'Others'];
        }

        return ['Monetization of Leave Credits', 'Terminal Leave', 'Others'];
    };

    const detailsOptions = getDetailsOptions(typeName);

    const getDetailsParts = (detailsString: string) => {
        if (!detailsString) {
return { category: '', specify: '' };
}

        const parts = detailsString.split(': ');

        if (parts.length > 1) {
            return { category: parts[0], specify: parts.slice(1).join(': ') };
        }

        return { category: detailsString, specify: '' };
    };

    const { category, specify } = getDetailsParts(data.leave_details);

    const updateDetails = (newCategory: string, newSpecify: string) => {
        const newValue = newSpecify && newSpecify.trim() !== '' 
            ? `${newCategory}: ${newSpecify}` 
            : newCategory;

        if (data.leave_details !== newValue) {
            setData('leave_details', newValue);
        }
    };

    const handleLeaveTypeChange = (v: string) => {
        if (data.leave_type_id === v) {
            return;
        }

        setData({
            ...data,
            leave_type_id: v,
            leave_details: '',
        });
    };

    const specifyPlaceholder = typeName.includes('sick') || typeName.includes('women') ? 'Specify Illness...' 
        : typeName.includes('vacation') ? 'Specify Location...' 
        : 'Specify details...';

    const hideSpecify = ['Monetization of Leave Credits', 'Terminal Leave', 'Completion of Master\'s Degree', 'BAR/Board Examination Review'].includes(category);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            router.post(LeaveRoutes.update({ leaveRequest: leaveRequest.id }).url, {
                _method: 'put',
                ...data,
            }, { 
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Leave request updated successfully');
                    router.clearHistory();
                }
            });
        } else {
            post(LeaveRoutes.store().url, {
                onSuccess: () => {
                    toast.success('Leave request created successfully');
                    router.clearHistory();
                }
            });
        }
    };

    return (
        <>
            <Head title={isEdit ? "Edit Leave Request" : "Encode Leave Request"} />
            <div className="container mx-auto py-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="t-title">{isEdit ? 'Edit Leave Request' : 'Encode Leave Request'}</h1>
                    <p className="text-muted-foreground">CS Form No. 6 digitizer.</p>
                </div>

                <LeaveNavigation />

                <div className="matte-card elev-2">
                    <form onSubmit={submit} className="p-6 space-y-6" noValidate>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Employee</Label>
                                <EmployeeSearch 
                                    users={users} 
                                    selectedId={data.user_id} 
                                    onSelect={(val) => setData('user_id', val === 'all' ? '' : val)}
                                    placeholder="Search Employee..."
                                    returnValue="id"
                                />
                                {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <Select value={data.leave_type_id} onValueChange={handleLeaveTypeChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Leave Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map((type: any) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.leave_type_id && <p className="text-sm text-destructive">{errors.leave_type_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Leave Details (Section 6.B)</Label>
                                <Select 
                                    value={category} 
                                    onValueChange={(val) => updateDetails(val, specify)}
                                    disabled={!mounted || !typeName}
                                >
                                    <SelectTrigger className={(!mounted || !typeName) ? "opacity-50" : ""}>
                                        <SelectValue placeholder={!typeName ? "Select Leave Type first" : "Select details..."} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {detailsOptions.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Specifics / Remarks</Label>
                                <Input 
                                    placeholder={specifyPlaceholder}
                                    value={specify}
                                    onChange={(e) => updateDetails(category, e.target.value)}
                                    disabled={!mounted || !typeName || !category || hideSpecify}
                                    className={(!mounted || !typeName || !category || hideSpecify) ? "opacity-50 bg-muted cursor-not-allowed" : ""}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 border-y py-4 my-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Date Selection</Label>
                                <div className="flex items-center space-x-2 bg-muted p-1 rounded-full">
                                    <Button type="button" size="sm" variant={dateMode === 'range' ? 'default' : 'ghost'} onClick={() => toggleDateMode('range')}>Date Range</Button>
                                    <Button type="button" size="sm" variant={dateMode === 'specific' ? 'default' : 'ghost'} onClick={() => toggleDateMode('specific')}>Specific Dates</Button>
                                </div>
                            </div>

                            {dateMode === 'range' ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input type="date" value={data.start_date} onChange={e => setData('start_date', e.target.value)} />
                                        {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                                        {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input type="date" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                                        {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Days Requested</Label>
                                        <Input type="number" step="any" min="0" value={data.days_requested} onChange={e => setData('days_requested', e.target.value)} />
                                        {errors.days_requested && <p className="text-sm text-destructive">{errors.days_requested}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Add Specific Date</Label>
                                            <div className="flex space-x-2">
                                                <Input type="date" value={specificDateInput} onChange={e => setSpecificDateInput(e.target.value)} />
                                                <Button type="button" variant="secondary" onClick={addSpecificDate}>Add Date</Button>
                                            </div>
                                            {errors.specific_dates && <p className="text-sm text-destructive">{errors.specific_dates}</p>}
                                            {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Days Requested</Label>
                                            <Input type="number" step="any" min="0" value={data.days_requested} onChange={e => setData('days_requested', e.target.value)} />
                                            {errors.days_requested && <p className="text-sm text-destructive">{errors.days_requested}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.specific_dates.map((d: string) => (
                                            <div key={d} className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                <span className="font-medium">{parseLocalDate(d).toLocaleDateString('en-US')}</span>
                                                <button type="button" onClick={() => removeSpecificDate(d)} className="text-primary hover:text-primary/70">
                                                    <X className="h-3 w-3 ml-1" />
                                                </button>
                                            </div>
                                        ))}
                                        {data.specific_dates.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic mt-2">No dates added yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Date Received</Label>
                                <Input type="date" value={data.date_received} onChange={e => setData('date_received', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date Approved</Label>
                                <Input type="date" value={data.date_approved} onChange={e => setData('date_approved', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Approved By</Label>
                                <EmployeeSearch 
                                    users={users} 
                                    selectedId={data.approved_by_id} 
                                    onSelect={(val) => setData('approved_by_id', val === 'all' ? '' : val)}
                                    placeholder="Search Approver..."
                                    returnValue="id"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.leave_status_id} onValueChange={(v) => setData('leave_status_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveStatuses.map((s: any) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Attachment (Scanned Form)</Label>
                                <Input type="file" onChange={e => setData('attachment', e.target.files?.[0] || null)} />
                                {isEdit && leaveRequest.attachment_path && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        <a href={`/storage/${leaveRequest.attachment_path}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Current Attachment</a>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-6 py-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="commutation" checked={data.commutation_requested} onCheckedChange={(c) => setData('commutation_requested', c === true)} />
                                <Label htmlFor="commutation" className="text-sm font-medium leading-none">Commutation Requested</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="is_filed" checked={data.is_filed} onCheckedChange={(c) => setData('is_filed', c === true)} />
                                <Label htmlFor="is_filed" className="text-sm font-medium leading-none">Form is properly filed</Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea value={data.notes} onChange={e => setData('notes', e.target.value)} />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{isEdit ? 'Update Request' : 'Save Request'}</Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

LeaveForm.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: LeaveRoutes.index().url },
        { title: 'Encode', href: '#' },
    ],
};
