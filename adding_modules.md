# Adding Modules

## General Rule
"If you add role-specific modules, keep them as reusable components/pages 
and render them from `dashboard.tsx` or from separate route pages. That will 
keep the codebase clean rather than stuffing everything into one file."

## Frontend Rules
- Prefer one module per feature or role area.
- Keep dashboard behavior shallow by delegating work to child components.
- Use separate pages/routes when a module needs its own route and lifecycle.
- Avoid adding large role-specific logic directly inside `dashboard.tsx`.
- Reusable components should be extracted into `resources/js/components/` 
  or `resources/js/pages/` as needed.
- New module pages go in `resources/js/pages/Modules/{ModuleName}/`.

## Backend Rules
- New module controllers go in `app/Modules/{ModuleName}/Controllers/` — 
  never in `app/Http/Controllers/`.
- New module routes go in their own file (e.g. `routes/attendance.php`) and 
  are registered in `web.php` via `require` — do not dump module routes 
  directly into `web.php`.
- Business logic goes in a Service class under 
  `app/Modules/{ModuleName}/Services/` — keep controllers thin.
- Validation goes in Form Request classes under 
  `app/Modules/{ModuleName}/Requests/` — never validate inside controllers.
- Entities that represent real-world records (employees, leave requests, etc.) 
  must use `softDeletes()`.

## Migration Guidelines
- **SQLite is used for local development. PostgreSQL (Supabase) is used in production.** All migrations must be compatible with both.
- Never use SQLite-only column types. Always use standard Laravel migration methods that map correctly to PostgreSQL.
- Use `string()` for text columns, `unsignedBigInteger()` for foreign keys, `boolean()`, `date()`, `timestamp()`, `text()`, and `json()` — these are safe on both databases.
- Always define foreign key constraints explicitly — do not rely on naming conventions alone.
- Use `softDeletes()` on any table that represents a real-world entity (employees, leave requests, attendance records, etc.).
- Lookup tables (e.g. `leave_types`, `departments`, `positions`, `employment_statuses`) must never be hard deleted — use an `is_active` boolean column instead.
- Never store structured data as a plain string column if it will be referenced by other tables or used in reports. Use a proper lookup table instead.
- Always add a `unique()` constraint at the database level for fields that must be unique (e.g. `employee_number`, `email`) — do not rely on validation alone.

## Shared Props Rule
- Changes to `HandleInertiaRequests.php` must be deliberate — do not add 
  module-specific data to global shared props. Pass module data via the 
  individual Inertia page response instead.

## Module Checklist
Before considering a module complete, verify:
- [ ] Routes are in their own file and registered in `web.php`
- [ ] Controller is thin (delegates to a Service class)
- [ ] Validation uses a Form Request
- [ ] Migration is PostgreSQL-compatible (see Migration Guidelines)
- [ ] Lookup tables use `is_active` instead of hard deletes
- [ ] Real-world entity tables use `softDeletes()`
- [ ] Foreign key constraints are explicitly defined
- [ ] Frontend page is under `pages/Modules/{ModuleName}/`
- [ ] No large conditionals added to `dashboard.tsx`
- [ ] Permissions for the module are seeded in `RoleAndPermissionSeeder`
- [ ] `navigation.php` is present if the module needs a sidebar link