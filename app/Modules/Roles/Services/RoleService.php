<?php

namespace App\Modules\Roles\Services;

use App\Models\User;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleService
{
    protected array $protectedRoles = [
        'super_admin',
        'hr_admin',
        'hr_staff',
        'division_head',
        'employee',
    ];

    /**
     * Get paginated users with their roles and optional search filters.
     */
    public function getPaginatedUsersWithRoles(?string $search = null)
    {
        return User::with('roles')
            ->when($search, function ($query, $search) {
                $keywords = explode(' ', $search);
                foreach ($keywords as $keyword) {
                    if (empty($keyword)) {
                        continue;
                    }
                    $query->where(function ($q) use ($keyword) {
                        $q->where('first_name', 'like', "%{$keyword}%")
                            ->orWhere('last_name', 'like', "%{$keyword}%")
                            ->orWhere('employee_number', 'like', "%{$keyword}%");
                    });
                }
            })
            ->paginate(15)
            ->withQueryString();
    }

    /**
     * Get all roles for assignment.
     * super_admin can only be assigned by other super_admins.
     */
    public function getAssignableRoles(): Collection
    {
        $user = Auth::user();

        if ($user instanceof User && $user->hasRole('super_admin')) {
            return Role::all();
        }

        return Role::where('name', '!=', 'super_admin')->get();
    }

    /**
     * Get all permissions.
     */
    public function getAllPermissions(): Collection
    {
        return Permission::all();
    }

    /**
     * Create a new role.
     */
    public function createRole(string $name, array $permissions = []): Role
    {
        $role = Role::create(['name' => $name]);
        $role->syncPermissions($permissions);

        return $role;
    }

    /**
     * Update an existing role.
     */
    public function updateRole(Role $role, string $name, array $permissions = []): Role
    {
        if ($this->isProtected($role->name) && $role->name !== $name) {
            throw new DomainException("Core role '{$role->name}' cannot be renamed.");
        }

        $role->name = $name;
        $role->save();
        $role->syncPermissions($permissions);

        return $role;
    }

    /**
     * Delete a role.
     */
    public function deleteRole(Role $role): void
    {
        if ($this->isProtected($role->name)) {
            throw new DomainException("Core role '{$role->name}' cannot be deleted.");
        }

        $role->delete();
    }

    /**
     * Sync a single role to a user.
     */
    public function syncUserRole(User $user, string $roleName): void
    {
        $currentUser = Auth::user();

        if ($roleName === 'super_admin' && (! $currentUser instanceof User || ! $currentUser->hasRole('super_admin'))) {
            throw new DomainException('The super_admin role cannot be assigned via the UI.');
        }

        $user->syncRoles([$roleName]);
    }

    /**
     * Check if a role is protected.
     */
    public function isProtected(string $roleName): bool
    {
        return in_array($roleName, $this->protectedRoles);
    }
}
