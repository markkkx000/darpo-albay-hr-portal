import { router, useHttp } from '@inertiajs/react';
import { User as UserIcon, Key, RefreshCcw, Copy, Check } from 'lucide-react';
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
    const [newPassword, setNewPassword] = useState<string | null>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [copied, setCopied] = useState(false);

    const http = useHttp();

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

        setIsResetting(true);
        http.post(resetPasswordRoute({ user: employeeToReset.id }).url, {
            onSuccess: (response: any) => {
                setNewPassword(response.new_password);
                toast.success('Password reset successfully');
            },
            onError: () => {
                toast.error('Failed to reset password');
            },
            onFinish: () => {
                setIsResetting(false);
                setEmployeeToReset(null);
            }
        });
    };

    const copyToClipboard = async () => {
        if (!newPassword) {
            return;
        }

        const onCopySuccess = () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Password copied to clipboard');
        };

        try {
            // Priority 1: Modern Clipboard API (Requires HTTPS or Localhost)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(newPassword);
                onCopySuccess();

                return;
            }

            // Priority 2: Fallback to execCommand (Works in HTTP)
            const textArea = document.createElement("textarea");
            textArea.value = newPassword;
            
            // Styling to ensure it's not visible but exists in DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            textArea.style.opacity = "0";
            textArea.setAttribute('readonly', ''); // Prevents keyboard popup on mobile
            
            document.body.appendChild(textArea);
            
            // Selection logic
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, 99999); // For mobile compatibility

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                onCopySuccess();
            } else {
                throw new Error('execCommand was unsuccessful');
            }
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            toast.error('Could not copy automatically. Please select the password manually.');
        }
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
                                                <div className="sqicon sqicon-green h-10 w-10 !rounded-[10px] flex items-center justify-center font-black text-xs uppercase">
                                                    {(employee.first_name?.[0] || '')}{(employee.last_name?.[0] || '') || <UserIcon className="h-4 w-4" />}
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

                                                    if (name.includes('co-terminous') || name.includes('coterminous') || name.includes('co terminous')) {
                                                        return 'status-badge-coterminous';
                                                    }

                                                    if (name.includes('contractual')) {
                                                        return 'status-badge-contractual';
                                                    }

                                                    if (name.includes('casual')) {
                                                        return 'status-badge-casual';
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

            {/* Reset Password Confirmation Dialog */}
            <Dialog open={!!employeeToReset} onOpenChange={(open) => !open && setEmployeeToReset(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password?</DialogTitle>
                        <DialogDescription>
                            This will reset the password for <strong>{employeeToReset ? fullName(employeeToReset) : ''}</strong> to a randomly generated string.
                            You will be shown the new password once the reset is complete.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEmployeeToReset(null)} disabled={isResetting} className="btn-ghost-specular px-6 border-none">Cancel</Button>
                        <Button onClick={handleResetPassword} disabled={isResetting} className="btn-ghost-specular px-6 border-none gap-2 text-amber-600 hover:text-black group">
                            {isResetting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />}
                            Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal with New Password */}
            <Dialog open={!!newPassword} onOpenChange={(open) => !open && setNewPassword(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            Password Reset Successful
                        </DialogTitle>
                        <DialogDescription>
                            The new temporary password has been generated. Please provide this to the employee.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-full p-6 bg-muted/50 rounded-2xl border border-dashed border-primary/20 flex flex-col items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Temporary Password</span>
                            <code className="text-3xl font-mono font-black tracking-widest text-foreground select-all">
                                {newPassword}
                            </code>
                        </div>
                        <Button 
                            variant="outline" 
                            className="w-full gap-2 rounded-xl h-12" 
                            onClick={copyToClipboard}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copied!' : 'Copy Password'}
                        </Button>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setNewPassword(null)} className="btn-specular w-full rounded-xl h-12 border-none">
                            Got it, I've saved the password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
