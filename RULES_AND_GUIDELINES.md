# Rules and Guidelines

## Module Architecture Rule
"Keep role-specific modules as reusable components/pages rendered from `dashboard.tsx` or separate route pages. Never stuff multiple modules or large role conditionals into a single file."

---

## Frontend Rules
- Prefer one module per feature or role area.
- Keep `dashboard.tsx` shallow — delegate all role-specific content to child components in `resources/js/components/dashboard/`.
- Use separate pages and routes when a module needs its own route and lifecycle.
- New module pages go in `resources/js/pages/Modules/{ModuleName}/`.
- Reusable components go in `resources/js/components/` — not inside module page folders.
- Use the shared `Pagination.tsx` for all paginated views. Never create module-specific pagination components.
- All frontend route calls must use **Laravel Wayfinder** typed functions. No hardcoded URL strings.
- Run `php artisan wayfinder:generate` after registering any new backend routes.
- **Never manually wrap page components in `<AppLayout>`**. The layout is auto-applied by `app.tsx` via the `layout` resolver. Wrapping manually causes double-wrapping (double header/sidebar). Pages must render with a fragment (`<>...</>`) and use a static `.layout` property for breadcrumbs: `Index.layout = { breadcrumbs: [...] }`. Check existing module pages (e.g., `Personnel/Index.tsx`) for the correct pattern.
- **Dropdown/Combobox Truncation**: All dropdown triggers (`SelectTrigger`) and list items (`SelectItem`) must handle long content by truncating with an ellipsis (`...`). They must never overlap other UI components or expand the container horizontally beyond its intended bounds. Use `w-full` for form inputs to maintain consistent alignment.

- **State Refresh Rule**: Whenever a module's subpage or main page changes anything in the database (e.g., creating, updating, deleting), ensure that the whole module is refreshed whenever a user goes back to the main route (e.g., `/personnel`). This eliminates the need to manually refresh the page. Keep the existing redirection/navigation behavior of pages intact (e.g., achieve this by clearing Inertia history using `router.clearHistory()` on successful form submissions so that clicking 'back' forces a fresh data fetch).

---

## UI Feedback & Interaction
- **Immediate Feedback**: Always provide immediate visual feedback for user actions.
- **Toast Notifications**: Use `sonner` for toast notifications after successful data-modifying operations (POST, PUT, DELETE).
    - Example: `toast.success('Employee updated successfully');`
    - Implementation: Call `toast` within the `onSuccess` callback of Inertia `router` or `useForm` methods.
- **Scroll Position**: Use `preserveScroll: true` in the router options for operations that shouldn't reset the page scroll, such as inline updates in a table.
- **Form States**: Ensure submit buttons are disabled and show a loading state (e.g., `processing` from `useForm`) during form submission.

---

## Common Components & Patterns
- **EmployeeSearch Component**:
    - When using `EmployeeSearch.tsx` for searching users in the backend, always implement **keyword-splitting logic** in the controller.
    - Instead of a single `where like` query, split the search string by spaces and iterate through the keywords.
    - Each keyword must be checked against `first_name`, `last_name`, and `employee_number` using a nested `where` closure.
    - This ensures that searching for a full name (e.g., "John Doe") correctly finds users whose names are split across columns.
    - Example implementation can be found in `UserRoleController@index` or `LeaveController@index`.

---

## Backend Rules
- Module controllers go in `app/Modules/{ModuleName}/Controllers/` — never in `app/Http/Controllers/`.
- Module routes go in `app/Modules/{ModuleName}/routes.php` — auto-registered by `ModuleServiceProvider`.
- **Never** manually `require` module routes in `web.php`. `routes/web.php` contains core auth and dashboard routes only.
- Business logic goes in a Service class under `app/Modules/{ModuleName}/Services/` — keep controllers thin.
- Validation goes in Form Request classes under `app/Modules/{ModuleName}/Requests/` — never validate inside controllers.
- **Model Definition**: Use Laravel 13 PHP attributes (`#[Fillable]`, `#[Hidden]`) instead of protected properties.
- Real-world entity tables must use `softDeletes()`.
- Each module that needs a sidebar link must include `app/Modules/{ModuleName}/navigation.php`. Read `ModuleServiceProvider.php` and an existing `navigation.php` (e.g. Attendance) before writing a new one to match the expected format.

---

## Migration Guidelines
- **SQLite for local development. PostgreSQL (Supabase) for production.** All migrations must be compatible with both.
- Never use SQLite-only column types. Use standard Laravel migration methods only.
- Safe column types for both databases: `string()`, `text()`, `boolean()`, `date()`, `timestamp()`, `json()`, `unsignedBigInteger()`.
- Always define foreign key constraints explicitly — do not rely on naming conventions.
- Use `softDeletes()` on tables representing real-world entities (employees, leave requests, attendance records, etc.).
- Lookup tables (`leave_types`, `departments`, `positions`, `employment_statuses`, etc.) must never be hard deleted — use `is_active = false` to deactivate.
- Never store structured data as a plain string column if it will be referenced by other tables or used in reports — use a lookup table.
- Always add `unique()` constraints at the database level for fields that must be unique (e.g. `employee_number`, `email`) — do not rely on validation alone.

---

## Shared Props & Background Tasks
- Never add module-specific data to `HandleInertiaRequests.php` global shared props.
- **Lazy Loading**: Use closures in `HandleInertiaRequests.php` for any global prop that requires a database query to ensure it only runs when needed.
- **Background Mutations**: For operations that don't need full page navigation or reloads (e.g., status updates, marking as read), use the Inertia v3 **`useHttp`** hook instead of `router.post()`.
- Pass module data via individual Inertia page responses in the controller.
- Changes to `HandleInertiaRequests.php` must be deliberate and affect all pages — not one module.

---

## Permission Naming Convention
- Use dot notation: `module.action` (e.g. `attendance.clock`, `personnel.view`, `leave.approve`).
- Always seed permissions in `RoleAndPermissionSeeder` — never hardcode role checks in controllers.
- Use route middleware (`permission:module.action`) for route-level protection.
- Use `authorize()` in Form Requests for request-level permission checks.

---

## Module Checklist
Before considering a module complete, verify:
- [ ] Routes are in `app/Modules/{ModuleName}/routes.php` (auto-registered, not in `web.php`)
- [ ] Controller is thin — delegates all logic to a Service class
- [ ] Validation uses Form Request classes — no validation in controllers
- [ ] Migration is PostgreSQL-compatible (see Migration Guidelines above)
- [ ] Lookup tables use `is_active` instead of hard deletes
- [ ] Real-world entity tables use `softDeletes()`
- [ ] Foreign key constraints are explicitly defined in migrations
- [ ] Wayfinder functions generated and used for all frontend route calls
- [ ] Frontend pages are under `resources/js/pages/Modules/{ModuleName}/`
- [ ] Shared `Pagination.tsx` used for paginated views
- [ ] No large conditionals added to `dashboard.tsx`
- [ ] Permissions seeded in `RoleAndPermissionSeeder` using dot notation
- [ ] `navigation.php` present and formatted correctly if module needs a sidebar link
- [ ] Success actions provide toast notifications via `sonner`
- [ ] `php artisan migrate:fresh --seed` runs cleanly with no errors
- [ ] All Pest tests pass (`php artisan test --compact --filter={ModuleName}`)
- [ ] `vendor/bin/pint --dirty --format agent` run on all PHP files
- [ ] `npm run build` completes with no errors