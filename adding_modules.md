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
- New migrations follow PostgreSQL-compatible types (avoid SQLite-only syntax).
- Entities that represent real-world records (employees, leave requests, etc.) 
  must use `softDeletes()`.

## Shared Props Rule
- Changes to `HandleInertiaRequests.php` must be deliberate — do not add 
  module-specific data to global shared props. Pass module data via the 
  individual Inertia page response instead.

## Module Checklist
Before considering a module complete, verify:
- [ ] Routes are in their own file and registered in `web.php`
- [ ] Controller is thin (delegates to a Service class)
- [ ] Validation uses a Form Request
- [ ] Migration is PostgreSQL-compatible
- [ ] Frontend page is under `pages/Modules/{ModuleName}/`
- [ ] No large conditionals added to `dashboard.tsx`
- [ ] Permissions for the module are seeded in `RoleAndPermissionSeeder`