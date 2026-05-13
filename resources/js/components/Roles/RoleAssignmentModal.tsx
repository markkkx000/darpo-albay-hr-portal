import { useForm } from '@inertiajs/react';
import { AlertCircle, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RolesRoutes from '@/routes/roles';

interface Role {
    id: number;
    name: string;
}

interface UserRecord {
    id: number;
    first_name: string;
    last_name: string;
    roles?: Role[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: UserRecord | null;
    roles: Role[];
    onSuccess?: () => void;
}

interface RoleFormData {
    role: string;
    error?: string;
}

export function RoleAssignmentModal({ open, onOpenChange, user, roles, onSuccess }: Props) {
    const currentRole = user?.roles?.[0]?.name || 'No Role';
    const [showSuperAdminConfirm, setShowSuperAdminConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm<RoleFormData>({
        role: user?.roles?.[0]?.name || '',
    });

    const executeAssignment = () => {
        if (!user?.id) {
            return;
        }

        put(RolesRoutes.users.assign(user.id).url, {
            onSuccess: () => {
                toast.success('User role updated successfully');
                onSuccess?.();
                onOpenChange(false);
                setShowSuperAdminConfirm(false);
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.role === 'super_admin') {
            setShowSuperAdminConfirm(true);
        } else {
            executeAssignment();
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setData('role', user?.roles?.[0]?.name || '');
            clearErrors();
        } else {
            reset();
            setShowSuperAdminConfirm(false);
        }

        onOpenChange(isOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[425px] matte-card !fixed elev-3">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Assign Role</DialogTitle>
                            <DialogDescription>
                                Assign a primary role to <span className="font-bold text-foreground">{user?.first_name} {user?.last_name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        {errors.error && (
                            <Alert variant="destructive" className="my-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4 py-4">
                            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 flex items-start gap-3">
                                <ShieldAlert className="h-5 w-5 text-warning mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Role</p>
                                    <p className="text-sm font-medium capitalize">{currentRole.replaceAll('_', ' ')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assign-role">New Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={val => setData('role', val)}
                                >
                                    <SelectTrigger id="assign-role" className="w-full">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.name}>
                                                <span className="capitalize">{role.name.replaceAll('_', ' ')}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <Alert className="border-border/50 bg-muted/50">
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                <AlertDescription className="text-muted-foreground text-xs">
                                    <p><strong>Reassignment Confirmation:</strong> This will replace the user's current role of <span className="font-bold capitalize">{currentRole.replaceAll('_', ' ')}</span> with <span className="font-bold capitalize">{data.role ? data.role.replaceAll('_', ' ') : '...'}</span>.</p>
                                </AlertDescription>
                            </Alert>
                        </div>

                        <DialogFooter className="pb-4">
                            <Button type="button" variant="ghost" className="btn-ghost-specular px-6" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing || !data.role || data.role === currentRole} className="btn-specular border-none px-6">
                                Update Role
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Super Admin Confirmation Dialog */}
            <Dialog open={showSuperAdminConfirm} onOpenChange={setShowSuperAdminConfirm}>
                <DialogContent className="sm:max-w-[450px] matte-card !fixed elev-4 border-destructive/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <TriangleAlert className="h-5 w-5" />
                            Critical: Super Admin Access
                        </DialogTitle>
                        <DialogDescription className="text-foreground/80 pt-2">
                            You are about to grant <span className="font-bold text-foreground">{user?.first_name} {user?.last_name}</span> the <span className="font-bold text-destructive underline">Super Admin</span> role.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl space-y-3">
                            <div className="flex gap-3">
                                <ShieldCheck className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                                <p className="text-sm font-medium leading-relaxed">
                                    This role provides <span className="font-bold uppercase">full, unrestricted access</span> to every module, all historical HR data, system settings, and permission management.
                                </p>
                            </div>
                            <div className="pl-8 text-xs text-muted-foreground space-y-1">
                                <p>• Access to all sensitive Personnel records</p>
                                <p>• Full control over Leave & Attendance audits</p>
                                <p>• Ability to create or delete other system roles</p>
                                <p>• Bypass all module-level permission checks</p>
                            </div>
                        </div>

                        <p className="text-sm text-center font-semibold text-muted-foreground italic">
                            "Are you absolutely sure you want to proceed with this assignment?"
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowSuperAdminConfirm(false)}
                            disabled={processing}
                            className="btn-ghost-specular px-6"
                        >
                            No, Go Back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeAssignment}
                            disabled={processing}
                            className="bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20 px-8"
                        >
                            Yes, Assign Full Access
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

