import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LeaveNavigation from './Components/LeaveNavigation';
import { Pagination } from '@/components/Pagination';
import { EmployeeSearch } from '@/components/EmployeeSearch';


export default function LeaveCredits({ users, leaveTypes, currentYear, allEmployees, filters }: any) {
    const [year, setYear] = useState(currentYear);

    const handleUpdate = (userId: number, typeId: number, earned: string, used: string) => {
        router.put('/leave/credits', {
            user_id: userId,
            leave_type_id: typeId,
            year: year,
            earned: parseFloat(earned) || 0,
            used: parseFloat(used) || 0,
        }, { preserveScroll: true });
    };

    // Filter to only show common types that have credits typically tracked (e.g. Vacation, Sick)
    // For now we just show the first 3 or specific ones.
    const trackedTypes = leaveTypes.filter((t: any) => ['Vacation Leave', 'Sick Leave', 'Special Privilege Leave'].includes(t.name));

    return (
        <>
            <Head title="Leave Credits" />
            <div className="container mx-auto py-6 max-w-7xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Leave Credits</h1>
                    <p className="text-muted-foreground">Manage leave credits balances.</p>
                </div>

                <LeaveNavigation />

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <Input 
                                type="number" 
                                value={year} 
                                onChange={(e) => setYear(Number(e.target.value))} 
                                className="w-24"
                            />
                            <Button variant="outline" onClick={() => router.get('/leave/credits', { year, search: filters?.search })}>
                                Filter Year
                            </Button>
                        </div>
                        <EmployeeSearch 
                            users={allEmployees} 
                            selectedId={filters?.search} 
                            route="/leave/credits"
                            params={{ year }}
                        />
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left font-medium text-muted-foreground">Employee</th>
                                    {trackedTypes.map((type: any) => (
                                        <th key={type.id} className="h-12 px-4 text-center font-medium text-muted-foreground">
                                            {type.name} (Earned / Used)
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user: any) => (
                                    <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 font-medium">
                                            {user.first_name} {user.last_name}
                                            <div className="text-xs text-muted-foreground">{user.employee_number}</div>
                                        </td>
                                        {trackedTypes.map((type: any) => {
                                            const credit = user.leave_credits?.find((c: any) => c.leave_type_id === type.id);

                                            return (
                                                <td key={type.id} className="p-4 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <Input 
                                                            type="number" 
                                                            step="0.001"
                                                            className="w-20 h-8" 
                                                            defaultValue={credit?.earned || 0}
                                                            onBlur={(e) => handleUpdate(user.id, type.id, e.target.value, String(credit?.used || 0))}
                                                        />
                                                        <span>/</span>
                                                        <Input 
                                                            type="number" 
                                                            step="0.001"
                                                            className="w-20 h-8" 
                                                            defaultValue={credit?.used || 0}
                                                            onBlur={(e) => handleUpdate(user.id, type.id, String(credit?.earned || 0), e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
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

LeaveCredits.layout = {
    breadcrumbs: [
        { title: 'Leave Tracking', href: '/leave' },
        { title: 'Credits', href: '/leave/credits' },
    ],
};
