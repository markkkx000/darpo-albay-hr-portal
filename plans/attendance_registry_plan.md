## Attendance Registry Implementation Plan: GOOD TO GO

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Implement a real-time attendance tracking system allowing employees to clock in/out, with backend API for recording timestamps and frontend UI for clock actions.

---

## Steps

1. Create migration for `attendances` table with the following columns: id, user_id (foreign key), date (date type), clock_in (timestamp), clock_out (nullable timestamp), created_at, updated_at, deleted_at (soft deletes). Add a unique constraint on `user_id` + `date` to prevent duplicate attendance records per employee per day at the database level.
2. Create Attendance model in `app/Modules/Attendance/Models/Attendance.php` with relationships to User, soft deletes, and fillable attributes.
3. Create AttendanceService in `app/Modules/Attendance/Services/AttendanceService.php` with methods: clockIn(user), clockOut(user), getTodayAttendance(user). The service must enforce business rules: no double clock-in, no clock-out without a prior clock-in, and no more than one attendance record per user per date.
4. Create form requests: ClockInRequest and ClockOutRequest in `app/Modules/Attendance/Requests/` with validation rules (e.g., reject if already clocked in, reject clock-out if not clocked in).
5. Create AttendanceController in `app/Modules/Attendance/Controllers/AttendanceController.php` with clockIn and clockOut methods, injecting service and requests. Controller must remain thin — all logic stays in the service.
6. Create `routes/attendance.php` with POST routes for clock-in and clock-out, and a GET route for the attendance page, all protected by auth middleware and the appropriate permission (`attendance.clock`).
7. Register attendance routes in `routes/web.php` via require.
8. Create frontend page `resources/js/pages/Modules/Attendance/ClockInOut.tsx`. The clock display is a local JavaScript clock using `setInterval` updating every second — this is purely cosmetic. All actual clock-in/out actions are standard Inertia form POST submissions — no WebSockets or polling required.
9. Add reusable components in `resources/js/components/Attendance/`:
   - `ClockDisplay.tsx` — live local clock (hours, minutes, seconds)
   - `AttendanceStatus.tsx` — shows current status (not clocked in / clocked in since X)
10. Seed permissions for attendance in `RoleAndPermissionSeeder`:
    - `attendance.clock` — assigned to `employee`, `hr_staff`, `hr_admin`
    - `attendance.view_all` — assigned to `hr_staff`, `hr_admin`, `super_admin`
11. Write Pest tests for AttendanceController methods and service logic, covering: successful clock-in, rejected double clock-in, successful clock-out, rejected clock-out without prior clock-in, and unique constraint per user per date.
12. Run `vendor/bin/pint --dirty --format agent` on all PHP files.
13. Test frontend changes with `npm run dev` and verify no Vite errors.

---

## Relevant Files

- `database/migrations/XXXX_XX_XX_XXXXXX_create_attendances_table.php`
- `app/Modules/Attendance/Models/Attendance.php`
- `app/Modules/Attendance/Services/AttendanceService.php`
- `app/Modules/Attendance/Requests/ClockInRequest.php`
- `app/Modules/Attendance/Requests/ClockOutRequest.php`
- `app/Modules/Attendance/Controllers/AttendanceController.php`
- `routes/attendance.php`
- `routes/web.php` (update to require attendance.php)
- `resources/js/pages/Modules/Attendance/ClockInOut.tsx`
- `resources/js/components/Attendance/ClockDisplay.tsx`
- `resources/js/components/Attendance/AttendanceStatus.tsx`
- `database/seeders/RoleAndPermissionSeeder.php` (add attendance permissions)
- `tests/Feature/AttendanceTest.php`

---

## Verification

1. Run `php artisan route:list` to confirm attendance routes are registered.
2. Execute `php artisan test --compact --filter=Attendance` to pass all tests.
3. Visit the attendance page as an employee role and verify:
   - Clock In button is visible when not yet clocked in
   - Clock In button is disabled or hidden after clocking in
   - Clock Out button appears only after clocking in
   - Attempting to clock in twice returns a validation error
4. Check the database for attendance records with correct `date`, `clock_in`, and `clock_out` values.
5. Verify the unique constraint by attempting a duplicate record — it must be rejected at both the validation and database level.
6. Ensure soft deletes work by deleting a record and verifying `deleted_at` is set and the record is excluded from normal queries.

---

## Decisions

- The `date` column is stored separately from `clock_in` for efficient daily querying, which is required by the future DTR Export module (CS Form 48 / Appendix 24).
- A unique constraint on `user_id` + `date` is enforced at the database level, not just in validation, to prevent race conditions or bypassed requests from creating duplicate records.
- The real-time clock on the frontend is a local JavaScript `setInterval` updating every second — purely cosmetic. Recording timestamps is always server-side to prevent client-side tampering.
- Permissions: `attendance.clock` is for clocking in/out (employees, HR). `attendance.view_all` is for viewing all employee records (HR and above only).
- No global shared props are added; attendance data is passed via the individual Inertia page response.

---

## Expected Behavior When Complete

### Employee View (`/attendance`)
The page presents a clean, centered card with three elements:

- **Live clock** at the top — displays the current time in `HH:MM:SS` format, ticking every second via JavaScript. This is local time, display-only.
- **Status indicator** — shows the employee's current state for the day:
  - "You have not clocked in yet" (neutral/gray) when no record exists for today
  - "Clocked in at 08:02 AM" (green) after a successful clock-in
  - "Clocked out at 05:14 PM" (gray/muted) after clocking out
- **Action button** — a single prominent button that changes based on state:
  - **Clock In** (primary/green) — visible when not yet clocked in
  - **Clock Out** (warning/amber) — visible after clocking in, before clocking out
  - **Done for today** (disabled) — shown after both clock-in and clock-out are recorded, no further action possible for the day

Submitting either action is a standard Inertia POST. On success, the page refreshes and reflects the new state. On error (e.g. double clock-in), an inline error message appears below the button without a full page reload.

### HR/Admin View
HR admins and staff who also have `attendance.view_all` see the same clock-in/out card for themselves, plus a table below showing today's attendance across all employees — their name, clock-in time, clock-out time, and status (Present / Incomplete / Absent).