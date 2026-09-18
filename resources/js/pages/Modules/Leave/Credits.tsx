import { Head, router } from '@inertiajs/react';
import { ChevronRight, Settings2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import LeaveRoutes from '@/routes/leave';
import CreditDetailSheet from './Components/CreditDetailSheet';
import LeaveNavigation from './Components/LeaveNavigation';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
    [key: string]: any;
}

interface LeaveType {
    id: number;
    name: string;
    color_code?: string;
}

interface LeaveCredit {
    leave_type_id: number;
    balance: string;
    used: string;
    earned: string;
    [key: string]: any;
}

interface PaginatedUsers {
    data: (User & { leave_credits?: LeaveCredit[] })[];
    links: any[];
    from: number | null;
    to: number | null;
    total: number;
    current_page: number;
    last_page: number;
}

interface Props {
    users: PaginatedUsers;
    personalCredits?: LeaveCredit[];
    leaveTypes: LeaveType[];
    currentYear: number;
    allEmployees: User[];
    filters?: {
        search?: string;
    };
    canManageCredits: boolean;
}

export default function LeaveCredits({
    users,
    personalCredits,
    leaveTypes,
    currentYear,
    allEmployees,
    filters,
    canManageCredits,
}: Props) {
    const [year, setYear] = useState(currentYear);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Visibility state with persistence
    const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        const stored = localStorage.getItem('leave_credits_visible_types');

        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                // Reset on error
            }
        }

        // Default to VL and SL only
        return leaveTypes
            .filter((t: any) =>
                ['Vacation Leave', 'Sick Leave'].includes(t.name),
            )
            .map((t: any) => t.id);
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem(
            'leave_credits_visible_types',
            JSON.stringify(selectedTypeIds),
        );
    }, [selectedTypeIds]);

    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        router.get(
            LeaveRoutes.credits.index().url,
            { year: newYear, search: filters?.search },
            { preserveState: true },
        );
    };

    const handleViewDetails = (user: any) => {
        setSelectedUserId(user.id);
        setIsSheetOpen(true);
    };

    const selectedUser = useMemo(
        () => users?.data?.find((u: any) => u.id === selectedUserId),
        [users, selectedUserId],
    );

    const trackedTypes = leaveTypes.filter((t: any) =>
        selectedTypeIds.includes(t.id),
    );

    const toggleType = (id: number) => {
        setSelectedTypeIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    return (
        <>
            <Head title="Leave Credits" />
            <div className="w-full p-4">
                <PageHeader
                    title="Leave Credits"
                    description={
                        canManageCredits
                            ? 'Manage leave credits balances for all employees.'
                            : 'View your available, used, and total leave credits.'
                    }
                />

                <LeaveNavigation />

                {canManageCredits ? (
                    /* HR VIEW: Master-Detail List */
                    <div className="matte-card elev-2 p-6">
                        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
                            <div className="flex items-center space-x-2">
                                <div className="w-28">
                                    <Select
                                        value={year.toString()}
                                        onValueChange={(v) =>
                                            handleYearChange(parseInt(v))
                                        }
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
                                <span className="text-sm font-medium text-muted-foreground">
                                    Fiscal Year
                                </span>
                            </div>
                            <div className="w-full md:w-96">
                                <EmployeeSearch
                                    users={allEmployees}
                                    selectedId={filters?.search}
                                    route={LeaveRoutes.credits.index().url}
                                    params={{ year }}
                                    placeholder="Search Employee..."
                                    withAllEmployees
                                />
                            </div>
                        </div>

                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b bg-muted/20 transition-colors hover:bg-muted/50">
                                        <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                                            Employee
                                        </th>
                                        <th className="h-12 border-x px-4 text-center font-medium text-muted-foreground">
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Available Balances</span>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 rounded-full hover:bg-muted"
                                                        >
                                                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        className="w-56"
                                                    >
                                                        <DropdownMenuLabel>
                                                            Display Leave Types
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        {leaveTypes.map(
                                                            (type: any) => (
                                                                <DropdownMenuCheckboxItem
                                                                    key={
                                                                        type.id
                                                                    }
                                                                    checked={selectedTypeIds.includes(
                                                                        type.id,
                                                                    )}
                                                                    onCheckedChange={() =>
                                                                        toggleType(
                                                                            type.id,
                                                                        )
                                                                    }
                                                                >
                                                                    {type.name}
                                                                </DropdownMenuCheckboxItem>
                                                            ),
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </th>
                                        <th className="h-12 px-4 text-right font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.map((user: any) => (
                                        <tr
                                            key={user.id}
                                            className="group border-b transition-colors hover:bg-muted/50"
                                        >
                                            <td className="border-r p-4 font-medium">
                                                {user.first_name}{' '}
                                                {user.last_name}
                                                <div className="text-xs text-muted-foreground">
                                                    {user.employee_number}
                                                </div>
                                            </td>
                                            <td className="border-r p-4 text-center">
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {trackedTypes.map(
                                                        (type: any) => {
                                                            const credit =
                                                                user.leave_credits?.find(
                                                                    (c: any) =>
                                                                        c.leave_type_id ===
                                                                        type.id,
                                                                );
                                                            const balance =
                                                                parseFloat(
                                                                    credit?.balance ||
                                                                        '0',
                                                                );

                                                            return (
                                                                <Badge
                                                                    key={
                                                                        type.id
                                                                    }
                                                                    variant="outline"
                                                                    className="border-border/50 bg-surface-2 px-2 py-1 font-bold"
                                                                >
                                                                    <span
                                                                        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                                                                        style={{
                                                                            backgroundColor:
                                                                                type.color_code,
                                                                        }}
                                                                    />
                                                                    <span className="mr-1 text-[10px] text-muted-foreground uppercase">
                                                                        {
                                                                            type.name
                                                                        }
                                                                        :
                                                                    </span>
                                                                    <span className="text-foreground">
                                                                        {balance.toFixed(
                                                                            2,
                                                                        )}
                                                                    </span>
                                                                </Badge>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleViewDetails(user)
                                                    }
                                                    className="btn-ghost-specular group/btn rounded-full border-none text-xs font-bold"
                                                >
                                                    View All
                                                    <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="p-4 py-10 text-center text-muted-foreground italic"
                                            >
                                                No employee records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.data.length > 0 && (
                            <div className="mt-4">
                                <Pagination links={users.links} meta={users} />
                            </div>
                        )}
                    </div>
                ) : (
                    /* EMPLOYEE VIEW: Simple Read-Only Table */
                    <div className="space-y-6">
                        <div className="mb-2 flex items-center space-x-3">
                            <div className="w-28">
                                <Select
                                    value={year.toString()}
                                    onValueChange={(v) =>
                                        handleYearChange(parseInt(v))
                                    }
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
                            <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                                Select Fiscal Year
                            </span>
                        </div>

                        <div className="matte-card elev-2 p-6">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b bg-muted/20 transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 text-left font-medium text-muted-foreground">
                                                Leave Type
                                            </th>
                                            <th className="h-12 border-x px-4 text-center font-medium text-muted-foreground">
                                                Available (Balance)
                                            </th>
                                            <th className="h-12 border-r px-4 text-center font-medium text-muted-foreground">
                                                Used
                                            </th>
                                            <th className="h-12 px-4 text-center font-medium text-muted-foreground">
                                                Total (Earned)
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaveTypes.map((type: any) => {
                                            const credit =
                                                personalCredits?.find(
                                                    (c: any) =>
                                                        c.leave_type_id ===
                                                        type.id,
                                                );
                                            const balance = parseFloat(
                                                credit?.balance || '0',
                                            );
                                            const used = parseFloat(
                                                credit?.used || '0',
                                            );
                                            const earned = parseFloat(
                                                credit?.earned || '0',
                                            );

                                            return (
                                                <tr
                                                    key={type.id}
                                                    className="border-b transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="border-r p-4 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="h-3 w-3 rounded-full shadow-sm"
                                                                style={{
                                                                    backgroundColor:
                                                                        type.color_code ||
                                                                        '#cbd5e1',
                                                                }}
                                                            />
                                                            <span className="text-base font-bold">
                                                                {type.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="border-r p-4 text-center">
                                                        <span className="text-lg font-black text-foreground">
                                                            {balance.toFixed(3)}
                                                        </span>
                                                    </td>
                                                    <td className="border-r p-4 text-center">
                                                        <span className="text-lg font-bold text-orange-600">
                                                            {used.toFixed(3)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="text-lg font-medium text-muted-foreground">
                                                            {earned.toFixed(3)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {leaveTypes.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="p-4 py-10 text-center text-muted-foreground italic"
                                                >
                                                    No leave credit data
                                                    available for this year.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* HR Management Sheet */}
            <CreditDetailSheet
                user={selectedUser}
                leaveTypes={leaveTypes}
                year={year}
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
            />
        </>
    );
}

LeaveCredits.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: LeaveRoutes.index().url },
        { title: 'Credits', href: LeaveRoutes.credits.index().url },
    ],
};
