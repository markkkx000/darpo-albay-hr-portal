import { useForm } from '@inertiajs/react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RolesRoutes from '@/routes/roles';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any;
    roles: any[];
}

interface RoleFormData {
    role: string;
    error?: string;
}

export function RoleAssignmentModal({ open, onOpenChange, user, roles }: Props) {
    const currentRole = user?.roles?.[0]?.name || 'No Role';
    
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm<RoleFormData>({
        role: user?.roles?.[0]?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id) {
return;
}
        
        put(RolesRoutes.users.assign(user.id).url, {
            onSuccess: () => onOpenChange(false),
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setData('role', user?.roles?.[0]?.name || '');
            clearErrors();
        } else {
            reset();
        }

        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
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
                        <div className="bg-muted/50 p-4 rounded-lg border border-border/50 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Role</p>
                                <p className="text-sm font-medium capitalize">{currentRole.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">New Role</Label>
                            <Select 
                                value={data.role} 
                                onValueChange={val => setData('role', val)}
                            >
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.name}>
                                            <span className="capitalize">{role.name.replace('_', ' ')}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-sm text-destructive font-medium">{errors.role}</p>}
                        </div>

                        <Alert className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                            <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                                **Reassignment Confirmation**: This will replace the user's current role of <span className="font-bold capitalize">{currentRole.replace('_', ' ')}</span> with <span className="font-bold capitalize">{data.role ? data.role.replace('_', ' ') : '...'}</span>.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing || !data.role || data.role === currentRole}>
                            Update Role
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
