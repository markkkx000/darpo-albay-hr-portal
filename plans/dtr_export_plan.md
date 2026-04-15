## DTR Export Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Export attendance data to PDF/CSV formats.

---

## Steps

1. Use existing Attendance module data; no new tables needed.
2. Create DTRService for querying attendance by date range, formatting for CS Form 48 / Appendix 24 (daily time records).
3. DTRController with index (form) and export methods (PDF/CSV).
4. Routes/dtr.php with GET /dtr (form), POST /dtr/export (download).
5. Frontend: ExportDTR.tsx with date range picker, employee selector (HR), format dropdown (PDF/CSV).
6. Install and use barryvdh/laravel-dompdf for PDF, maatwebsite/excel for CSV.
7. Permissions: 'dtr.export' (HR roles).
8. Tests for export generation.
9. Pint and test.

---

## Relevant Files

- In `app/Modules/DTR/`
- Add to composer.json: "barryvdh/laravel-dompdf", "maatwebsite/excel".

---

## Verification

1. Routes.
2. Tests.
3. Exports generate correct files.

---

## Decisions

- Depends on Attendance module.
- No soft deletes needed.

---

## Expected Behavior When Complete

### HR View (`/dtr`)
- **Export Page**: Form to select month/year, employee (or all), format (PDF/CSV). Submit downloads file.
- PDF generates formatted CS Form 48 with employee details, daily clock-in/out, totals.
- CSV for spreadsheet import.