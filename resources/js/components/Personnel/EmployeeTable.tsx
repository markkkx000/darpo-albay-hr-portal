import { Link, router } from '@inertiajs/react';
import { Edit, Eye, RotateCcw, Trash2, User as UserIcon } from 'lucide-react';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { show as showRoute, edit as editRoute, destroy as destroyRoute, restore as restoreRoute } from '@/routes/personnel';

interface User {
    id: number;
    employee_number: string | null;
    first_name: string;
    last_name: string;
    email: string | null;
    department?: { name: string };
    position?: { name: string };
    employment_status?: { name: string };
    hire_date: string | null;
    deleted_at: string | null;
}

interface Props {
    employees: {
        data: User[];
        links: any[];
        from: number;
        to: number;
        total: number;
        current_page: number;
        last_page: number;
    };
    canEdit?: boolean;
    canDelete?: boolean;
    canRestore?: boolean;
    isArchivedView?: boolean;
}

export function EmployeeTable({ 
    employees, 
    canEdit = false, 
    canDelete = false, 
    canRestore = false,
    isArchivedView = false 
}: Props) {
    const formatDate = (date: string | null) => {
        if (!date) {
return 'N/A';
}

        return new Date(date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to archive this employee?')) {
            router.delete(destroyRoute({ user: id }).url);
        }
    };

    const handleRestore = (id: number) => {
        if (confirm('Restore this employee record?')) {
            router.post(restoreRoute({ id }).url);
        }
    };

    return (
        <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold">
                        <tr>
                            <th className="px-6 py-4 border-b">Employee</th>
                            <th className="px-6 py-4 border-b">Dept / Position</th>
                            <th className="px-6 py-4 border-b">Status</th>
                            <th className="px-6 py-4 border-b">Hire Date</th>
                            {isArchivedView && <th className="px-6 py-4 border-b">Deleted At</th>}
                            <th className="px-6 py-4 border-b text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {employees.data.length === 0 ? (
                            <tr>
                                <td colSpan={isArchivedView ? 6 : 5} className="text-center py-20 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <UserIcon className="h-8 w-8 opacity-20" />
                                        <p>No employees found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            employees.data.map((employee) => (
                                <tr key={employee.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase border border-primary/20">
                                                {(employee.first_name?.[0] || '')}{(employee.last_name?.[0] || '') || <UserIcon className="h-4 w-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    {employee.first_name || 'Missing'} {employee.last_name || 'Name'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {employee.employee_number || 'NO-ID'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{employee.department?.name || 'No Department'}</span>
                                            <span className="text-xs text-muted-foreground">{employee.position?.name || 'No Position'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-muted/30 text-[10px]">
                                            {employee.employment_status?.name || 'Unknown'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {formatDate(employee.hire_date)}
                                    </td>
                                    {isArchivedView && (
                                        <td className="px-6 py-4 text-destructive font-medium">
                                            {formatDate(employee.deleted_at)}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!isArchivedView && (
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    asChild 
                                                    className="h-8 w-px-8 p-2"
                                                >
                                                    <Link href={showRoute({ user: employee.id }).url} title="View Profile">
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            
                                            {canEdit && !isArchivedView && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    asChild
                                                    className="h-8 p-2"
                                                >
                                                    <Link href={editRoute({ user: employee.id }).url} title="Edit Record">
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}

                                            {canDelete && !isArchivedView && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleDelete(employee.id)}
                                                    className="h-8 p-2 text-destructive hover:bg-destructive/10 border-destructive/20"
                                                    title="Archive Record"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {canRestore && isArchivedView && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => handleRestore(employee.id)}
                                                    className="h-8 p-2 text-primary hover:bg-primary/10 border-primary/20"
                                                    title="Restore Record"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20">
                <Pagination links={employees.links} meta={employees} />
            </div>
        </div>
    );
}
