## DTR Export Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `RULES_AND_GUIDELINES.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in `routes.php` (auto-registered), thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, and frontend pages under `resources/js/pages/Modules/{ModuleName}/`. Ensure to use Laravel 13 PHP attributes, `Laravel Wayfinder` for routing, `sonner` for toast notifications, and `matte-card elev-2` for styling.

**TL;DR:** Export attendance data to PDF/CSV formats.

---

## Steps

1. Use existing Attendance module data; no new tables needed.
2. Create `DTRService` (inside `app/Modules/DTR/Services/`) for querying attendance by date range, formatting for CS Form 48 / Appendix 24 (daily time records). Ensure `ilike` is used for case-insensitive search queries.
3. Form Requests: Create `DTRGenerateRequest` for validation.
4. `DTRController` with `index` (form) and export methods (`exportPdf`, `exportCsv`). Keep the controller thin by delegating data fetching to `DTRService`.
5. Create `app/Modules/DTR/routes.php` protected by `permission:dtr.manage` middleware. 
6. Create `app/Modules/DTR/navigation.php` to register the DTR Export sidebar links via `ModuleRegistry`. Return a closure accepting `$registry`.
7. Create frontend pages in `resources/js/pages/Modules/DTR/` using **Laravel Wayfinder** for all routing.
    - Apply `matte-card elev-2` for card containers.
    - Implement `disabled={isProcessing}` loading states on generation action buttons.
    - Use the shared `EmployeeSearch.tsx` combobox to filter by employee (must implement keyword-splitting logic in controller/service).
8. Install and use `barryvdh/laravel-dompdf` for PDF, `maatwebsite/excel` for CSV (verify version compatibilities with PHP 8.4 and Laravel 13 if necessary).
9. Permissions: Ensure `dtr.manage` is handled appropriately in `RoleAndPermissionSeeder` (assigned to HR roles).
10. Write Pest feature tests in `tests/Feature/Modules/DTR/` to verify export generation without layout errors.
11. Run `vendor/bin/pint --dirty --format agent` and test.

---

## Relevant Files

- `app/Modules/DTR/routes.php`
- `app/Modules/DTR/navigation.php`
- Module files in `app/Modules/DTR/`
- Frontend files in `resources/js/pages/Modules/DTR/`
- Update `composer.json`: `"barryvdh/laravel-dompdf"`, `"maatwebsite/excel"`.

---

## Verification

1. Routes auto-registered via `ModuleServiceProvider`.
2. Pest tests pass against PostgreSQL (`DB_CONNECTION=pgsql`).
3. Exports generate correct file content.
4. Wayfinder routes are correctly typed and working.
5. Form buttons properly disable during processing.

---

## Decisions

- Depends heavily on the existing Attendance module.
- No new tables, therefore no soft deletes or migrations needed.

---

## Expected Behavior When Complete

### HR View (`/dtr`)
- **Export Page**: Form to select month/year, employee (or all), format (PDF/CSV). Submit downloads file. Fluid `w-full` layout.
- Use `EmployeeSearch.tsx` for fast autocomplete filtering.
- PDF generates formatted CS Form 48 with employee details, daily clock-in/out, totals.
- CSV generates raw data for spreadsheet import.