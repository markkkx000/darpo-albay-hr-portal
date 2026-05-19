# Dashboard Implementation Plan

This plan outlines the steps to make the `Admin`, `HR`, and `Employee` dashboards fully functional by fetching real data from the backend and rendering it dynamically in the existing Inertia React components.

## User Review Required

> [!IMPORTANT]
> Some metrics like "System Health" or "Active Sessions" do not have dedicated database models or direct metrics in a standard Laravel setup out-of-the-box. The plan proposes either mocking these values for now or calculating them from basic metrics (like recent logins).
> Please confirm if you'd prefer simple static values for these edge-case stats or if there's a specific calculation you'd like implemented.

## Proposed Changes

---

### Backend Controller & Routes

#### [NEW] `app/Http/Controllers/DashboardController.php`
- Create a new controller to replace the pure `Route::inertia` definition.
- The `index` method will gather data based on the current user's roles (`super_admin`, `hr_admin`/`hr_staff`, or employee).
- Data fetched will include:
  - **Admin**: `total_users` (Count of User model), `active_sessions` (Mocked or DB sessions count), `system_health` (Mocked to "100%").
  - **HR**: `total_employees` (Count of User model), `pending_leaves` (Count of `LeaveRequest` with pending status), `active_today` (Count of unique users in `Attendance` for today).
  - **Employee**: `today_status` (Fetch today's `Attendance` for user), `leave_balance` (Sum from `LeaveCredit`), `this_month_working_days` (Count of `Attendance` records for the current month).

#### [MODIFY] `routes/web.php`
- Replace `Route::inertia('dashboard', 'dashboard')->name('dashboard');` with `Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');`.

---

### Frontend React Components

#### [MODIFY] `resources/js/pages/dashboard.tsx`
- Update the page component to receive the new data props returned from the backend.
- Pass the appropriate data objects down to the child overview components (`AdminOverview`, `HROverview`, `EmployeeOverview`).

#### [MODIFY] `resources/js/components/dashboard/admin-overview.tsx`
- Replace hardcoded `--` stats with the real props.
- Update "Quick Actions" to use Inertia `<Link>` components pointing to actual named routes (e.g., `/roles`, `/settings/profile`).
- Remove "(Coming Soon)" tags for actions that are implemented.

#### [MODIFY] `resources/js/components/dashboard/hr-overview.tsx`
- Replace hardcoded stats with the real `hrData` props.
- Update "Quick Actions" to use Inertia `<Link>` components pointing to actual named routes (e.g., `/personnel`, `/leave`, `/attendance`).
- Remove "(Coming Soon)" tags for actions that are implemented.

#### [MODIFY] `resources/js/components/dashboard/employee-overview.tsx`
- Replace hardcoded stats with the real `employeeData` props.
- Format the `today_status` to show clock-in time and status.
- Update "Quick Actions" to use `<Link>` pointing to the correct routes (e.g., clock-in modal, `/leave/create`, profile).

## Verification Plan

### Automated Tests
- If there are existing feature tests for the dashboard, they will be updated to expect the new props and mock necessary data.
- Run `php artisan test` to ensure no routes or features are broken by the controller replacement.

### Manual Verification
- Log in as a Super Admin and verify the Admin Dashboard stats and links.
- Log in as an HR Admin and verify the HR Dashboard stats and links.
- Log in as a standard Employee and verify personal stats (leave balance, attendance) and links.
