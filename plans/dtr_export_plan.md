# Implementation Plan: DTR Export Module: GOOD TO GO

This plan outlines the implementation required to export employee attendance records into standard CS Form 48 (Daily Time Record) PDF format and raw data CSV format. This module depends heavily on the existing `Attendance` module data — no new tables are required.

## User Review Required

> [!IMPORTANT]
> - **Dependency**: This module relies entirely on existing `Attendance` records. If the attendance schema changes, the export service must be updated.
> - **Download Mechanism**: Inertia forms do not natively handle binary file downloads via POST. The export route will be configured as a `POST` route using Axios with `responseType: 'blob'`, rather than a raw browser redirect. This preserves the SPA experience and allows us to catch and display JSON validation errors smoothly without full page reloads.
> - **Performance Considerations**: `barryvdh/laravel-dompdf` is memory-intensive. Exports are strictly limited to one specific employee per request. The "All Employees" bulk export feature is not in scope.
> - **Permissions**: HR administrators (`dtr.manage`) can export DTRs for any employee. Standard employees can access this module to self-export their own DTR only. The backend will enforce this restriction.

## Proposed Changes

---

### 1. Database & Models

No database migrations or new models are required. The module will purely query the existing `Attendance` model.

---

### 2. Backend Logic (Services & Requests)

#### [NEW] DTRService.php (app/Modules/DTR/Services/DTRService.php)
- **`getAttendanceForExport`**: Queries the `Attendance` model by month and year. Accepts an optional `userId` to filter for a specific employee. Sorts records by user and then by date.
- **`generatePdf`**: Takes the fetched `Collection` and uses `barryvdh/laravel-dompdf` to render `dtr_pdf.blade.php`. Returns the generated PDF stream.
    - **Time Splitting Logic**: CS Form 48 requires "Morning In/Out" and "Afternoon In/Out". Since the database stores a single daily `clock_in`/`clock_out`, this service will artificially split the shift using a hardcoded noon break (e.g., Morning Out at 12:00 PM, Afternoon In at 01:00 PM) for visual conformity on the printed form.
- **`generateCsv`**: Uses `maatwebsite/excel` (or standard `fputcsv` streamed response) to generate a CSV of the data and returns the response.

#### [NEW] DTRGenerateRequest.php (app/Modules/DTR/Requests/DTRGenerateRequest.php)
- Add validation rules:
    - `month`: required, integer between 1 and 12.
    - `year`: required, valid integer.
    - `format`: required, in `pdf` or `csv`.
    - `user_id`: required, must exist in `users.id`.
    - **Authorization logic**: Inside `authorize()`, ensure that if the authenticated user lacks the `dtr.manage` permission, the requested `user_id` must match their own ID (preventing them from downloading another employee's DTR).

#### [NEW] DTRController.php (app/Modules/DTR/Controllers/DTRController.php)
- **`index`**: Returns the Inertia view (`Modules/DTR/Index`) with the export form.
- **`export`**: Validates the `DTRGenerateRequest`. Calls `DTRService` to fetch the data and then returns the appropriate file download response (PDF or CSV) directly to the browser.

#### [NEW] routes.php (app/Modules/DTR/routes.php)
- `GET /` — Renders the index form view.
- `POST /export` — The export generation route.
- Protect routes with the standard `auth` middleware. Fine-grained access control (allowing self-export but preventing cross-export) will be handled by the FormRequest authorization.

#### [NEW] navigation.php (app/Modules/DTR/navigation.php)
- Register the "DTR Export" sidebar link via `ModuleRegistry`.

---

### 3. Frontend (UI/UX)

#### [NEW] Index.tsx (resources/js/pages/Modules/DTR/Index.tsx)
- **Layout**: Use the `matte-card elev-2` class for the main form container.
- **Form Fields**: 
    - Select for Month (1-12).
    - Select for Year (past 5 years to current).
    - `EmployeeSearch.tsx` combobox for selecting a specific employee. (If the user is a standard employee without `dtr.manage`, this field should ideally be hidden or locked to their own user record).
    - Select for Format (PDF or CSV).
- **Download Handling (Blob)**: Implement an `isProcessing` state for the export button. On submit, bypass Inertia's `useForm` and instead use `axios.post` with `responseType: 'blob'`. 
    - On success: Create a temporary `window.URL.createObjectURL(blob)` and trigger a hidden `<a>` tag click to download the file seamlessly.
    - On error (422): Catch the JSON validation errors and display them in the UI using standard error states or `sonner` toasts.

#### [NEW] dtr_pdf.blade.php (resources/views/exports/dtr_pdf.blade.php)
- Build an HTML layout matching the standard CS Form 48 formatting (Name, Month, daily rows 1-31, In/Out columns, totals).
- **CSS Constraints**: `DOMPDF` does not support Flexbox or CSS Grid. You must use classic `<table>` layouts and basic inline block styling to ensure proper rendering.

---

### 4. Route Synchronization & Dependencies

#### [Artisan] `sail artisan wayfinder:generate`
Run this after route creation to ensure TypeScript types are synchronized.

#### [Composer] Install Packages
Run `composer require barryvdh/laravel-dompdf maatwebsite/excel` to install the required export engines.

#### [Pint] `vendor/bin/pint --dirty --format agent`
Run this on modified PHP files before final verification.

## Verification Plan

### Automated Tests
- `sail artisan test --compact --filter=DTRExportTest`
- Create `tests/Feature/Modules/DTR/DTRExportTest.php` to verify:
    - Authorization protection (blocks employees from exporting other IDs, allows HR admins to export any ID).
    - Validation failures on missing/invalid parameters.
    - PDF and CSV generation endpoints return successful download responses.

### Manual Verification
- **Scenario 1**: Access `/dtr` as `hr_admin`. Verify the form loads correctly within the `matte-card`.
- **Scenario 2**: Trigger an export with invalid parameters (e.g., missing format). Verify that Axios catches the 422 error and the page does not reload, displaying the validation error cleanly.
- **Scenario 3**: Select a specific user, month, year, and the PDF format. Verify that a PDF file downloads via the Blob method and visually matches the CS Form 48 template, showing AM/PM split times.
- **Scenario 4**: Log in as a standard `employee` and attempt to access `/dtr`. Verify the form loads but the employee search component is either hidden or read-only (locked to their own account).
- **Scenario 5**: As a standard employee, attempt to submit an export request for a different user's ID via the API/Axios directly. Verify the backend returns a 403 Forbidden response.