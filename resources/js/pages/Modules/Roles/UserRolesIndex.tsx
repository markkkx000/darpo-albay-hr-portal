import { Head, router } from '@inertiajs/react';
import { UserCog, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import Heading from '@/components/heading';
import { Pagination } from '@/components/Pagination';
import { RoleAssignmentModal } from '@/components/Roles/RoleAssignmentModal';
import { RolesNavigation } from '@/components/Roles/RolesNavigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import RolesRoutes from '@/routes/roles';

/** Minimal shape for EmployeeSearch autocomplete — loaded eagerly from the controller. */
interface EmployeeSearchUser {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
}

interface Role {
    id: number;
    name: string;
}

interface UserRecord {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    employee_number: string | null;
    roles: Role[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: UserRecord[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    users: PaginatedUsers;
    allUsers: EmployeeSearchUser[];
    roles: Role[];
    filters: {
        search?: string;
    };
}

export default function UserRolesIndex({ users, allUsers, roles, filters }: Props) {
    const [assignmentOpen, setAssignmentOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

    const openAssignment = (user: UserRecord) => {
        setSelectedUser(user);
        setAssignmentOpen(true);
    };

    return (
        <>
            <Head title="User Role Assignments" />

            <div className="p-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <Heading
                        title="User Role Assignments"
                        description="Assign primary roles to individual user accounts."
                    />
                </div>

                <RolesNavigation />

                <Card className="matte-card elev-1 overflow-hidden bg-background">
                    <CardContent className="p-0">
                        <div className="p-4 border-b border-border/50 bg-muted/20">
                            <EmployeeSearch
                                users={allUsers}
                                route={RolesRoutes.users.index().url}
                                placeholder="Search by name or employee number..."
                                selectedId={filters?.search}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-bold">
                                    <tr>
                                        <th className="px-6 py-4 border-b w-[120px]">Emp. No.</th>
                                        <th className="px-6 py-4 border-b">Full Name</th>
                                        <th className="px-6 py-4 border-b">Primary Role</th>
                                        <th className="px-6 py-4 border-b text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-semibold">{user.employee_number || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{user.first_name} {user.last_name}</div>
                                                <div className="text-[10px] text-muted-foreground">{user.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.roles && user.roles.length > 0 ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn(
                                                            "capitalize gap-1 px-3 py-1 text-[10px] rounded-full border-none shadow-sm",
                                                            `badge-${user.roles[0].name.replaceAll('_', '-')}`
                                                        )}
                                                    >
                                                        <ShieldCheck className="h-3 w-3" />
                                                        {user.roles[0].name.replaceAll('_', ' ')}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No role assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openAssignment(user)}
                                                    disabled={user.roles?.some((r) => r.name === 'super_admin')}
                                                    className="gap-2 h-8 px-3 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[image:var(--grad-primary)] hover:text-black hover:shadow-[var(--grad-shadow)] border border-transparent hover:border-transparent rounded-full"
                                                >
                                                    <UserCog className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Edit Role</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="h-48 text-center text-muted-foreground py-10">
                                                <div className="flex flex-col items-center gap-2">
                                                    <UserCog className="h-10 w-10 opacity-10" />
                                                    <p>No users found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-border/50">
                            <Pagination links={users.links} meta={users} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <RoleAssignmentModal
                open={assignmentOpen}
                onOpenChange={(isOpen) => {
                    setAssignmentOpen(isOpen);

                    if (!isOpen) {
                        router.clearHistory();
                    }
                }}
                user={selectedUser}
                roles={roles}
            />
        </>
    );
}

UserRolesIndex.layout = {
    breadcrumbs: [
        { title: 'Roles & Permissions', href: RolesRoutes.index().url },
        { title: 'User Assignments', href: '#' },
    ],
};
