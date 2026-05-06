import { Head, router } from '@inertiajs/react';
import { Key, Shield, ShieldAlert, Trash2, Edit2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import { RoleModal } from '@/components/Roles/RoleModal';
import { RolesNavigation } from '@/components/Roles/RolesNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
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
    roles: Role[];
    permissions: Permission[];
}

export default function RolesIndex({ roles, permissions }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const handleCreate = () => {
        setSelectedRole(null);
        setModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setModalOpen(true);
    };

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!roleToDelete) {
            return;
        }

        router.delete(RolesRoutes.destroy(roleToDelete.id).url, {
            onSuccess: () => {
                toast.success('Role deleted successfully');
                setDeleteConfirmOpen(false);
                router.clearHistory();
            },
        });
    };

    const isProtected = (roleName: string) =>
        ['super_admin', 'hr_admin', 'hr_staff', 'department_head', 'employee'].includes(roleName);

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="p-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <Heading 
                        title="Roles & Permissions"
                        description="Manage system roles and their associated capabilities."
                    />
                    <Button onClick={handleCreate} className="btn-specular gap-2 border-none px-6">
                        <Plus className="h-4 w-4" />
                        Create Role
                    </Button>
                </div>

                <RolesNavigation />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <Card key={role.id} className="matte-card elev-1 hover:elev-2 spring-hover flex flex-col transition-all">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "sqicon shrink-0 h-10 w-10 text-[18px]",
                                            isProtected(role.name) ? "sqicon-green text-white" : "sqicon-dark text-muted-foreground"
                                        )}>
                                            {isProtected(role.name) ? <ShieldAlert className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl capitalize">{role.name.replaceAll('_', ' ')}</CardTitle>
                                            <CardDescription className="text-xs font-mono">{role.name}</CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(role)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        {!isProtected(role.name) && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(role)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <Key className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-semibold">Permissions</span>
                                    <Badge variant="secondary" className="ml-auto">{role.permissions?.length || 0}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1.5 h-full content-start">
                                    {role.permissions?.slice(0, 10).map((perm) => (
                                        <Badge key={perm.id} variant="outline" className="text-[10px] bg-background/50">
                                            {perm.name}
                                        </Badge>
                                    ))}
                                    {(role.permissions?.length ?? 0) > 10 && (
                                        <Badge variant="outline" className="text-[10px] bg-background/50">
                                            +{(role.permissions?.length ?? 0) - 10} more
                                        </Badge>
                                    )}
                                    {(!role.permissions || role.permissions.length === 0) && (
                                        <span className="text-xs text-muted-foreground italic">No permissions assigned.</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <RoleModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                role={selectedRole}
                permissions={permissions}
            />

            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the <span className="font-bold text-foreground capitalize">{roleToDelete?.name?.replaceAll('_', ' ')}</span> role.
                            Users currently assigned to this role will lose their permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Roles & Permissions', href: RolesRoutes.index().url },
        { title: 'Roles', href: '#' },
    ],
};
