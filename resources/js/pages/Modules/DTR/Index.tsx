import { Head, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    Clock,
    Download,
    FileText,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { exportMethod, index as dtrIndexRoute } from '@/routes/dtr/index';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
}

interface Props {
    users: User[];
    isHrAdmin: boolean;
}

export default function Index({ users, isHrAdmin }: Props) {
    const { auth } = usePage().props as any;

    const [data, setData] = useState({
        user_id: auth?.user?.id?.toString() || '',
        month: (new Date().getMonth() + 1).toString(),
        year: new Date().getFullYear().toString(),
        format: 'pdf',
        official_hours_type: 'regular',
        custom_official_hours: '',
    });

    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) =>
        (currentYear - 5 + i).toString(),
    );

    const getXsrfToken = () => {
        const match = document.cookie.match(
            new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'),
        );

        return match ? decodeURIComponent(match[2]) : '';
    };

    // NOTE: This form uses window.fetch() directly (not Inertia's useHttp/router) because
    // the DTR export endpoint returns a binary file blob (PDF/CSV). Inertia's request
    // handling expects JSON or a redirect response and cannot process binary responses
    // for client-side file downloads. Manual XSRF token injection is required.
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        let official_hours = '08:00 AM - 05:00 PM';

        if (data.official_hours_type === 'compressed') {
            official_hours = '07:00 AM - 06:00 PM (Mon-Thu)';
        } else if (data.official_hours_type === 'custom') {
            official_hours =
                data.custom_official_hours || '08:00 AM - 05:00 PM';
        }

        try {
            const response = await window.fetch(exportMethod().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({
                    user_id: data.user_id,
                    month: data.month,
                    year: data.year,
                    format: data.format,
                    official_hours: official_hours,
                }),
            });

            setProcessing(false);

            if (response.status === 422) {
                const errorData = await response.json();
                setErrors(errorData.errors || {});
                toast.error('Please check the form for validation errors.');

                return;
            }

            if (response.status === 403) {
                toast.error('You are not authorized to export this DTR.');

                return;
            }

            if (!response.ok) {
                toast.error(
                    'An error occurred during export. Please try again.',
                );

                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const disposition = response.headers.get('content-disposition');
            let filename = `DTR_${data.year}_${data.month}.${data.format}`;

            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);

                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('DTR exported successfully!');
        } catch {
            setProcessing(false);
            toast.error('An error occurred during export. Please try again.');
        }
    };

    return (
        <>
            <Head title="DTR Export" />

            <div className="animate-fade-up mx-auto w-full max-w-4xl p-4 md:p-8">
                <PageHeader
                    title="Daily Time Record (DTR) Export"
                    description="Export CS Form 48 (Daily Time Record) or raw attendance data for employee records."
                />

                <div className="matte-card elev-2 p-8">
                    <form onSubmit={submit} className="space-y-6" noValidate>
                        {Object.keys(errors).length > 0 && (
                            <Alert
                                variant="destructive"
                                className="animate-in duration-300 fade-in slide-in-from-top-2"
                            >
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Validation Error</AlertTitle>
                                <AlertDescription>
                                    Please check the form for missing or invalid
                                    fields.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-semibold text-foreground">
                                    <UserCheck className="h-4 w-4 text-primary" />
                                    Employee{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                {isHrAdmin ? (
                                    <EmployeeSearch
                                        users={users}
                                        selectedId={data.user_id}
                                        onSelect={(val) =>
                                            setData({
                                                ...data,
                                                user_id:
                                                    val === 'all' ? '' : val,
                                            })
                                        }
                                        placeholder="Search Employee..."
                                        returnValue="id"
                                        error={!!errors.user_id}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-input bg-muted/50 p-3 font-medium text-foreground">
                                        {auth?.user?.first_name}{' '}
                                        {auth?.user?.last_name} (
                                        {auth?.user?.employee_number})
                                    </div>
                                )}
                                {errors.user_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.user_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-semibold text-foreground">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Export Format{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.format}
                                    onValueChange={(val) =>
                                        setData({ ...data, format: val })
                                    }
                                >
                                    <SelectTrigger
                                        aria-invalid={!!errors.format}
                                        className="h-11 w-full rounded-xl"
                                    >
                                        <div className="flex-1 truncate text-left font-medium">
                                            <SelectValue placeholder="Select Format" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem
                                            value="pdf"
                                            className="font-medium"
                                        >
                                            PDF (CS Form 48)
                                        </SelectItem>
                                        <SelectItem
                                            value="csv"
                                            className="font-medium"
                                        >
                                            CSV (Raw Data)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.format && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.format}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-semibold text-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Month{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.month}
                                    onValueChange={(val) =>
                                        setData({ ...data, month: val })
                                    }
                                >
                                    <SelectTrigger
                                        aria-invalid={!!errors.month}
                                        className="h-11 w-full rounded-xl"
                                    >
                                        <div className="flex-1 truncate text-left font-medium">
                                            <SelectValue placeholder="Select Month" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((m) => (
                                            <SelectItem
                                                key={m.value}
                                                value={m.value}
                                                className="font-medium"
                                            >
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.month && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.month}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 font-semibold text-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Year{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.year}
                                    onValueChange={(val) =>
                                        setData({ ...data, year: val })
                                    }
                                >
                                    <SelectTrigger
                                        aria-invalid={!!errors.year}
                                        className="h-11 w-full rounded-xl"
                                    >
                                        <div className="flex-1 truncate text-left font-medium">
                                            <SelectValue placeholder="Select Year" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem
                                                key={y}
                                                value={y}
                                                className="font-medium"
                                            >
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.year && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.year}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="flex items-center gap-2 font-semibold text-foreground">
                                    <Clock className="h-4 w-4 text-primary" />
                                    Official Hours{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Select
                                        value={data.official_hours_type}
                                        onValueChange={(val) =>
                                            setData({
                                                ...data,
                                                official_hours_type: val,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="h-11 w-full rounded-xl">
                                            <div className="flex-1 truncate text-left font-medium">
                                                <SelectValue placeholder="Select Official Hours" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem
                                                value="regular"
                                                className="font-medium"
                                            >
                                                Regular (8:00 AM - 5:00 PM,
                                                Mon-Fri)
                                            </SelectItem>
                                            <SelectItem
                                                value="compressed"
                                                className="font-medium"
                                            >
                                                Compressed (7:00 AM - 6:00 PM,
                                                Mon-Thu)
                                            </SelectItem>
                                            <SelectItem
                                                value="custom"
                                                className="font-medium"
                                            >
                                                Custom Official Hours
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {data.official_hours_type === 'custom' && (
                                        <Input
                                            type="text"
                                            value={data.custom_official_hours}
                                            onChange={(e) =>
                                                setData({
                                                    ...data,
                                                    custom_official_hours:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="e.g. 07:30 AM - 04:30 PM"
                                            className="h-11 rounded-xl font-medium"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t pt-6">
                            <Button
                                type="submit"
                                disabled={processing || !data.user_id}
                                className="flex h-12 items-center gap-2 rounded-full px-8 text-base font-bold tracking-wide shadow-lg transition-all hover:shadow-xl"
                            >
                                <Download className="h-5 w-5" />
                                {processing
                                    ? 'Generating Export...'
                                    : 'Download DTR'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'DTR Export',
            href: dtrIndexRoute().url,
        },
    ],
};
