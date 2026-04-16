## Attendance Registry Implementation Plan (Phase 2 - Management)

**Reminder:** Strictly adhere to the rules in `adding_modules.md` and the architecture defined in `CODEBASE_SUMMARY.md`. This includes keeping controllers thin, using Form Requests for validation, leveraging `ModuleServiceProvider` for auto-registration of routes, utilizing local Wayfinder functions for frontend/backend routing, and maintaining a clean component structure without large conditionals in global files (e.g., `dashboard.tsx`).

**Phase 2 Objective:** Implement attendance management capabilities allowing authorized roles (Super Admin, HR Admin, HR Staff) to manually edit attendance records and add missing past records. Ensure destructive actions (deletion) are further restricted.

---

## 1. Permissions & Access Control
- Split permissions logically for management vs deletion:
  - `attendance.manage` — covers viewing, adding, and editing records. Assignd to `hr_staff`, `hr_admin`, and `super_admin`.
  - `attendance.delete` — covers soft deletion only. Assigned to `hr_admin` and `super_admin` only.
- Update `database/seeders/RoleAndPermissionSeeder.php` correctly with the new permissions.
- All management routing/form requests must explicitly authorize against the appropriate permissions.

---

## 2. Backend Architecture

### Route Registration
Append Phase 2 routes to `app/Modules/Attendance/routes.php` (which currently has `/`, `/clock-in`, and `/clock-out`). Do not modify `routes/web.php`.
- **POST** `/manage/records` — Store a manually added missing attendance record (named `manage.records.store`), protected by `permission:attendance.manage`.
- **PUT** `/manage/records/{attendance}` — Update an existing attendance record (named `manage.records.update`), protected by `permission:attendance.manage`.
- **DELETE** `/manage/records/{attendance}` — Soft deletes a record (named `manage.records.destroy`), protected by `permission:attendance.delete` (not `attendance.manage`).

*Note: Group under `/manage` prefix or just add the routes directly based on module convention.*

### Thin Controllers
Create a new controller:
`app/Modules/Attendance/Controllers/AttendanceManagementController.php`
- Contains `store`, `update`, and `destroy` methods.
- The `destroy(Attendance $attendance)` method checks permissions natively if not relying on middleware alone, and delegates to the Service.

### Form Requests (Validation)
Create the following in `app/Modules/Attendance/Requests/`:
1. **`StoreAttendanceRecordRequest`**:
   - `user_id`: required, must exist in `users` table.
   - `date`: required, valid date, unique combination with `user_id` in `attendances` table to prevent duplicate daily records.
   - `clock_in`: required, valid timestamp.
   - `clock_out`: nullable, valid timestamp, strictly on or after `clock_in`.
2. **`UpdateAttendanceRecordRequest`**:
   - `clock_in`: required, valid timestamp.
   - `clock_out`: nullable, valid timestamp, strictly on or after `clock_in`.

Both Form Requests must implement the `authorize()` method to check for `attendance.manage` permissions. *No form request is needed for delete — just a permission check in the controller / route middleware.*

### Service Layer Logic
Extend the existing `app/Modules/Attendance/Services/AttendanceService.php`:
- `storeManualRecord(array $data)`: Parses timestamps and creates the record.
- `updateRecord(Attendance $attendance, array $data)`: Adjusts the timestamps, ensuring the `clock_out` logic remains valid contextually.
- `deleteRecord(Attendance $attendance)`: Soft deletes the record.

---

## 3. Frontend Architecture

### Inertia Pages & Components
New frontend structures should reside within `resources/js/pages/Modules/Attendance/` or `resources/js/components/Attendance/`.
1. **Management Interface (`resources/js/pages/Modules/Attendance/ManageRecords.tsx`)**: 
   - A dedicated page for HR / Admins showing historical records.
   - Must include an "Add Missing Record" button.
   - For an existing record, display an "Edit" button and a "Delete" button.
2. **Reusable Components**:
   - `AttendanceRecordModal.tsx`: A shared modal containing the form to either Add or Edit records. Use `useForm()` from Inertia.
   - Add a Confirmation Modal before submitting a delete: "Are you sure you want to delete this record?".

### Wayfinder Integration
- **Strictly enforce Wayfinder usage.** Use the auto-generated local TypeScript route functions to build the URLs for forms and requests.
- Use Wayfinder route calls for the DELETE request (e.g. `router.delete(attendanceManageRecordsDestroy({ attendance: id }))`).
- Run `php artisan wayfinder:generate` upon registering the backend routes to generate frontend endpoints.

### State Management
- Employees and specific attendance states should be parsed via normal view page props, avoiding `HandleInertiaRequests.php` bloating.

---

## 4. Expected Behavior and Walkthrough

### Managing and Modifying Records
1. The HR user clicks "Add Missing Record".
2. A modal prompts for: Employee, Date, Clock-in Time, and optional Clock-out Time. Form validation catches if an Employee already has a record for that date.
3. On submission, unique constraints prevent duplicate data.
4. HR user edits an existing record's `clock_out` using the "Edit" button if a user forgot to clock out. 

### Deleting Records
1. HR Admin clicks the "Delete" button next to a record in the UI.
2. A confirmation modal prompts: "Are you sure you want to delete this record?".
3. HR Admin confirms, issuing a DELETE request natively.
4. If an HR Staff member tries this (circumventing the UI without the correct permission), they are blocked by a 403.

---

## 5. Verification Checklist
- [ ] Backend routes added to `app/Modules/Attendance/routes.php`.
- [ ] `AttendanceManagementController` utilizes `AttendanceService` exclusively for business logic.
- [ ] Form Requests strictly validate inputs, notably checking unique constraints for missing records and timestamp chronologies.
- [ ] Wayfinder functions compiled and correctly used by Phase 2 frontend components.
- [ ] Pest tests cover manual record creation, updates, and deletion — including validation logic and permission checks.
- [ ] hr_staff with `attendance.manage` receives 403 on delete route.
- [ ] hr_admin with `attendance.delete` can successfully soft delete a record.
- [ ] Soft deleted record is excluded from normal queries but retains `deleted_at`.
