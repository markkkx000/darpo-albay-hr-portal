<?php

namespace App\Modules\Roles\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Collection;
use DomainException;

class RoleService
{
    protected array $protectedRoles = [
        'super_admin',
        'hr_admin',
        'hr_staff',
        'department_head',
        'employee',
    ];

    /**
     * Get all roles except super_admin for assignment.
     */
    public function getAssignableRoles(): Collection
    {
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
        if ($roleName === 'super_admin') {
            throw new DomainException("The super_admin role cannot be assigned via the UI.");
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
