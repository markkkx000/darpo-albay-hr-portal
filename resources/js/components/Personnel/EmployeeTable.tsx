import { router } from '@inertiajs/react';
import { User as UserIcon, Key, RefreshCcw, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ViewActionButton, EditActionButton, DeleteActionButton, RestoreActionButton, ActionButton } from '@/components/ActionButtons';
import { Pagination } from '@/components/Pagination';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { show as showRoute, edit as editRoute, destroy as destroyRoute, restore as restoreRoute, resetPassword as resetPasswordRoute } from '@/routes/personnel';

interface User {
    id: number;
    employee_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    email: string | null;
    division?: { name: string };
    unit?: { name: string };
    positions?: Array<{ name: string; pivot: { is_primary: boolean } }>;
    appointment_status?: { name: string };
    hire_date: string | null;
    deleted_at: string | null;
    avatar?: string | null;
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
    canResetPassword?: boolean;
    isArchivedView?: boolean;
}

export function EmployeeTable({
    employees,
    canEdit = false,
    canDelete = false,
    canRestore = false,
    canResetPassword = false,
    isArchivedView = false
}: Props) {
    const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);
    const [employeeToRestore, setEmployeeToRestore] = useState<User | null>(null);
    const [employeeToReset, setEmployeeToReset] = useState<User | null>(null);
    const [resetPasswordValue, setResetPasswordValue] = useState<string>('');
    const [isResetting, setIsResetting] = useState(false);

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

    const handleResetPassword = () => {
        if (!employeeToReset) {
            return;
        }

        if (!resetPasswordValue) {
            toast.error('Please provide a temporary password.');

            return;
        }

        if (resetPasswordValue.length < 8) {
            toast.error('Password must be at least 8 characters.');

            return;
        }

        setIsResetting(true);
        router.post(resetPasswordRoute({ user: employeeToReset.id }).url, {
            password: resetPasswordValue,
        }, {
            onSuccess: () => {
                toast.success('Password reset successfully.');
                setEmployeeToReset(null);
                setResetPasswordValue('');
            },
            onError: () => {
                toast.error('Failed to reset password');
            },
            onFinish: () => {
                setIsResetting(false);
            }
        });
    };

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        setResetPasswordValue(password);
    };

    const fullName = (emp: User) => {
        const middleInitial = emp.middle_name ? ` ${emp.middle_name.charAt(0)}.` : '';

        return `${emp.last_name}, ${emp.first_name}${middleInitial}`;
    };

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
                                                <div className="sqicon h-10 w-10 !rounded-[10px] shrink-0 border border-border/30">
                                                    <img
                                                        src={employee.avatar || '/img/pfp_placeholder.png'}
                                                        alt={fullName(employee)}
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground transition-colors">
                                                        {fullName(employee)}
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
                                                <span className="text-[11px] text-muted-foreground">
                                                    {employee.unit?.name || 'No Unit'} &bull; {
                                                        employee.positions?.length
                                                            ? (employee.positions.find(p => p.pivot?.is_primary)?.name || employee.positions[0].name) + (employee.positions.length > 1 ? ` (+${employee.positions.length - 1})` : '')
                                                            : 'No Position'
                                                    }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                'inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm',
                                                (() => {
                                                    const name = (employee.appointment_status?.name || '').toLowerCase();

                                                    if (name.includes('permanent')) {
                                                        return 'status-badge-permanent';
                                                    }

                                                    if (name.includes('contract') || name.includes('cos')) {
                                                        return 'status-badge-contractual';
                                                    }

                                                    if (name.includes('job order') || name.includes('jo')) {
                                                        return 'status-badge-casual';
                                                    }

                                                    if (name.includes('resigned') || name.includes('retired')) {
                                                        return 'status-badge-warning';
                                                    }

                                                    if (name.includes('awol') || name.includes('terminated')) {
                                                        return 'status-badge-danger';
                                                    }

                                                    return 'status-badge-unknown';
                                                })()
                                            )}>
                                                {employee.appointment_status?.name || 'Unknown'}
                                            </span>
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

                                                {canResetPassword && !isArchivedView && (
                                                    <ActionButton
                                                        onClick={() => setEmployeeToReset(employee)}
                                                        title={`Reset password for ${fullName(employee)}`}
                                                        icon={Key}
                                                        variant="default"
                                                        className="btn-ghost-specular border-none text-amber-600 hover:text-black group"
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
                        <Button variant="ghost-destructive" onClick={handleDelete} className="btn-ghost-danger-specular px-6 border-none">Archive Employee</Button>
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
                        <Button variant="ghost" onClick={handleRestore} className="btn-ghost-specular px-6 border-none">Restore Employee</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Confirmation Dialog */}
            <Dialog open={!!employeeToReset} onOpenChange={(open) => {
                if (!open) {
                    setEmployeeToReset(null);
                    setResetPasswordValue('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Set a new temporary password for <strong>{employeeToReset ? fullName(employeeToReset) : ''}</strong>. Provide this password to the employee so they can log in.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 flex flex-col gap-3">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Temporary password"
                                value={resetPasswordValue}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                className="font-mono"
                            />
                            <Button type="button" variant="outline" onClick={generateRandomPassword} title="Generate random">
                                <Wand2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Must be at least 8 characters long.</p>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => {
                            setEmployeeToReset(null);
                            setResetPasswordValue('');
                        }} disabled={isResetting} className="btn-ghost-specular px-6 border-none">Cancel</Button>
                        <Button variant="ghost" onClick={handleResetPassword} disabled={isResetting || !resetPasswordValue || resetPasswordValue.length < 8} className="btn-ghost-specular px-6 border-none gap-2 text-amber-600 hover:text-black group">
                            {isResetting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />}
                            Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </>
    );
}
