# Roles and Permissions Management Implementation Plan: GOOD TO GO

Provide a new module for Roles and Permissions management, strictly accessible only by the `super_admin`. This module will allow the super admin to assign a single primary role to existing user accounts, create new custom roles, and assign specific permissions to both new and existing roles.

---

## Proposed Changes

### Database & Seeders
#### [MODIFY] `database/seeders/RoleAndPermissionSeeder.php`
- Add `roles.manage` to the array of permissions.
- Ensure `roles.manage` is synced to the `super_admin` role.

---

### Backend Core
#### [NEW] `app/Modules/Roles/routes.php`
- Define `roles` resource routes (index, store, update, destroy).
- Define user role assignment routes nested under the module prefix: `PUT /roles/users/{user}/assign`.
- Apply `middleware('permission:roles.manage')`.

#### [NEW] `app/Modules/Roles/navigation.php`
- Add the "Roles & Permissions" link to the sidebar, gated by `auth()->user()->can('roles.manage')`.

#### [NEW] `app/Modules/Roles/Controllers/RoleController.php`
- Handles listing roles, fetching all available permissions, and CRUD operations for roles via `RoleService`.

#### [NEW] `app/Modules/Roles/Controllers/UserRoleController.php`
- Handles listing users (paginated, with search) and assigning roles to them via `PUT /roles/users/{user}/assign`.

#### [NEW] `app/Modules/Roles/Services/RoleService.php`
- Business logic for creating roles, syncing permissions securely, and syncing roles to users.
- **Core Role Immutability**: Must define a hardcoded array of protected role names: `['super_admin', 'hr_admin', 'hr_staff', 'department_head', 'employee']`. Any update or destroy call targeting these names must throw a `DomainException` before touching the database.
- **Single Role Enforcement**: `syncUserRole()` must call `$user->syncRoles([$role])` — not `assignRole()` which appends. This ensures the user always has exactly one role.
- **Super Admin Protection**: The `super_admin` role must be excluded from the assignable roles list returned to the frontend. It can only be assigned via the seeder.

#### [NEW] `app/Modules/Roles/Requests/RoleCreateRequest.php` & `RoleUpdateRequest.php`
- Validation for role name uniqueness.
- `RoleUpdateRequest` must enforce core role immutability at the validation level (cannot rename protected roles).

#### [NEW] `app/Modules/Roles/Requests/UserRoleSyncRequest.php`
- Validation to ensure assigned role exists in the database.
- Must validate that only exactly **one** role is submitted.

---

### Frontend Pages

> [!IMPORTANT]
> **Frontend Layout Pattern**: All pages must use fragments (`<>...</>`) and declare breadcrumbs via a static `.layout` property. Never wrap page components in `<AppLayout>`.

#### [NEW] `resources/js/pages/Modules/Roles/RolesNavigation.tsx`
- In-module tab navigation containing "Roles" and "User Assignments" tabs.

#### [NEW] `resources/js/pages/Modules/Roles/RolesIndex.tsx`
- Displays a list of all roles.
- Features a "Create Role" button and a modal to define role name and toggle associated permissions.
- For existing roles, allows editing of permissions (and name, if it's not a core role).

#### [NEW] `resources/js/pages/Modules/Roles/UserRolesIndex.tsx`
- A paginated table of all users utilizing the shared `Pagination.tsx`.
- Integrates the `EmployeeSearch.tsx` component for quick user filtering by name or employee number.
- Includes a column showing the current single role, and an "Edit Role" action button to open a role assignment modal.
- **Reassignment Confirmation**: Explicitly state in the UI that reassigning a role replaces the current one. Add a confirmation: *"This will replace the user's current role of X with Y."*

---

## Verification Plan

### Automated Tests
- Create `tests/Feature/Modules/Roles/RolesManagementTest.php` using Pest.
- Verify `roles.manage` permission properly gates access to routes.
- Verify core roles cannot be deleted or renamed.
- Verify the `super_admin` role cannot be assigned via the UI endpoints.
- Verify user role assignment correctly syncs a single role via Spatie (replaces the old one).
- Run `php artisan test --compact --filter=RolesManagementTest`.

### Manual Verification
- Log in as `super_admin`.
- Navigate to the new "Roles & Permissions" module in the sidebar.
- Create a new role named "Auditor" and assign it `personnel.view` and `attendance.view_own`.
- Switch to the "User Assignments" tab, find an employee, and assign them the "Auditor" role.
- Confirm the UI prompts that the role will be replaced.
- Log in as that employee and verify they can access the personnel module.
