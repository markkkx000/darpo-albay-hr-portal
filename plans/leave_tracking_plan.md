## Leave Tracking/Management Implementation Plan: : GOOD TO GO

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Implement leave request system with filing, approval workflow, and status tracking for employees and HR.

---

## Steps

1. Create migration for `leave_types` table: id, name (unique), description, is_active (default true), created_at, updated_at. Seed initial types: Vacation, Sick, Maternity, Paternity, etc.
2. Create migration for `leave_requests` table: id, user_id, leave_type_id (foreign key to leave_types), start_date, end_date, days_requested (calculated, excluding weekends/holidays), reason, status (pending/approved/rejected/cancelled), approved_by (nullable), approved_at (nullable), cancelled_at (nullable), created_at, updated_at, deleted_at.
3. Create LeaveType model with fillable attributes, no soft deletes.
4. Create LeaveRequest model with relationships to User and LeaveType, soft deletes, and fillable attributes. Add scopes for status.
5. Create LeaveService for filing, approving, rejecting, cancelling leaves, calculating working days (exclude weekends, future holidays), checking overlaps, and hooks for credit deduction on approval.
6. Create form requests: LeaveRequestCreateRequest (validate dates, no overlaps, future dates), LeaveApprovalRequest, LeaveCancelRequest.
7. Create LeaveController with index, create, store, show, approve, reject, cancel methods.
8. Create routes/leave.php with routes for filing, managing, and cancelling leaves, protected by permissions. Add cancel route for employees.
9. Register in web.php.
10. Frontend: pages/Modules/Leave/Index.tsx (my leaves), FileLeave.tsx, ManageLeaves.tsx (HR).
11. Components for leave forms, status, and cancel confirmation.
12. Seed permissions: leave.file (employee), leave.view_all (hr_staff, hr_admin), leave.approve (hr_staff, hr_admin), leave.cancel (employee — own pending only), leave.cancel_any (hr_staff, hr_admin, super_admin).
13. Install asantibanez/laravel-eloquent-state-machines for status transitions with guards.
14. Write tests for state transitions, calculations, and permissions.
15. Pint and test.

---

## Relevant Files

- Migration for leave_types.
- Migration for leave_requests.
- `app/Modules/Leave/Models/LeaveType.php`
- `app/Modules/Leave/Models/LeaveRequest.php`
- `app/Modules/Leave/Services/LeaveService.php`
- Requests in `app/Modules/Leave/Requests/`
- `app/Modules/Leave/Controllers/LeaveController.php`
- `routes/leave.php`
- Frontend pages in `resources/js/pages/Modules/Leave/`
- Components in `resources/js/components/Leave/`
- Seeder update.
- Tests.

---

## Verification

1. Run `php artisan route:list` to confirm leave routes are registered.
2. Execute `php artisan test --compact --filter=Leave` to pass all tests.
3. As employee, file a leave request and verify status is pending, days calculated excluding weekends.
4. As employee, cancel a pending request and verify status changes to cancelled.
5. As HR, approve a pending request and verify status changes, approved_by set.
6. As HR, reject a request and verify status changes.
7. Test state machine guards: cannot approve/reject/cancel non-pending requests.
8. Check database for leave_types seeded and foreign key constraints.
9. Verify overlaps prevent filing conflicting dates.
10. Ensure soft deletes work and cancelled requests are excluded from active queries.

---

## Decisions

- Separate leave_types table for extensibility without migrations.
- leave_types records must never be hard deleted; use is_active = false to deactivate them instead.
- Use asantibanez/laravel-eloquent-state-machines for status transitions with guards to prevent invalid state changes.
- Workflow: pending → approved/rejected/cancelled (by employee or HR).
- HR can cancel any pending leave request on behalf of an employee (e.g. if filed in error). Two separate permissions control this: leave.cancel for employees cancelling their own pending requests, and leave.cancel_any for HR cancelling any pending request. The state machine guard for cancellation must check which permission the acting user has before allowing the transition.
- LeaveService structured with approval hooks for future Leave Credits integration (deduct credits on approval).
- Working days calculation: exclude Saturdays/Sundays, future holiday integration.
- Soft deletes for leave records.

---

## Expected Behavior When Complete

### Employee View (`/leave`)
- **Index Page**: List of own leave requests with status, dates, type. Pending yellow, approved green, rejected red, cancelled gray. Cancel button for pending requests.
- **File Leave Page**: Form to select type (from leave_types), dates, reason. Calendar picker excludes weekends, validation for no overlaps.
- **Cancel Action**: Confirmation modal, changes status to cancelled.

### HR View (`/leave/manage`)
- **Manage Page**: Table of all pending leave requests. Columns: employee, type, dates, reason, days. Actions: Approve/Reject with confirmation.
- Approved/rejected requests in history tab.
- Can cancel pending requests if needed.
- Notifications or flash messages on actions.