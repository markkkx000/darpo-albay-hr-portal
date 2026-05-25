import { Head, router, useForm, useHttp } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import {
    useState,
    useEffect,
    useRef,
    useMemo,
    useSyncExternalStore,
} from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import PageHeader from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LeaveRoutes from '@/routes/leave';
import {
    parseLocalDate,
    getDetailsOptions,
    getSupportingDocsOptions,
    getDetailsParts,
    EmployeeSection,
    LeaveTypeSection,
    DetailsSection,
    DateSection,
    ApprovalSection,
    StatusSection,
    SupportingDocsSection,
} from './Components/Form';
import LeaveNavigation from './Components/LeaveNavigation';

export default function LeaveForm({
    leaveRequest,
    users,
    leaveTypes,
    leaveStatuses,
    holidays = [],
}: any) {
    const isEdit = !!leaveRequest;

    const { data, setData, processing, errors, post, put, transform } = useForm(
        {
            user_id: leaveRequest?.user_id?.toString() || '',
            leave_type_id: leaveRequest?.leave_type_id?.toString() || '',
            leave_status_id: leaveRequest?.leave_status_id?.toString() || '',
            start_date: leaveRequest?.start_date || '',
            end_date: leaveRequest?.end_date || '',
            days_requested: leaveRequest?.days_requested || '',
            dates: '', // Dummy field for backend overlap validation errors
            date_received: leaveRequest?.date_received || '',
            date_approved: leaveRequest?.date_approved || '',
            approved_by_id: leaveRequest?.approved_by_id?.toString() || '',
            leave_details: leaveRequest?.leave_details || '',
            commutation_requested: leaveRequest?.commutation_requested || false,
            is_filed: leaveRequest?.is_filed || false,
            notes: leaveRequest?.notes || '',
            attachment_urls: leaveRequest?.attachment_urls || [''],
            specific_dates: leaveRequest?.specific_dates || [],
            salary: leaveRequest?.salary || '',
            date_filed: leaveRequest?.date_filed || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }),
            days_with_pay: leaveRequest?.days_with_pay || '',
            days_without_pay: leaveRequest?.days_without_pay || '',
            others_pay_remarks: leaveRequest?.others_pay_remarks || '',
            approved_by_official: leaveRequest?.approved_by_official || '',
            leave_detail_type: leaveRequest?.leave_detail_type || '',
            leave_detail_remarks: leaveRequest?.leave_detail_remarks || '',
            vl_balance_at_filing: leaveRequest?.vl_balance_at_filing || '',
            sl_balance_at_filing: leaveRequest?.sl_balance_at_filing || '',
            has_attachments: leaveRequest?.has_attachments || false,
            supporting_documents:
                leaveRequest?.supporting_documents || ([] as string[]),
            maternity_allocation_details:
                leaveRequest?.maternity_allocation_details || '',
        },
    );

    const [dateMode, setDateMode] = useState<'range' | 'specific'>(
        leaveRequest?.specific_dates && leaveRequest.specific_dates.length > 0
            ? 'specific'
            : 'range',
    );
    const [userCredits, setUserCredits] = useState<any[]>([]);
    const http = useHttp();

    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const lastFetched = useRef<string | null>(null);
    const sessionUploadedUrls = useRef<string[]>([]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            const urlsToDelete = sessionUploadedUrls.current;

            if (urlsToDelete.length > 0) {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                urlsToDelete.forEach((url) => {
                    fetch('/leave/delete-attachment', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({ url }),
                        keepalive: true,
                    });
                });
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Clean up files on component unmount (e.g. Cancel button clicked)
            const urlsToDelete = sessionUploadedUrls.current;

            if (urlsToDelete.length > 0) {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                urlsToDelete.forEach((url) => {
                    fetch('/leave/delete-attachment', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({ url }),
                    }).catch(err => console.error('Failed to clean up attachment on unmount:', err));
                });
            }
        };
    }, []);

    useEffect(() => {
        if (!data.user_id) {
            lastFetched.current = null;

            return;
        }

        // Use start_date year, or date_filed year, or current year
        const year = data.start_date
            ? new Date(data.start_date).getFullYear()
            : data.date_filed
              ? new Date(data.date_filed).getFullYear()
              : new Date().getFullYear();

        const fetchKey = `${data.user_id}-${year}`;

        if (lastFetched.current === fetchKey) {
            return;
        }

        lastFetched.current = fetchKey;

        const route = LeaveRoutes.credits.show(
            { user: data.user_id },
            { query: { year } },
        );

        http.submit(route)
            .then((res: any) => {
                const credits =
                    res?.credits ?? res?.data?.credits ?? res?.data ?? res;

                if (Array.isArray(credits)) {
                    setUserCredits(credits);
                } else if (
                    credits &&
                    typeof credits === 'object' &&
                    credits.credits
                ) {
                    setUserCredits(credits.credits);
                }
            })
            .catch((err) => {
                console.error('Failed to fetch credits:', err);
                lastFetched.current = null;
            });
    }, [data.user_id, data.start_date, data.date_filed, http]);

    const currentCredit = Array.isArray(userCredits)
        ? userCredits.find(
              (c) =>
                  c.user_id?.toString() === data.user_id &&
                  c.leave_type_id?.toString() === data.leave_type_id,
          )
        : null;

    const available = currentCredit ? parseFloat(currentCredit.balance) : 0;
    const requested = parseFloat(data.days_requested) || 0;
    const remaining = available - requested;

    const holidayDates = useMemo(() => {
        return (holidays || []).map((h: any) => h.date);
    }, [holidays]);

    const calculatedDays = useMemo(() => {
        if (dateMode === 'range') {
            const start = parseLocalDate(data.start_date);
            const end = parseLocalDate(data.end_date);

            if (!start || !end || end < start) {
                return '';
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            let count = 0;
            const tempDate = new Date(start);

            for (let i = 0; i < diffDays; i++) {
                const day = tempDate.getDay();

                const yyyy = tempDate.getFullYear();
                const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
                const dd = String(tempDate.getDate()).padStart(2, '0');
                const dateString = `${yyyy}-${mm}-${dd}`;

                if (
                    day !== 0 &&
                    day !== 6 &&
                    !holidayDates.includes(dateString)
                ) {
                    count++;
                }

                tempDate.setDate(tempDate.getDate() + 1);
            }

            return count.toString();
        } else {
            if (!data.specific_dates || data.specific_dates.length === 0) {
                return '';
            }

            return data.specific_dates
                .filter((d: string) => {
                    const date = parseLocalDate(d);
                    const day = date?.getDay();

                    return day !== 0 && day !== 6 && !holidayDates.includes(d);
                })
                .length.toString();
        }
    }, [
        data.start_date,
        data.end_date,
        data.specific_dates,
        dateMode,
        holidayDates,
    ]);

    const lastAutoCalc = useRef(calculatedDays);

    useEffect(() => {
        if (
            calculatedDays !== '' &&
            (calculatedDays !== lastAutoCalc.current || available !== undefined)
        ) {
            const requestedNum = parseFloat(calculatedDays) || 0;
            const withPay = Math.min(requestedNum, available);
            const withoutPay = Math.max(0, requestedNum - withPay);

            setData((prev: any) => ({
                ...prev,
                days_requested: calculatedDays,
                days_with_pay: withPay > 0 ? withPay.toString() : '0',
                days_without_pay: withoutPay > 0 ? withoutPay.toString() : '0',
            }));
            lastAutoCalc.current = calculatedDays;
        }
    }, [calculatedDays, available, setData]);

    const toggleDateMode = (mode: 'range' | 'specific') => {
        setDateMode(mode);

        if (mode === 'range') {
            setData('specific_dates', []);
        } else {
            setData('start_date', '');
            setData('end_date', '');
        }
    };

    const selectedLeaveType = leaveTypes.find(
        (t: any) => t.id.toString() === data.leave_type_id,
    );
    const typeName = selectedLeaveType?.name?.toLowerCase() || '';

    const detailsOptions = getDetailsOptions(typeName);
    const supportingDocsOptions = getSupportingDocsOptions(
        typeName,
        data.days_requested,
    );

    const { category, specify } = getDetailsParts(data.leave_details);

    const updateDetails = (newCategory: string, newSpecify: string) => {
        const newValue =
            newSpecify && newSpecify.trim() !== ''
                ? `${newCategory}: ${newSpecify}`
                : newCategory;

        if (data.leave_details !== newValue) {
            setData((prev: any) => ({
                ...prev,
                leave_details: newValue,
                leave_detail_type: newCategory,
                leave_detail_remarks: newSpecify,
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

    const specifyPlaceholder =
        typeName.includes('sick') || typeName.includes('women')
            ? 'Specify Illness...'
            : typeName.includes('vacation')
              ? 'Specify Location...'
              : 'Specify details...';

    const hideSpecify = [
        'Monetization of Leave Credits',
        'Terminal Leave',
        "Completion of Master's Degree",
        'BAR/Board Examination Review',
    ].includes(category);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        transform((data) => {
            let transformed = {
                ...data,
                attachment_urls: data.attachment_urls
                    .filter((url: string) => url.trim() !== '')
                    .map((url: string) => {
                        const trimmed = url.trim();

                        if (
                            trimmed &&
                            !/^https?:\/\//i.test(trimmed) &&
                            trimmed.includes('.')
                        ) {
                            return `https://${trimmed}`;
                        }

                        return trimmed;
                    }),
            };

            if (
                dateMode === 'range' &&
                data.start_date === data.end_date &&
                data.start_date
            ) {
                transformed = {
                    ...transformed,
                    specific_dates: [data.start_date],
                    start_date: '',
                    end_date: '',
                };
            }

            return transformed;
        });

        if (isEdit) {
            put(LeaveRoutes.update({ leaveRequest: leaveRequest.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    sessionUploadedUrls.current = [];
                    toast.success('Leave request updated successfully');
                    router.clearHistory();
                },
            });
        } else {
            post(LeaveRoutes.store().url, {
                onSuccess: () => {
                    sessionUploadedUrls.current = [];
                    toast.success('Leave request created successfully');
                    router.clearHistory();
                },
            });
        }
    };

    return (
        <>
            <Head
                title={isEdit ? 'Edit Leave Request' : 'Encode Leave Request'}
            />
            <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
                <PageHeader
                    title={
                        isEdit ? 'Edit Leave Request' : 'Encode Leave Request'
                    }
                    description="CS Form No. 6 digitizer."
                />

                <LeaveNavigation />

                <div className="matte-card elev-2">
                    <form
                        onSubmit={submit}
                        className="space-y-6 p-6"
                        noValidate
                    >
                        {Object.keys(errors).length > 0 && (
                            <Alert
                                variant="destructive"
                                className="animate-in duration-300 fade-in slide-in-from-top-2"
                            >
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Error</AlertTitle>
                                <AlertDescription>
                                    Please check the form for missing or invalid
                                    fields (e.g. invalid URLs or mandatory
                                    documents).
                                </AlertDescription>
                            </Alert>
                        )}

                        <EmployeeSection
                            users={users}
                            data={data}
                            errors={errors}
                            setData={setData}
                        />

                        <LeaveTypeSection
                            leaveTypes={leaveTypes}
                            data={data}
                            errors={errors}
                            setData={setData}
                            handleLeaveTypeChange={handleLeaveTypeChange}
                            isEdit={isEdit}
                            available={available}
                            requested={requested}
                            remaining={remaining}
                            typeName={typeName}
                            selectedLeaveType={selectedLeaveType}
                        />

                        <DetailsSection
                            category={category}
                            specify={specify}
                            updateDetails={updateDetails}
                            mounted={mounted}
                            typeName={typeName}
                            detailsOptions={detailsOptions}
                            specifyPlaceholder={specifyPlaceholder}
                            hideSpecify={hideSpecify}
                        />

                        <DateSection
                            dateMode={dateMode}
                            toggleDateMode={toggleDateMode}
                            data={data}
                            errors={errors}
                            setData={setData}
                        />

                        <ApprovalSection
                            users={users}
                            data={data}
                            errors={errors}
                            setData={setData}
                        />

                        <StatusSection
                            leaveStatuses={leaveStatuses}
                            data={data}
                            errors={errors}
                            setData={setData}
                            sessionUploadedUrls={sessionUploadedUrls}
                        />

                        <SupportingDocsSection
                            typeName={typeName}
                            data={data}
                            errors={errors}
                            setData={setData}
                            supportingDocsOptions={supportingDocsOptions}
                        />

                        <div className="space-y-2">
                            <Label
                                htmlFor="notes"
                                className="text-sm font-medium"
                            >
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) =>
                                    setData('notes', e.target.value)
                                }
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isEdit ? 'Update Request' : 'Save Request'}
                            </Button>
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
