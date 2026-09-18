import { Head, router } from '@inertiajs/react';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
    [key: string]: any;
}

interface TardinessRecord {
    id: number;
    user_id: number;
    year: number;
    month: number;
    tardiness_count: number;
    undertime_count: number;
    [key: string]: any;
}

interface PaginatedUsers {
    data: (User & { tardiness_records?: TardinessRecord[] })[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    users: PaginatedUsers;
    currentYear: number;
    allEmployees: User[];
    filters?: {
        search?: string;
    };
}

const Counter = ({
    value,
    onChange,
}: {
    value: number;
    onChange: (val: number) => void;
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [isDirty, setIsDirty] = useState(false);
    const debouncedValue = useDebounce(localValue, 500);
    const pendingValueRef = useRef<number | null>(null);
    const onChangeRef = useRef(onChange);

    // Keep onChangeRef up to date
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Sync with external value only if we are not currently typing/clicking
    useEffect(() => {
        if (!isDirty) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLocalValue(value);
        }
    }, [value, isDirty]);

    // Clear dirty state when server value catches up
    useEffect(() => {
        if (value === pendingValueRef.current) {
            if (localValue === pendingValueRef.current) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsDirty(false);
            }

            pendingValueRef.current = null;
        } else if (value === localValue) {
            setIsDirty(false);
        }
    }, [value, localValue]);

    // Debounce update
    useEffect(() => {
        if (
            isDirty &&
            debouncedValue === localValue &&
            pendingValueRef.current !== debouncedValue
        ) {
            pendingValueRef.current = debouncedValue;
            onChangeRef.current(debouncedValue);
        }
    }, [debouncedValue, localValue, isDirty]);

    const updateValue = (val: number) => {
        const next = Math.max(0, val);

        if (next !== localValue) {
            setLocalValue(next);
            setIsDirty(true);
        }
    };

    return (
        <div className="flex items-center justify-center space-x-3">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => updateValue(localValue - 1)}
                className="btn-ghost-specular h-9 w-9 rounded-full border-none shadow-sm"
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Input
                type="text"
                inputMode="numeric"
                className="h-9 w-16 rounded-full border-2 border-muted-foreground/20 text-center font-mono font-bold focus:border-primary/50"
                value={localValue}
                onChange={(e) =>
                    updateValue(
                        parseInt(e.target.value.replace(/\D/g, '')) || 0,
                    )
                }
            />
            <Button
                variant="ghost"
                size="icon"
                onClick={() => updateValue(localValue + 1)}
                className="btn-ghost-specular h-9 w-9 rounded-full border-none shadow-sm"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default function LeaveTardiness({
    users,
    currentYear,
    allEmployees,
    filters,
}: Props) {
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const handleUpdate = (
        userId: number,
        field: string,
        value: number,
        record: any,
    ) => {
        const payload = {
            year,
            month,
            tardiness_count: record?.tardiness_count || 0,
            undertime_count: record?.undertime_count || 0,
            [field]: value,
        };

        fetch(LeaveRoutes.tardiness.update({ user_id: userId }).url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        }).then((res) => {
            if (res.ok) {
                toast.success('Record updated successfully');
                router.reload({
                    only: ['users'],
                });
            } else {
                toast.error('Failed to update record');
            }
        });
    };

    return (
        <>
            <Head title="Tardiness Records" />
            <div className="w-full p-4">
                <PageHeader
                    title="Tardiness &amp; Undertime"
                    description="Manage tardiness and undertime records per month."
                />

                <LeaveNavigation />

                <div className="matte-card elev-2 p-6">
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
                        <div className="flex items-center space-x-4">
                            <div className="w-28">
                                <Select
                                    value={year.toString()}
                                    onValueChange={(v) => {
                                        const newYear = parseInt(v);
                                        setYear(newYear);
                                        router.get(
                                            LeaveRoutes.tardiness.index().url,
                                            {
                                                year: newYear,
                                                month,
                                                search: filters?.search,
                                            },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(
                                            { length: 11 },
                                            (_, i) => currentYear - 5 + i,
                                        ).map((y) => (
                                            <SelectItem
                                                key={y}
                                                value={y.toString()}
                                            >
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-40">
                                <Select
                                    value={month.toString()}
                                    onValueChange={(v) => {
                                        setMonth(parseInt(v));
                                        router.get(
                                            LeaveRoutes.tardiness.index().url,
                                            {
                                                year,
                                                month: v,
                                                search: filters?.search,
                                            },
                                            { preserveState: true },
                                        );
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(
                                            { length: 12 },
                                            (_, i) => i + 1,
                                        ).map((m) => (
                                            <SelectItem
                                                key={m}
                                                value={m.toString()}
                                            >
                                                {new Date(
                                                    year,
                                                    m - 1,
                                                ).toLocaleString('default', {
                                                    month: 'long',
                                                })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <EmployeeSearch
                            users={allEmployees}
                            selectedId={filters?.search}
                            route={LeaveRoutes.tardiness.index().url}
                            params={{ year, month }}
                            withAllEmployees
                        />
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b bg-muted/20 transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                                        Employee
                                    </th>
                                    <th className="h-12 border-x px-4 text-center font-medium text-muted-foreground">
                                        Tardiness (Occurrences)
                                    </th>
                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground">
                                        Undertime (Occurrences)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user: any) => {
                                    const record = user.tardiness_records?.find(
                                        (r: any) => r.month === month,
                                    );

                                    return (
                                        <tr
                                            key={user.id}
                                            className="border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="border-r p-4 font-medium">
                                                {user.first_name}{' '}
                                                {user.last_name}
                                                <div className="text-xs text-muted-foreground">
                                                    {user.employee_number}
                                                </div>
                                            </td>
                                            <td className="border-r p-4 text-center">
                                                <Counter
                                                    value={
                                                        record?.tardiness_count ||
                                                        0
                                                    }
                                                    onChange={(val) =>
                                                        handleUpdate(
                                                            user.id,
                                                            'tardiness_count',
                                                            val,
                                                            record,
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <Counter
                                                    value={
                                                        record?.undertime_count ||
                                                        0
                                                    }
                                                    onChange={(val) =>
                                                        handleUpdate(
                                                            user.id,
                                                            'undertime_count',
                                                            val,
                                                            record,
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {users.data.length > 0 && (
                        <div className="mt-4">
                            <Pagination links={users.links} meta={users} />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

LeaveTardiness.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: LeaveRoutes.index().url },
        { title: 'Tardiness', href: LeaveRoutes.tardiness.index().url },
    ],
};
