import { Head, router } from '@inertiajs/react';
import { ChevronRight, Filter, Settings2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
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
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import LeaveRoutes from '@/routes/leave';
import CreditDetailSheet from './Components/CreditDetailSheet';
import LeaveNavigation from './Components/LeaveNavigation';

export default function LeaveCredits({
    users,
    personalCredits,
    leaveTypes,
    currentYear,
    allEmployees,
    filters,
    canManageCredits
}: any) {
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
            .filter((t: any) => ['Vacation Leave', 'Sick Leave'].includes(t.name))
            .map((t: any) => t.id);
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem('leave_credits_visible_types', JSON.stringify(selectedTypeIds));
    }, [selectedTypeIds]);

    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        router.get(LeaveRoutes.credits.index().url, { year: newYear, search: filters?.search }, { preserveState: true });
    };

    const handleViewDetails = (user: any) => {
        setSelectedUserId(user.id);
        setIsSheetOpen(true);
    };

    const selectedUser = useMemo(() =>
        users?.data?.find((u: any) => u.id === selectedUserId),
        [users, selectedUserId]
    );

    const trackedTypes = leaveTypes.filter((t: any) =>
        selectedTypeIds.includes(t.id)
    );

    const toggleType = (id: number) => {
        setSelectedTypeIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <>
            <Head title="Leave Credits" />
            <div className="w-full p-4 md:p-6">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="t-title">Leave Credits</h1>
                        <p className="text-muted-foreground">
                            {canManageCredits
                                ? 'Manage leave credits balances for all employees.'
                                : 'View your available, used, and total leave credits.'
                            }
                        </p>
                    </div>
                </div>

                <LeaveNavigation />

                {canManageCredits ? (
                    /* HR VIEW: Master-Detail List */
                    <div className="matte-card elev-2 overflow-hidden">
                        <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={year}
                                        onChange={(e) => handleYearChange(Number(e.target.value))}
                                        className="w-24 pl-8"
                                    />
                                    <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">Fiscal Year</span>
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


                        <div className="p-0">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="h-12 px-6 text-left font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Employee</th>
                                            <th className="h-12 px-6 text-left font-bold text-muted-foreground uppercase tracking-wider text-[11px]">
                                                <div className="flex items-center gap-2">
                                                    <span>Available Balances</span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                                                <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-56">
                                                            <DropdownMenuLabel>Display Leave Types</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {leaveTypes.map((type: any) => (
                                                                <DropdownMenuCheckboxItem
                                                                    key={type.id}
                                                                    checked={selectedTypeIds.includes(type.id)}
                                                                    onCheckedChange={() => toggleType(type.id)}
                                                                >
                                                                    {type.name}
                                                                </DropdownMenuCheckboxItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </th>
                                            <th className="h-12 px-6 text-right font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {users.data.map((user: any) => (
                                            <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-base">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{user.employee_number}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {trackedTypes.map((type: any) => {
                                                            const credit = user.leave_credits?.find((c: any) => c.leave_type_id === type.id);
                                                            const balance = parseFloat(credit?.balance || '0');

                                                            return (
                                                                <Badge
                                                                    key={type.id}
                                                                    variant="outline"
                                                                    className="px-2 py-1 bg-surface-2 border-border/50 font-bold"
                                                                >
                                                                    <span
                                                                        className="mr-1.5 h-1.5 w-1.5 rounded-full inline-block"
                                                                        style={{ backgroundColor: type.color_code }}
                                                                    />
                                                                    <span className="text-muted-foreground mr-1 uppercase text-[10px]">{type.name}:</span>
                                                                    <span className="text-foreground">{balance.toFixed(2)}</span>
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(user)}
                                                        className="btn-ghost-specular rounded-full font-bold group/btn text-xs border-none"
                                                    >
                                                        View All
                                                        <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.data.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground italic">
                                                    No employee records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {users.data.length > 0 && (
                            <div className="p-4 border-t bg-muted/10">
                                <Pagination links={users.links} meta={users} />
                            </div>
                        )}
                    </div>
                ) : (
                    /* EMPLOYEE VIEW: Simple Read-Only Table */
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={year}
                                    onChange={(e) => handleYearChange(Number(e.target.value))}
                                    className="w-28 pl-8"
                                />
                                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Select Fiscal Year</span>
                        </div>

                        <div className="matte-card elev-2 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="h-12 px-6 text-left font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Leave Type</th>
                                        <th className="h-12 px-6 text-center font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Available (Balance)</th>
                                        <th className="h-12 px-6 text-center font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Used</th>
                                        <th className="h-12 px-6 text-center font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Total (Earned)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {leaveTypes.map((type: any) => {
                                        const credit = personalCredits?.find((c: any) => c.leave_type_id === type.id);
                                        const balance = parseFloat(credit?.balance || '0');
                                        const used = parseFloat(credit?.used || '0');
                                        const earned = parseFloat(credit?.earned || '0');

                                        return (
                                            <tr key={type.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="h-3 w-3 rounded-full shadow-sm"
                                                            style={{ backgroundColor: type.color_code || '#cbd5e1' }}
                                                        />
                                                        <span className="font-bold text-base">{type.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-lg font-black text-foreground">{balance.toFixed(3)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-lg font-bold text-orange-600">{used.toFixed(3)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-lg font-medium text-muted-foreground">{earned.toFixed(3)}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {leaveTypes.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground italic">
                                                No leave credit data available for this year.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
