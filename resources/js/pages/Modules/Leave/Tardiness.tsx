import { Head, router } from '@inertiajs/react';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Pagination } from '@/components/Pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeaveRoutes from '@/routes/leave';
import LeaveNavigation from './Components/LeaveNavigation';


export default function LeaveTardiness({ users, currentYear, allEmployees, filters }: any) {
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const handleUpdate = (userId: number, field: string, value: number, record: any) => {
        const payload = {
            year,
            month,
            tardiness_count: record?.tardiness_count || 0,
            undertime_count: record?.undertime_count || 0,
            [field]: value,
        };

        router.put(LeaveRoutes.tardiness.update({ user_id: userId }).url, payload, {
            preserveScroll: true,
            onSuccess: () => toast.success('Record updated successfully')
        });
    };

    const Counter = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
        const [localValue, setLocalValue] = useState(value);

        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        return (
            <div className="flex items-center justify-center space-x-3">
                <button
                    type="button"
                    onClick={() => onChange(localValue - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all active:scale-95 shadow-sm"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <Input
                    type="number"
                    className="w-16 text-center h-9 font-mono font-bold rounded-full border-2 border-muted-foreground/20 focus:border-primary/50"
                    value={localValue}
                    onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
                    onBlur={() => {
                        if (localValue !== value) {
                            onChange(localValue);
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={() => onChange(localValue + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all active:scale-95 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        );
    };

    return (
        <>
            <Head title="Tardiness Records" />
            <div className="w-full p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="t-title">Tardiness & Undertime</h1>
                    <p className="text-muted-foreground">Manage tardiness and undertime records per month.</p>
                </div>

                <LeaveNavigation />

                <div className="matte-card elev-2 p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-24">
                                <Input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(Number(e.target.value))}
                                    placeholder="Year"
                                />
                            </div>
                            <div className="w-40">
                                <Select value={month.toString()} onValueChange={(v) => {
                                    setMonth(parseInt(v));
                                    router.get(LeaveRoutes.tardiness.index().url, { year, month: v, search: filters?.search }, { preserveState: true });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <SelectItem key={m} value={m.toString()}>
                                                {new Date(year, m - 1).toLocaleString('default', { month: 'long' })}
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
                                <tr className="border-b transition-colors hover:bg-muted/50 bg-muted/20">
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Employee</th>
                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground border-x">Tardiness (Occurrences)</th>
                                    <th className="h-12 px-4 text-center font-medium text-muted-foreground">Undertime (Occurrences)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user: any) => {
                                    const record = user.tardiness_records?.find((r: any) => r.month === month);

                                    return (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 font-medium border-r">
                                                {user.first_name} {user.last_name}
                                                <div className="text-xs text-muted-foreground">{user.employee_number}</div>
                                            </td>
                                            <td className="p-4 text-center border-r">
                                                <Counter
                                                    value={record?.tardiness_count || 0}
                                                    onChange={(val) => handleUpdate(user.id, 'tardiness_count', val, record)}
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <Counter
                                                    value={record?.undertime_count || 0}
                                                    onChange={(val) => handleUpdate(user.id, 'undertime_count', val, record)}
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
