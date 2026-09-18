import { Head, router } from '@inertiajs/react';
import { Key, Shield, ShieldAlert, Trash2, Pencil, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PageHeader from '@/components/page-header';
import { RoleModal } from '@/components/Roles/RoleModal';
import { RolesNavigation } from '@/components/Roles/RolesNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024,
    );

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getVisibleCount = () => {
        // Calculate available space for badges by subtracting the approximate width of the sidebar,
        // paddings, role names, and action buttons (~700px total) from the total window width.
        const availableWidth = windowWidth - 700;

        // Assume an average badge width of 130px
        const count = Math.floor(availableWidth / 130);

        // Ensure we always show at least 1 badge if there are any
        return Math.max(1, count);
    };

    const visibleCount = getVisibleCount();

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
        [
            'super_admin',
            'hr_admin',
            'hr_staff',
            'division_head',
            'employee',
        ].includes(roleName);

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="w-full p-4">
                <PageHeader
                    title="Roles & Permissions"
                    description="Manage system roles and their associated capabilities."
                    actions={
                        <Button
                            onClick={handleCreate}
                            className="btn-specular border-none"
                        >
                            <Plus className="h-4 w-4" />
                            Create Role
                        </Button>
                    }
                />

                <RolesNavigation />

                <div className="flex w-full min-w-0 flex-col gap-3">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className="matte-card elev-1 flex min-w-0 flex-col justify-between gap-4 p-4 lg:flex-row lg:items-center"
                        >
                            <div className="flex min-w-[150px] shrink-0 items-center gap-3">
                                {isProtected(role.name) ? (
                                    <ShieldAlert className="h-5 w-5 shrink-0 text-primary" />
                                ) : (
                                    <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                                )}
                                <div className="truncate font-mono text-base font-bold">
                                    {role.name}
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row lg:items-center lg:border-l lg:border-border lg:pl-4">
                                <div className="flex shrink-0 items-center gap-2">
                                    <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0"
                                    >
                                        {role.permissions?.length || 0} Perms
                                    </Badge>
                                </div>
                                <div className="flex h-6 min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden">
                                    {role.permissions
                                        ?.slice(0, visibleCount)
                                        .map((perm) => (
                                            <Badge
                                                key={perm.id}
                                                variant="outline"
                                                className="bg-background/50 text-[10px] whitespace-nowrap"
                                            >
                                                {perm.name}
                                            </Badge>
                                        ))}
                                    {(role.permissions?.length ?? 0) >
                                        visibleCount && (
                                        <Badge
                                            variant="outline"
                                            className="bg-background/50 text-[10px] whitespace-nowrap"
                                        >
                                            +
                                            {(role.permissions?.length ?? 0) -
                                                visibleCount}{' '}
                                            more
                                        </Badge>
                                    )}
                                    {(!role.permissions ||
                                        role.permissions.length === 0) && (
                                        <span className="text-xs whitespace-nowrap text-muted-foreground italic">
                                            No permissions assigned.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1 pt-2 lg:border-l lg:border-border lg:pt-0 lg:pl-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(role)}
                                    className="btn-ghost-specular h-7 border-none px-2 text-xs"
                                >
                                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                                </Button>
                                {!isProtected(role.name) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(role)}
                                        className="btn-ghost-danger-specular h-7 border-none px-2 text-xs text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="mr-1 h-3.5 w-3.5" />{' '}
                                        Delete
                                    </Button>
                                )}
                            </div>
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

            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the{' '}
                            <span className="font-bold text-foreground capitalize">
                                {roleToDelete?.name?.replaceAll('_', ' ')}
                            </span>{' '}
                            role. Users currently assigned to this role will
                            lose their permissions.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
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
