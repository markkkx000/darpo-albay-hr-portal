# Implementation Plan: Advanced Attendance Filtering and Search: GOOD TO GO

Enhance the Attendance Management module with server-side filtering, global search, and performance optimizations. This revised plan incorporates feedback regarding status logic, UI UX, and pagination.

## User Review Required

> [!IMPORTANT]
> **Status Logic**: We will implement a tri-state status logic:
> - **Working**: `clock_out IS NULL AND date = today`
> - **Incomplete**: `clock_out IS NULL AND date < today`
> - **Completed**: `clock_out IS NOT NULL`
> This ensures historical records with missing clock-outs are easily identifiable.

> [!IMPORTANT]
> **Pagination**: We will use Laravel's `paginate()` method to provide total record counts and page numbers, enabling a numbered pagination component on the frontend.

> [!TIP]
> **UX Enhancement**: The filter bar will include a dedicated "Reset Filters" button to clear all active filters and return to the default view.

## Proposed Changes

### Database Layer

#### [MODIFY] [create_attendance_indexes_migration](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/database/migrations/2024_04_16_000000_add_indexes_to_attendances_table.php) [RESERVED]
- Add indexes to `attendances.date` and `attendances.clock_out` to support efficient filtering by date and status.
- Ensure `user_id` is indexed (already is via foreign key).

### Backend Layer

#### [MODIFY] [Attendance.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Models/Attendance.php)
- Add a `scopeFilter` method.
- Implement status logic inside the scope using `whereNull('clock_out')->whereDate('date', ...)` for Working/Incomplete.

#### [MODIFY] [AttendanceService.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Services/AttendanceService.php)
- Update `getAllAttendance` to leverage `scopeFilter`.
- Switch from generic `get()` or simple filtering to `paginate(15)` for full navigation support.

#### [MODIFY] [AttendanceManagementController.php](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/app/Modules/Attendance/Controllers/AttendanceManagementController.php)
- Pass request parameters (search, status, date range) to the service.
- Return current filter state to the frontend to maintain UI input values.

### Frontend Layer

#### [NEW] [AttendanceFilters.tsx](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/resources/js/components/Attendance/AttendanceFilters.tsx)
- Create a filter bar component.
- **Fields**: Search (debounced), Date Range, Status Dropdown (Working, Completed, Incomplete).
- **Features**: "Reset Filters" button that clears all state and triggers a refresh.

#### [MODIFY] [ManageRecords.tsx](file:///c:/Users/ADMIN/Documents/Clone/darpo-albay-hr-portal/resources/js/pages/Modules/Attendance/ManageRecords.tsx)
- Integrate `AttendanceFilters`.
- Replace basic list or simple pagination with a numbered `Pagination` component.
- Synchronize URL parameters with Inertia `router.get`.

## Verification Plan

### Automated Tests
- `AttendanceFilterTest.php`:
  - Verify "Incomplete" status logic correctly identifies past records without clock-out.
  - Verify pagination contains meta information (total, per_page, last_page).
  - Verify multi-filter combinations.

### Manual Verification
- Apply each status filter and verify results match the logic.
- Click "Reset Filters" and ensure all UI elements and results reset.
- Navigate through multiple pages using the numbered pagination links.

