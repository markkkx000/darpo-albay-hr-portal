import { router } from '@inertiajs/react';
import { User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ViewActionButton, EditActionButton, DeleteActionButton, RestoreActionButton } from '@/components/ActionButtons';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { show as showRoute, edit as editRoute, destroy as destroyRoute, restore as restoreRoute } from '@/routes/personnel';

interface User {
    id: number;
    employee_number: string | null;
    first_name: string;
    last_name: string;
    email: string | null;
    division?: { name: string };
    unit?: { name: string };
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
    const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
    const [employeeToRestore, setEmployeeToRestore] = useState<User | null>(null);

    const formatDate = (date: string | null) => {
        if (!date) {
return 'N/A';
}

        return new Date(date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const handleDelete = () => {
        if (employeeToDelete) {
            router.delete(destroyRoute({ user: employeeToDelete.id }).url, {
                onSuccess: () => {
                    toast.success('Employee archived successfully');
                    setEmployeeToDelete(null);
                },
                onError: () => {
                    toast.error('Failed to archive employee');
                    setEmployeeToDelete(null);
                },
            });
        }
    };

    const handleRestore = () => {
        if (employeeToRestore) {
            router.post(restoreRoute({ id: employeeToRestore.id }).url, {}, {
                onSuccess: () => {
                    toast.success('Employee restored successfully');
                    setEmployeeToRestore(null);
                },
                onError: () => {
                    toast.error('Failed to restore employee');
                    setEmployeeToRestore(null);
                },
            });
        }
    };

    const fullName = (emp: User) => `${emp.first_name} ${emp.last_name}`;

    return (
        <>
            <div className="matte-card elev-2 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 font-bold tracking-widest border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4">Div / Unit / Position</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Hire Date</th>
                                {isArchivedView && <th className="px-6 py-4">Deleted At</th>}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isArchivedView ? 6 : 5} className="text-center py-24 text-muted-foreground italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <UserIcon className="h-10 w-10 opacity-10" />
                                            <p>No employee records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((employee) => (
                                    <tr key={employee.id} className="hover:bg-muted/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="sqicon sqicon-green h-10 w-10 !rounded-[10px] flex items-center justify-center font-black text-xs uppercase">
                                                    {(employee.first_name?.[0] || '')}{(employee.last_name?.[0] || '') || <UserIcon className="h-4 w-4" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {employee.first_name || 'Missing'} {employee.last_name || 'Name'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono tracking-tighter">
                                                        {employee.employee_number || 'NO-ID'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm">{employee.division?.name || 'No Division'}</span>
                                                <span className="text-[11px] text-muted-foreground">{employee.unit?.name || 'No Unit'} &bull; {employee.position?.name || 'No Position'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="bg-muted/40 border-border/50 text-[10px] font-bold uppercase px-2 py-0">
                                                {employee.employment_status?.name || 'Unknown'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                            {formatDate(employee.hire_date)}
                                        </td>
                                        {isArchivedView && (
                                            <td className="px-6 py-4 text-destructive font-bold text-xs">
                                                {formatDate(employee.deleted_at)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 sm:opacity-60 group-hover:opacity-100 transition-all duration-300">
                                                {!isArchivedView && (
                                                    <ViewActionButton 
                                                        href={showRoute({ user: employee.id }).url} 
                                                        title={`View profile for ${fullName(employee)}`} 
                                                    />
                                                )}
                                                
                                                {canEdit && !isArchivedView && (
                                                    <EditActionButton 
                                                        href={editRoute({ user: employee.id }).url} 
                                                        title={`Edit record for ${fullName(employee)}`} 
                                                    />
                                                )}
 
                                                {canDelete && !isArchivedView && (
                                                    <DeleteActionButton 
                                                        onClick={() => setEmployeeToDelete(employee)} 
                                                        title={`Archive ${fullName(employee)}`} 
                                                    />
                                                )}
 
                                                {canRestore && isArchivedView && (
                                                    <RestoreActionButton 
                                                        onClick={() => setEmployeeToRestore(employee)} 
                                                        title={`Restore ${fullName(employee)}`} 
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-border/40 bg-muted/20">
                    <Pagination links={employees.links} meta={employees} />
                </div>
            </div>

            {/* Archive Confirmation Dialog */}
            <Dialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Employee?</DialogTitle>
                        <DialogDescription>
                            This will archive <strong>{employeeToDelete ? fullName(employeeToDelete) : ''}</strong>. 
                            Their record will be hidden from the active directory but can be restored by an HR Admin or Super Admin.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEmployeeToDelete(null)} className="btn-ghost-specular px-6 border-none">Cancel</Button>
                        <Button onClick={handleDelete} className="btn-ghost-danger-specular px-6 border-none">Archive Employee</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Restore Confirmation Dialog */}
            <Dialog open={!!employeeToRestore} onOpenChange={(open) => !open && setEmployeeToRestore(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Restore Employee?</DialogTitle>
                        <DialogDescription>
                            This will restore <strong>{employeeToRestore ? fullName(employeeToRestore) : ''}</strong> to the active personnel directory.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEmployeeToRestore(null)} className="btn-ghost-specular px-6 border-none">Cancel</Button>
                        <Button onClick={handleRestore} className="btn-ghost-specular px-6 border-none">Restore Employee</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
