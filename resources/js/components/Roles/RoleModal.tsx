import { useForm } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RolesRoutes from '@/routes/roles';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions?: Permission[];
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: Role | null;
    permissions: Permission[];
}

const PROTECTED_ROLES = ['super_admin', 'hr_admin', 'hr_staff', 'division_head', 'employee'];

interface RoleFormData {
    name: string;
    permissions: string[];
    error?: string;
}

export function RoleModal({ open, onOpenChange, role, permissions }: Props) {
    const isEdit = !!role;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm<RoleFormData>({
        name: role?.name || '',
        permissions: role?.permissions?.map((p) => p.name) || [],
    });

    useEffect(() => {
        if (open) {
            setData({
                name: role?.name || '',
                permissions: role?.permissions?.map((p) => p.name) || [],
            });
            clearErrors();
        } else {
            reset();
        }
    }, [open, role, setData, clearErrors, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(RolesRoutes.update(role.id).url, {
                onSuccess: () => {
                    toast.success('Role updated successfully');
                    onOpenChange(false);
                },
            });
        } else {
            post(RolesRoutes.store().url, {
                onSuccess: () => {
                    toast.success('Role created successfully');
                    onOpenChange(false);
                },
            });
        }
    };

    const togglePermission = (permName: string) => {
        const current = [...data.permissions];
        const index = current.indexOf(permName);

        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(permName);
        }

        setData('permissions', current);
    };

    const isProtected = PROTECTED_ROLES.includes(role?.name ?? '');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col matte-card !fixed elev-3">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update role name and permissions.' : 'Define a new role and its associated permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    {errors.error && (
                        <Alert variant="destructive" className="my-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-6 py-4 overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Role Name</Label>
                            <Input
                                id="role-name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                disabled={isProtected}
                                placeholder="e.g. Content Moderator"
                                className="input-etched"
                            />
                            <InputError message={errors.name} />
                            {isProtected && <p className="text-xs text-muted-foreground">Core role names are immutable.</p>}
                        </div>

                        <div className="space-y-3">
                            <Label>Permissions</Label>
                            <div className="h-[300px] overflow-y-auto border rounded-md p-4 bg-muted/5 space-y-6">
                                {Object.entries(
                                    permissions.reduce((acc, permission) => {
                                        const [module] = permission.name.split('.');

                                        if (!acc[module]) {
acc[module] = [];
}

                                        acc[module].push(permission);

                                        return acc;
                                    }, {} as Record<string, Permission[]>)
                                ).map(([module, perms]) => (
                                    <div key={module} className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                                            {module.replace('_', ' ')}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {perms.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`perm-${permission.id}`}
                                                        checked={data.permissions.includes(permission.name)}
                                                        onCheckedChange={() => togglePermission(permission.name)}
                                                    />
                                                    <label
                                                        htmlFor={`perm-${permission.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        title={permission.name}
                                                    >
                                                        {permission.name.split('.').slice(1).join(' ')}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.permissions} />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 pb-4 border-t mt-auto">
                        <Button type="button" variant="ghost" className="btn-ghost-specular px-6" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="btn-specular border-none px-6">
                            {isEdit ? 'Update Role' : 'Create Role'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
