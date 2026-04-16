# Implementation Plan: Advanced Attendance Filtering and Search: DO NOT EXECUTE YET (PENDING REVIEW)

Enhance the Attendance Management module with server-side filtering, global search, and performance optimizations to handle millions of records.

## User Review Required

> [!IMPORTANT]
> **Database Indexing**: We will add indexes to `date` and `clock_out` to support fast filtering. For search, we will use a combined query on the `users` table (since employee names are stored there).
> [!IMPORTANT]
> **Default Status Logic**: We will define "Working" as `clock_out IS NULL` and "Completed" as `clock_out IS NOT NULL`.
> [!WARNING]
> **Pagination**: We will switch to a more robust pagination UI on the frontend to allow navigating through many pages.

## Proposed Changes

### Database Layer

#### [NEW] [create_attendance_indexes_migration](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/database/migrations/2024_04_16_000000_add_indexes_to_attendances_table.php)
- Add indexes to `attendances.date` and `attendances.clock_out`.
- Ensure `user_id` is indexed (already is via foreign key).

### Backend Layer

#### [MODIFY] [Attendance.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Models/Attendance.php)
- Add a `scopeFilter` method to encapsulate filtering logic.
- Add searchable logic (joining with `users.first_name` and `users.last_name`).

#### [MODIFY] [AttendanceService.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Services/AttendanceService.php)
- Update `getAllAttendance` to leverage the new `scopeFilter`.
- Ensure eager loading of `user` is preserved to prevent N+1 issues.
- Implement more robust filtering:
  - `search` (Search across name/fields).
  - `user_id` (Specific employee selection).
  - `from_date` / `to_date` (Range filtering).
  - `status` (Working/Completed).

#### [MODIFY] [AttendanceManagementController.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Controllers/AttendanceManagementController.php)
- Update `index` to pass request parameters to the service.
- Return current filter values to the frontend for UI state synchronization.

### Frontend Layer

#### [NEW] [AttendanceFilters.tsx](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/resources/js/components/Attendance/AttendanceFilters.tsx)
- Create a reusable component for the filter bar.
- Fields: Search input (debounced), Date Range picker, Status dropdown.

#### [MODIFY] [ManageRecords.tsx](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/resources/js/pages/Modules/Attendance/ManageRecords.tsx)
- Integrate `AttendanceFilters` component.
- Implement URL state syncing using Inertia's `router.get`.
- Add a Pagination component (or use a reusable one if exists) to handle the `records.links`.
- Implement debouncing for the search input (300-500ms).

## Verification Plan

### Automated Tests
- Run `php artisan test --filter=AttendanceManagementTest` to ensure no regressions in basic CRUD.
- Create a new test `AttendanceFilterTest.php` to verify:
  - Search by name (partial match).
  - Date range filtering.
  - Status filtering.
  - Combination of multiple filters.
  - Pagination integrity.

### Manual Verification
- Log in as HR Admin.
- Navigate to "Attendance Management".
- Apply various filter combinations.
- Verify URL changes and results update without full page reload.
- Verify search debouncing.
- Check database query logs (if possible) to ensure indexes are hit and no N+1 queries occur.
