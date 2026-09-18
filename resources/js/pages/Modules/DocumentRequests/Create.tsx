import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import DocumentRequestsRoutes from '@/routes/documentrequests';

interface User {
    id: number;
    name: string;
    employee_number: string | null;
}

interface Props {
    users: User[];
}

const DOCUMENT_TYPES = [
    'Service Record',
    'Certificate of Employment (CE)',
    'Certificate of Employment with Compensation (CEC)',
    'Pay Slip',
    'Certificate of Remittance',
    'Certified True Copy of Documents',
    'Other',
];

export default function DocumentRequestsCreate({ users }: Props) {
    const { auth } = usePage<any>().props;
    const isHr = auth.permissions.includes('document_requests.manage');

    const { data, setData, post, processing, errors } = useForm({
        user_id: isHr ? '' : auth.user.id.toString(),
        requests: [] as string[],
        purpose: '',
        specify_remittance: '',
        specify_documents: '',
        specify_other: '',
    });

    const handleCheckboxChange = (type: string, checked: boolean) => {
        setData((prevData) => {
            const newRequests = checked
                ? [...prevData.requests, type]
                : prevData.requests.filter((t) => t !== type);

            const newData = { ...prevData, requests: newRequests };

            if (!checked) {
                if (type === 'Certificate of Remittance') {
                    newData.specify_remittance = '';
                }

                if (type === 'Certified True Copy of Documents') {
                    newData.specify_documents = '';
                }

                if (type === 'Other') {
                    newData.specify_other = '';
                }
            }

            return newData;
        });
    };

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        post(DocumentRequestsRoutes.store().url);
    };

    return (
        <>
            <Head title="New Document Request" />
            <div className="mx-auto w-full max-w-4xl p-4">
                <PageHeader
                    title="New Document Request"
                    description="Request for HR documents such as Service Record, Certificate of Employment, etc."
                    actions={
                        <Button
                            asChild
                            variant="ghost"
                            className="btn-ghost-specular border-none"
                        >
                            <Link href={DocumentRequestsRoutes.index().url}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Queue
                            </Link>
                        </Button>
                    }
                />

                <div className="matte-card elev-2 mt-6">
                    <form onSubmit={submit} className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-lg font-semibold tracking-tight">
                                Employee Information
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="user_id">
                                        Employee{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    {isHr ? (
                                        <EmployeeSearch
                                            users={users as any}
                                            selectedId={data.user_id}
                                            onSelect={(val) =>
                                                setData(
                                                    'user_id',
                                                    val === 'all' ? '' : val,
                                                )
                                            }
                                            returnValue="id"
                                            placeholder="Select Employee..."
                                            error={!!errors.user_id}
                                        />
                                    ) : (
                                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                                            {auth.user.first_name}{' '}
                                            {auth.user.last_name}
                                        </div>
                                    )}
                                    {errors.user_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.user_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-lg font-semibold tracking-tight">
                                Requesting for{' '}
                                <span className="text-destructive">*</span>
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {DOCUMENT_TYPES.map((type) => {
                                    const isSelected =
                                        data.requests.includes(type);

                                    return (
                                        <div
                                            key={type}
                                            className="flex flex-col space-y-3"
                                        >
                                            <Label
                                                htmlFor={`type-${type}`}
                                                className={cn(
                                                    'relative flex cursor-pointer flex-col gap-4 rounded-xl border p-4 shadow-sm transition hover:border-primary/50 hover:bg-muted/50',
                                                    isSelected &&
                                                        'border-primary bg-primary/5 ring-1 ring-primary/20',
                                                )}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`type-${type}`}
                                                        checked={isSelected}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleCheckboxChange(
                                                                type,
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                        className={cn(
                                                            'transition',
                                                        )}
                                                    />
                                                    <span className="leading-tight font-medium">
                                                        {type}
                                                    </span>
                                                </div>
                                            </Label>

                                            {/* Conditional inputs */}
                                            {type ===
                                                'Certificate of Remittance' &&
                                                isSelected && (
                                                    <div className="mt-2 animate-in pl-7 duration-200 fade-in slide-in-from-top-2">
                                                        <Label className="mb-2 block text-sm">
                                                            Specify type of
                                                            remittance{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            placeholder="e.g. PhilHealth, Pag-IBIG..."
                                                            value={
                                                                data.specify_remittance
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'specify_remittance',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                errors.specify_remittance
                                                                    ? 'border-destructive'
                                                                    : ''
                                                            }
                                                        />
                                                        {errors.specify_remittance && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {
                                                                    errors.specify_remittance
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            {type ===
                                                'Certified True Copy of Documents' &&
                                                isSelected && (
                                                    <div className="mt-2 animate-in pl-7 duration-200 fade-in slide-in-from-top-2">
                                                        <Label className="mb-2 block text-sm">
                                                            Specify type of
                                                            Documents{' '}
                                                            <span className="text-destructive">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Input
                                                            placeholder="e.g. Diploma, TOR..."
                                                            value={
                                                                data.specify_documents
                                                            }
                                                            onChange={(e) =>
                                                                setData(
                                                                    'specify_documents',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={
                                                                errors.specify_documents
                                                                    ? 'border-destructive'
                                                                    : ''
                                                            }
                                                        />
                                                        {errors.specify_documents && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {
                                                                    errors.specify_documents
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            {type === 'Other' && isSelected && (
                                                <div className="mt-2 animate-in pl-7 duration-200 fade-in slide-in-from-top-2">
                                                    <Label className="mb-2 block text-sm">
                                                        Please specify{' '}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        placeholder="Enter details..."
                                                        value={
                                                            data.specify_other
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                'specify_other',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className={
                                                            errors.specify_other
                                                                ? 'border-destructive'
                                                                : ''
                                                        }
                                                    />
                                                    {errors.specify_other && (
                                                        <p className="mt-1 text-xs text-destructive">
                                                            {
                                                                errors.specify_other
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {errors.requests && (
                                <p className="text-sm text-destructive">
                                    {errors.requests}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-lg font-semibold tracking-tight">
                                Purpose{' '}
                                <span className="text-destructive">*</span>
                            </h3>

                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Enter the purpose for your request..."
                                    value={data.purpose}
                                    onChange={(e) =>
                                        setData('purpose', e.target.value)
                                    }
                                    className={cn(
                                        'min-h-[100px]',
                                        errors.purpose && 'border-destructive',
                                    )}
                                />
                                {errors.purpose && (
                                    <p className="text-sm text-destructive">
                                        {errors.purpose}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end border-t pt-6">
                            <Button
                                type="submit"
                                size="lg"
                                className="btn-premium px-8"
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
