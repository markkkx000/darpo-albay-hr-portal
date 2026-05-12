import { Head, router, useForm, useHttp } from '@inertiajs/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { CreditPreview } from '@/components/Leave/CreditPreview';
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

    const { data, setData, processing, errors } = useForm({
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
        attachment_urls: leaveRequest?.attachment_urls || [''],
        specific_dates: (leaveRequest?.specific_dates || []).map(formatDateForInput),
        salary: leaveRequest?.salary || '',
        date_filed: formatDateForInput(leaveRequest?.date_filed) || formatDateForInput(new Date().toISOString()),
        days_with_pay: leaveRequest?.days_with_pay || '',
        days_without_pay: leaveRequest?.days_without_pay || '',
        others_pay_remarks: leaveRequest?.others_pay_remarks || '',
        approved_by_official: leaveRequest?.approved_by_official || '',
        leave_detail_type: leaveRequest?.leave_detail_type || '',
        leave_detail_remarks: leaveRequest?.leave_detail_remarks || '',
        vl_balance_at_filing: leaveRequest?.vl_balance_at_filing || '',
        sl_balance_at_filing: leaveRequest?.sl_balance_at_filing || '',
        has_attachments: leaveRequest?.has_attachments || false,
        supporting_documents: leaveRequest?.supporting_documents || [] as string[],
        maternity_allocation_details: leaveRequest?.maternity_allocation_details || '',
    });

    const [dateMode, setDateMode] = useState<'range' | 'specific'>(
        leaveRequest?.specific_dates && leaveRequest.specific_dates.length > 0 ? 'specific' : 'range'
    );
    const [specificDateInput, setSpecificDateInput] = useState('');
    const [userCredits, setUserCredits] = useState<any[]>([]);
    const http = useHttp();

    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    );

    const lastFetched = useRef<string | null>(null);

    useEffect(() => {
        if (!data.user_id) {
            lastFetched.current = null;

            return;
        }

        // Use start_date year, or date_filed year, or current year
        const year = data.start_date
            ? new Date(data.start_date).getFullYear()
            : (data.date_filed ? new Date(data.date_filed).getFullYear() : new Date().getFullYear());

        const fetchKey = `${data.user_id}-${year}`;

        if (lastFetched.current === fetchKey) {
            return;
        }

        lastFetched.current = fetchKey;

        const route = LeaveRoutes.credits.show({ user: data.user_id }, { query: { year } });

        http.submit(route)
            .then((res: any) => {
                // With submit, res is usually the direct response body
                const credits = res?.credits ?? res?.data?.credits ?? res?.data ?? res;

                if (Array.isArray(credits)) {
                    setUserCredits(credits);
                } else if (credits && typeof credits === 'object' && credits.credits) {
                    // Nested case
                    setUserCredits(credits.credits);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch credits:', err);
                lastFetched.current = null;
            });
    }, [data.user_id, data.start_date, data.date_filed, http]);

    const currentCredit = Array.isArray(userCredits)
        ? userCredits.find(c =>
            c.user_id?.toString() === data.user_id &&
            c.leave_type_id?.toString() === data.leave_type_id
        )
        : null;

    const available = currentCredit ? parseFloat(currentCredit.balance) : 0;
    const requested = parseFloat(data.days_requested) || 0;
    const remaining = available - requested;







    const parseLocalDate = (dateString: string) => {
        if (!dateString) {
            return null;
        }

        const [y, m, d] = dateString.split('-').map(Number);

        return new Date(y, m - 1, d);
    };

    const calculatedDays = useMemo(() => {
        if (dateMode === 'range') {
            const start = parseLocalDate(data.start_date);
            const end = parseLocalDate(data.end_date);

            if (!start || !end || end < start) {
                return '';
            }

            // Mathematical calculation of weekdays
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            let count = 0;
            const tempDate = new Date(start);

            for (let i = 0; i < diffDays; i++) {
                const day = tempDate.getDay();

                if (day !== 0 && day !== 6) {
                    count++;
                }

                tempDate.setDate(tempDate.getDate() + 1);
            }

            return count.toString();
        } else {
            if (!data.specific_dates || data.specific_dates.length === 0) {
                return '';
            }

            return data.specific_dates.filter((d: string) => {
                const date = parseLocalDate(d);
                const day = date?.getDay();

                return day !== 0 && day !== 6;
            }).length.toString();
        }
    }, [data.start_date, data.end_date, data.specific_dates, dateMode]);

    const lastAutoCalc = useRef(calculatedDays);

    useEffect(() => {
        if (calculatedDays !== '' && calculatedDays !== lastAutoCalc.current) {
            setData((prev: any) => ({
                ...prev,
                days_requested: calculatedDays,
                days_with_pay: calculatedDays,
                days_without_pay: '0'
            }));
            lastAutoCalc.current = calculatedDays;
        }
    }, [calculatedDays, setData]);

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

        if (name.includes('vacation') || name.includes('mandatory') || name.includes('special privilege')) {
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

        if (name.includes('maternity') || name.includes('paternity') || name.includes('vawc') || name.includes('parent')) {
            return ['N/A'];
        }

        return ['Monetization of Leave Credits', 'Terminal Leave', 'Others'];
    };

    const getSupportingDocsOptions = (name: string) => {
        const docs = [];

        if (name.includes('sick')) {
            docs.push('Medical Certificate', 'Affidavit');
        }

        if (name.includes('maternity') || name.includes('paternity')) {
            docs.push('Proof of Pregnancy/Delivery', 'Marriage Contract', 'Notice of Allocation (CS Form 6a)');
        }

        if (name.includes('solo parent')) {
            docs.push('Solo Parent Identification Card', 'Birth Certificate');
        }

        if (name.includes('women')) {
            docs.push('Medical Certificate (Gynecological Surgery)');
        }

        if (name.includes('vawc')) {
            docs.push('Protection Order', 'Police Report');
        }

        if (name.includes('study') || name.includes('rehabilitation')) {
            docs.push('Contract', 'Incident/Police Report', 'Written Concurrence');
        }

        if (parseFloat(data.days_requested) >= 30) {
            docs.push('Clearance Form (CS Form 7)');
        }

        return [...new Set(docs)]; // Unique docs
    };

    const detailsOptions = getDetailsOptions(typeName);
    const supportingDocsOptions = getSupportingDocsOptions(typeName);

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
            setData((prev: any) => ({
                ...prev,
                leave_details: newValue,
                leave_detail_type: newCategory,
                leave_detail_remarks: newSpecify
            }));
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

    const addAttachmentUrl = () => {
        setData('attachment_urls', [...data.attachment_urls, '']);
    };

    const removeAttachmentUrl = (index: number) => {
        const urls = [...data.attachment_urls];
        urls.splice(index, 1);
        setData('attachment_urls', urls.length > 0 ? urls : ['']);
    };

    const updateAttachmentUrl = (index: number, val: string) => {
        const urls = [...data.attachment_urls];
        urls[index] = val;
        setData('attachment_urls', urls);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        // Apply transformations before submit
        let finalData = { ...data };

        if (dateMode === 'range' && data.start_date === data.end_date && data.start_date) {
            finalData = {
                ...finalData,
                specific_dates: [data.start_date],
                start_date: '',
                end_date: '',
            };
        }

        if (isEdit) {
            router.post(LeaveRoutes.update({ leaveRequest: leaveRequest.id }).url, {
                _method: 'put',
                ...finalData,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Leave request updated successfully');
                    router.clearHistory();
                }
            });
        } else {
            router.post(LeaveRoutes.store().url, finalData, {
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

                        <div className="grid grid-cols-3 gap-4">
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
                                <Label>Date Filed</Label>
                                <Input
                                    type="date"
                                    value={data.date_filed}
                                    onChange={e => setData('date_filed', e.target.value)}
                                />
                                {errors.date_filed && <p className="text-sm text-destructive">{errors.date_filed}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Monthly Salary</Label>
                                <Input
                                    type="text"
                                    placeholder="0.00"
                                    value={data.salary}
                                    onChange={e => {
                                        const val = e.target.value.replace(/,/g, '');

                                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                            setData('salary', val);
                                        }
                                    }}
                                />
                                {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-6">
                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <Select value={data.leave_type_id} onValueChange={handleLeaveTypeChange}>
                                    <SelectTrigger>
                                        <div className="truncate text-left flex-1">
                                            <SelectValue placeholder="Select Leave Type" />
                                        </div>
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
                            <div className="space-y-4">
                                <Label>Approved For</Label>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            className="w-24 h-9"
                                            type="number"
                                            step="any"
                                            value={data.days_with_pay}
                                            onChange={e => setData('days_with_pay', e.target.value)}
                                        />
                                        <span className="text-sm">days with pay</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            className="w-24 h-9"
                                            type="number"
                                            step="any"
                                            value={data.days_without_pay}
                                            onChange={e => setData('days_without_pay', e.target.value)}
                                        />
                                        <span className="text-sm">days without pay</span>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-3">
                                        <Input
                                            className="flex-1 h-9"
                                            type="text"
                                            placeholder="Others (Specify)"
                                            value={data.others_pay_remarks}
                                            onChange={e => setData('others_pay_remarks', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {(errors.days_with_pay || errors.days_without_pay) && (
                                    <p className="text-sm text-destructive">
                                        {errors.days_with_pay || errors.days_without_pay}
                                    </p>
                                )}
                            </div>
                        </div>

                        {data.user_id && data.leave_type_id && (
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                <CreditPreview
                                    available={available}
                                    requested={requested}
                                    remaining={remaining}
                                    leaveTypeName={typeName}
                                    accentColor={selectedLeaveType?.color ?? '#3B82F6'}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Leave Details (Section 6.B)</Label>
                                <Select
                                    value={category}
                                    onValueChange={(val) => updateDetails(val, specify)}
                                    disabled={!mounted || !typeName}
                                >
                                    <SelectTrigger className={(!mounted || !typeName) ? "opacity-50" : ""}>
                                        <div className="truncate text-left flex-1">
                                            <SelectValue placeholder={!typeName ? "Select Leave Type first" : "Select details..."} />
                                        </div>
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
                                            <div key={d} className="badge-premium group">
                                                <span>{parseLocalDate(d)?.toLocaleDateString('en-GB', { timeZone: 'Asia/Manila' }) ?? d}</span>
                                                <button type="button" onClick={() => removeSpecificDate(d)} className="text-black/50 hover:text-black transition-colors">
                                                    <X className="h-3.5 w-3.5" />
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
                                        <div className="truncate text-left flex-1">
                                            <SelectValue placeholder="Select Status" />
                                        </div>
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
                            <div className="space-y-3">
                                <Label>Attachment/s URL</Label>
                                <div className="space-y-2">
                                    {data.attachment_urls.map((url: string, idx: number) => (
                                        <div key={idx} className="flex space-x-2">
                                            <Input
                                                type="url"
                                                placeholder="https://drive.google.com/..."
                                                value={url}
                                                onChange={e => updateAttachmentUrl(idx, e.target.value)}
                                            />
                                            {data.attachment_urls.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachmentUrl(idx)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addAttachmentUrl} className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add another URL
                                </Button>
                                {errors.attachment_urls && <p className="text-sm text-destructive">{errors.attachment_urls}</p>}
                            </div>
                        </div>

                        {typeName && (
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_attachments"
                                        checked={data.has_attachments}
                                        onCheckedChange={(c) => setData('has_attachments', c === true)}
                                    />
                                    <Label htmlFor="has_attachments" className="font-semibold">Has Supporting Documents / Attachments</Label>
                                </div>

                                {data.has_attachments && (
                                    <div className="pl-6 grid grid-cols-2 gap-y-2 gap-x-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                        {supportingDocsOptions.map(doc => (
                                            <div key={doc} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`doc-${doc}`}
                                                    checked={data.supporting_documents.includes(doc)}
                                                    onCheckedChange={(c) => {
                                                        const docs = [...data.supporting_documents];

                                                        if (c) {
                                                            docs.push(doc);
                                                        } else {
                                                            const idx = docs.indexOf(doc);

                                                            if (idx > -1) {
                                                                docs.splice(idx, 1);
                                                            }
                                                        }

                                                        setData('supporting_documents', docs);
                                                    }}
                                                />
                                                <Label htmlFor={`doc-${doc}`} className="text-sm">{doc}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.supporting_documents && <p className="text-sm text-destructive">{errors.supporting_documents}</p>}
                            </div>
                        )}

                        {typeName.includes('maternity') && (
                            <div className="space-y-2 border-t pt-4">
                                <Label>Maternity Allocation (CS Form 6a)</Label>
                                <Input
                                    placeholder="e.g. Allocated 7 days to John Doe (Husband)"
                                    value={data.maternity_allocation_details}
                                    onChange={e => setData('maternity_allocation_details', e.target.value)}
                                />
                            </div>
                        )}

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
