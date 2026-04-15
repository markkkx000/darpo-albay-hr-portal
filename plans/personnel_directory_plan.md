## Personnel Directory Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Extend the existing User model for full employee CRUD, with soft deletes and restoration UI, allowing HR to manage employee records while preserving historical data. Introduces `departments` and `positions` as structured tables.

---

## Steps

1. Create migration for `departments` table: id, name (unique), is_active (default true), created_at, updated_at. Records must never be hard deleted — use `is_active = false` to deactivate. Seed initial departments relevant to the agency.
2. Create migration for `positions` table: id, name, department_id (foreign key to departments), is_active (default true), created_at, updated_at. Records must never be hard deleted — use `is_active = false` to deactivate.
3. Create migration for `employment_statuses` table: id, name (unique), is_active (default true), created_at, updated_at. Seed initial statuses for Philippine civil service context: Regular, Casual, Contractual, Job Order, Coterminous. Records must never be hard deleted.
4. Create migration to add employee fields to `users` table (if not already present):
   - `position_id` (foreign key to positions, nullable)
   - `department_id` (foreign key to departments, nullable)
   - `employment_status_id` (foreign key to employment_statuses, nullable)
   - `hire_date` (date, nullable)
   - `contact_number` (string, nullable)
   - `address` (text, nullable)
   - Ensure `employee_number` has a unique constraint if not already present.
   - Ensure `deleted_at` (soft deletes) exists on users table.
5. Create Department, Position, and EmploymentStatus models in `app/Modules/Personnel/Models/` with fillable attributes and relationships. No soft deletes — use `is_active` flag instead.
6. Create EmployeeService in `app/Modules/Personnel/Services/EmployeeService.php` for CRUD operations, including soft delete handling, restoration, search, and pagination. Restoration is a first-class operation, not an afterthought.
8. Create form requests in `app/Modules/Personnel/Requests/`:
   - `EmployeeCreateRequest` — required fields, unique employee_number, valid foreign keys for position/department/employment_status
   - `EmployeeUpdateRequest` — same as create but ignores unique constraint for own record
   - `EmployeeRestoreRequest` — validates the target record is soft deleted before restoring
9. Create PersonnelController in `app/Modules/Personnel/Controllers/PersonnelController.php` with index, create, store, show, edit, update, destroy, archived, and restore methods. Keep controller thin — all logic in EmployeeService.
10. Create `routes/personnel.php` with the following routes, protected by auth and permission middleware:
    - Resource routes (index, create, store, show, edit, update, destroy) — guarded by respective permissions
    - GET `/personnel/archived` — guarded by `personnel.view` so `hr_staff` can access archived results read-only
    - POST `/personnel/{id}/restore` — guarded by `personnel.restore` so only `hr_admin` and `super_admin` can restore
11. Register personnel routes in `routes/web.php` via require.
12. Create frontend pages in `resources/js/pages/Modules/Personnel/`:
    - `Index.tsx` — paginated employee list with search and filter by department/status
    - `Create.tsx` — create employee form
    - `Edit.tsx` — pre-filled edit form
    - `Show.tsx` — read-only employee profile with edit/delete buttons if permitted
    - `Archived.tsx` — list of soft deleted employees with Restore button
13. Add reusable components in `resources/js/components/Personnel/`:
    - `EmployeeForm.tsx` — shared form used by Create and Edit pages
    - `EmployeeCard.tsx` — compact employee summary card
    - `EmployeeTable.tsx` — paginated table with search and filters
14. Seed permissions in `RoleAndPermissionSeeder`:
    - `personnel.view` — hr_staff, hr_admin, super_admin
    - `personnel.create` — hr_admin, super_admin
    - `personnel.update` — hr_admin, super_admin
    - `personnel.delete` — super_admin only
    - `personnel.restore` — hr_admin, super_admin
15. Write Pest tests for PersonnelController and EmployeeService, covering:
    - CRUD operations with correct data
    - Unique employee_number validation
    - Soft delete — record excluded from index after deletion
    - Restoration — record reappears in index after restore
    - Permission checks — employees cannot access personnel pages, hr_staff can view but not create/update/delete
    - Search and pagination return correct results
16. Run `vendor/bin/pint --dirty --format agent` on all PHP files.
17. Test frontend with `npm run dev` and verify no Vite errors.

---

## Relevant Files

- `database/migrations/XXXX_XX_XX_XXXXXX_create_departments_table.php`
- `database/migrations/XXXX_XX_XX_XXXXXX_create_positions_table.php`
- `database/migrations/XXXX_XX_XX_XXXXXX_create_employment_statuses_table.php`
- `database/migrations/XXXX_XX_XX_XXXXXX_add_employee_fields_to_users_table.php`
- `app/Modules/Personnel/Models/Department.php`
- `app/Modules/Personnel/Models/Position.php`
- `app/Modules/Personnel/Models/EmploymentStatus.php`
- `app/Modules/Personnel/Services/EmployeeService.php`
- `app/Modules/Personnel/Requests/EmployeeCreateRequest.php`
- `app/Modules/Personnel/Requests/EmployeeUpdateRequest.php`
- `app/Modules/Personnel/Requests/EmployeeRestoreRequest.php`
- `app/Modules/Personnel/Controllers/PersonnelController.php`
- `routes/personnel.php`
- `routes/web.php`
- `resources/js/pages/Modules/Personnel/Index.tsx`
- `resources/js/pages/Modules/Personnel/Create.tsx`
- `resources/js/pages/Modules/Personnel/Edit.tsx`
- `resources/js/pages/Modules/Personnel/Show.tsx`
- `resources/js/pages/Modules/Personnel/Archived.tsx`
- `resources/js/components/Personnel/EmployeeForm.tsx`
- `resources/js/components/Personnel/EmployeeCard.tsx`
- `resources/js/components/Personnel/EmployeeTable.tsx`
- `database/seeders/RoleAndPermissionSeeder.php`
- `tests/Feature/PersonnelTest.php`

---

## Verification

1. Run `php artisan route:list` to confirm all personnel routes are registered including `/personnel/archived` and `/personnel/{id}/restore`.
2. Run `php artisan test --compact --filter=Personnel` — all tests must pass.
3. As `hr_admin`, create a new employee with all fields and verify record appears in index.
4. As `hr_admin`, edit an employee and verify changes are saved.
5. As `hr_admin`, soft delete an employee and verify they disappear from index but appear in `/personnel/archived`.
6. As `hr_admin`, restore a soft deleted employee and verify they reappear in index.
7. As `hr_staff`, verify they can view and search employees but create/edit/delete buttons are hidden or return 403.
8. As `employee` role, verify `/personnel` returns 403.
9. Verify search filters by name, employee_number, department, and employment status work correctly.
10. Verify `departments`, `positions`, and `employment_statuses` are seeded and selectable in the employee form.
11. Verify that deactivating a department (`is_active = false`) hides it from the create/edit form dropdowns but does not break existing employee records referencing it.
12. Verify soft deleted employees are excluded from all other modules (attendance, leave) that reference users.

---

## Decisions

- `departments`, `positions`, and `employment_statuses` are structured tables, not plain string columns, for consistency with Leave module's `leave_types` pattern and to support DTR Export (CS Form 48 requires structured department and position data).
- These lookup tables use `is_active` flag instead of soft deletes — they must never be hard deleted to preserve referential integrity with historical employee records.
- Employment statuses are seeded for Philippine civil service context: Regular, Casual, Contractual, Job Order, Coterminous.
- Soft delete restoration is a first-class feature with its own UI (`/personnel/archived`), permission (`personnel.restore`), and form request — not a database-only operation. Archived view is available to `hr_staff`, but restore is restricted to `hr_admin` and `super_admin`.
- `personnel.delete` is restricted to `super_admin` only — HR admins can edit but not delete, preventing accidental data loss.
- No global shared props; all personnel data is passed via individual Inertia page responses.
- Reuse the existing `User` model as the Employee record — no separate employees table — to avoid duplicating auth and identity data.

---

## Expected Behavior When Complete

### Employee View
Employees have no access to the Personnel Directory. Attempting to visit `/personnel` returns a 403. Employees can only view and edit their own profile via the settings page.

### HR Staff View (`/personnel`)
- Can access the index and show pages.
- Can access the archived employee list read-only, but cannot restore.
- Create, Edit, and Delete buttons are hidden or disabled.
- Can search and filter the employee list.

### HR Admin / Super Admin View (`/personnel`)

**Index Page (`/personnel`):**
Paginated table of all active (non-deleted) employees. Columns: employee number, full name, position, department, employment status, hire date. Search bar filters by name or employee number. Dropdown filters for department and employment status. Each row has View, Edit, and Delete action buttons (Delete restricted to super_admin).

**Create Page (`/personnel/create`):**
Form with fields: employee number, first name, last name, email (optional), contact number, address, position (dropdown from positions), department (dropdown from departments), employment status (dropdown), hire date. Inline validation errors. On success, redirects to index with a flash success message.

**Edit Page (`/personnel/{id}/edit`):**
Pre-filled form identical to Create. On success, redirects to Show page with a flash success message.

**Show Page (`/personnel/{id}`):**
Read-only view of all employee fields. Edit and Delete buttons shown if the user has the appropriate permissions.

**Archived Page (`/personnel/archived`):**
Table of soft deleted employees with columns: employee number, name, department, deleted date. Each row has a Restore button. On restore, employee reappears in the main index. Accessible to `hr_admin` and `super_admin`.