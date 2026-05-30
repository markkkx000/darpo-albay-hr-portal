# Codebase Summary

## Overview
This application is a **Laravel 13** backend with an **Inertia.js React** frontend. It strictly requires **PHP 8.4**. Authentication is custom and uses Laravel `Auth::attempt()` instead of Fortify, with role-based redirects to a single dashboard page. The application uses a modular architecture for navigation and feature development.

Currently implemented modules: **Announcements, Attendance, Document Requests, DTR Export, Leave Tracking, Notifications (infra), Personnel Directory, Roles & Permissions, Travel Orders (stub)**.

---

## Key Architecture

### Backend
- `routes/web.php` — defines core auth routes and the dashboard route only. Module routes are never registered here.
- `routes/settings.php` — handles user profile and security settings. Self-service account deletion is intentionally disabled to preserve historical HR data integrity.
- `app/Core/Auth/Controllers/AuthController.php` — handles login/logout and role-based redirects.
- `app/Core/Services/ModuleRegistry.php` — singleton that aggregates navigation items and module metadata from all active modules. Navigation ordering is enforced by an explicit weight map in `getNavigation()`: Attendance (10), Announcements (20), Leave Tracking (30), Personnel Directory (40), Travel Orders (50), DTR Export (60), Roles & Permissions (70).
- `app/Core/Services/NotificationService.php` — cross-cutting notification infrastructure. Any module can import this service to dispatch notifications. See Notifications Infrastructure below.
- `app/Observers/UserObserver.php` — listens for User model `password` changes and auto-dismisses the default password notification via `NotificationService::dismissBySubtype()`.
- `app/Providers/ModuleServiceProvider.php` — bootstraps modules by automatically scanning for and registering `routes.php` and `navigation.php` files in each module directory under `app/Modules/`.
- `app/Providers/AppServiceProvider.php` — configures app defaults, including globally enabling `Model::preventLazyLoading(!app()->isProduction())` to catch N+1 queries during development.
- `app/Http/Middleware/HandleInertiaRequests.php` — shares common Inertia props. Navigation is filtered by role/permission here.
  - **Lazy Loading**: Heavy props like `appNotifications.unread_count` are lazy-loaded via closures for performance.
- `spatie/laravel-permission` — used for all role and permission management via `config/permission.php`.
- **Laravel 13 Attributes** — models use PHP attributes like `#[Fillable]` and `#[Hidden]` instead of protected properties.
- **Laravel Wayfinder** — auto-generates typed TypeScript functions for Laravel routes. All frontend route calls must use Wayfinder. Run `php artisan wayfinder:generate` after registering new routes. Supports `.form()` variants for Inertia `useForm`.

### Database
- **Local Development**: PostgreSQL via Docker Compose (Laravel Sail).
- **Testing**: PostgreSQL (`DB_CONNECTION=pgsql`, `DB_DATABASE=testing` in `phpunit.xml`). All queries must be PostgreSQL-compatible (e.g., use `ilike` for case-insensitive search, not SQLite `like`).
- **Production**: PostgreSQL via Supabase. All migrations must be PostgreSQL-compatible. See `RULES_AND_GUIDELINES.md` for migration rules.

### Frontend
- `resources/js/app.tsx` — initializes Inertia, adds global providers, and centralizes **layout resolution logic** based on page name (e.g., `settings/*` uses nested layouts).
- `resources/js/pages/dashboard.tsx` — dispatcher that renders role-specific overview components. Logic: `super_admin` → AdminOverview + HROverview; HR roles (`personnel.view` or `leave.manage`) → HROverview only; employees → EmployeeOverview only. `EmployeeOverview` is **never shown** to admin/HR roles.
- `resources/js/pages/auth/login.tsx` — login page (dual-field: email or employee number).
- `resources/js/pages/welcome.tsx` — public landing page.
- `resources/js/components/app-sidebar.tsx` — renders the core Dashboard link plus dynamic module links from `auth.navigation`.
  - **Persistence**: Sidebar open/close state is persisted via a `sidebar_state` cookie managed by `SidebarProvider`.
- `resources/js/components/app-sidebar-header.tsx` — global header with breadcrumbs + `NotificationBell`.
- `resources/js/components/app-header.tsx` — top-level header used by the `app` layout with navigation, user menu, and breadcrumbs.
- `resources/js/components/dynamic-icon.tsx` — renders Lucide icons from string names with a `LayoutDashboard` fallback.
- `resources/js/components/Pagination.tsx` — reusable pagination component. **Use this for all paginated views. Do not create module-specific pagination components.**
- `resources/js/components/EmployeeSearch.tsx` — reusable Headless UI Combobox-based employee search with autocomplete filtering by name and employee number. Supports an optional `error` prop for visual validation feedback.
- `resources/js/components/ActionButtons.tsx` — reusable action button component.
- **Inertia v3 Features**:
  - **Standalone HTTP**: `useHttp` hook used for background requests that don't trigger full page navigation (e.g., marking notifications as read).
  - **Strict Mode**: Enabled via `strictMode: true` in `app.tsx`.
  - **Instant Visits**: Used in navigation for near-instant transitions.

### CI/CD
- **GitHub Actions** workflows in `.github/workflows/`:
  - `tests.yml` — runs Pest test suite against PostgreSQL.
  - `lint.yml` — runs code linting checks.

---

## File Structure

```
app/
  Core/                          # Auth and shared services
    Auth/Controllers/AuthController.php
    Services/ModuleRegistry.php
    Services/NotificationService.php  # Cross-cutting notification infrastructure
  Modules/                       # Feature modules
    Announcements/
      Controllers/AnnouncementController.php
      Models/Announcement.php
      Requests/AnnouncementCreateRequest.php, AnnouncementUpdateRequest.php, AnnouncementPublishRequest.php
      Services/AnnouncementService.php
    Attendance/
      Controllers/AttendanceController.php, AttendanceManagementController.php
      Models/Attendance.php
      Requests/ClockInRequest.php, ClockOutRequest.php, StoreAttendanceRecordRequest.php, UpdateAttendanceRecordRequest.php
      Services/AttendanceService.php
    DTR/                         # Daily Time Record export (CS Form 48)
      Controllers/DTRController.php
      Requests/DTRGenerateRequest.php
      Services/DTRService.php
      navigation.php             # Sidebar: 'DTR Export', permission: attendance.view
    Leave/
      Controllers/LeaveController.php, LeaveCreditController.php, TardinessController.php, HolidayController.php, LeaveTypeController.php, LeaveStatusController.php
      Models/LeaveRequest.php, LeaveType.php, LeaveStatus.php, LeaveCredit.php, TardinessRecord.php, Holiday.php
      Requests/StoreLeaveRequest.php, UpdateLeaveRequest.php, UpdateLeaveCreditRequest.php
               StoreLeaveTypeRequest.php, UpdateLeaveTypeRequest.php, StoreLeaveStatusRequest.php, UpdateLeaveStatusRequest.php
               StoreHolidayRequest.php, UpdateHolidayRequest.php, UpdateTardinessRequest.php
      Services/LeaveService.php, LeaveCreditService.php
    Notifications/               # Hybrid: UI module for core notification infrastructure
      Controllers/NotificationController.php
      routes.php                 # No navigation.php (no sidebar link)
    Personnel/
      Controllers/PersonnelController.php, OrganizationController.php
      Models/Division.php, Unit.php, Position.php, EmploymentStatus.php
      Requests/EmployeeCreateRequest.php, EmployeeUpdateRequest.php, EmployeeRestoreRequest.php, StoreDivisionRequest.php, UpdateDivisionRequest.php, StoreUnitRequest.php, UpdateUnitRequest.php, StorePositionRequest.php, UpdatePositionRequest.php
      Services/EmployeeService.php, OrganizationService.php
    Roles/                       # Role and permission management
      Controllers/RoleController.php, UserRoleController.php
      Requests/RoleCreateRequest.php, RoleUpdateRequest.php, UserRoleSyncRequest.php
      Services/RoleService.php
    Travel/                      # Travel Orders (stub — under construction)
      Controllers/TravelOrderController.php
      navigation.php             # Sidebar: 'Travel Orders', permission: travel_order.create|travel_order.manage
  Notifications/                 # Laravel notification class
    GenericDatabaseNotification.php
  Observers/
    UserObserver.php             # Auto-dismisses default password notification
  Http/Middleware/
  Providers/ModuleServiceProvider.php

resources/js/
  pages/
    auth/                        # Login page
    dashboard.tsx                # Role dispatcher
    welcome.tsx
    settings/                    # Profile and security settings
    Modules/                     # Module pages
      Announcements/
        Index.tsx, Show.tsx, Manage.tsx, Create.tsx, Edit.tsx
      Attendance/
        ClockInOut.tsx, ManageRecords.tsx
      DTR/
        Index.tsx                # CS Form 48 export form (employee or HR admin view)
      Leave/
        Index.tsx, Show.tsx, Form.tsx, Calendar.tsx, Credits.tsx, Tardiness.tsx, Settings.tsx
        Components/LeaveNavigation.tsx, AdjustBalanceForm.tsx, CreditDetailSheet.tsx
      Notifications/
        Index.tsx                # Full paginated notification list
      Personnel/
        Index.tsx, Show.tsx, Create.tsx, Edit.tsx, Archived.tsx
        Organization/Index.tsx   # Division, Unit, Position management
      Roles/
        RolesIndex.tsx, UserRolesIndex.tsx
      Travel/
        Index.tsx                # Placeholder (under construction)
  components/
    dashboard/                   # AdminOverview, HROverview, EmployeeOverview, StatCard
    notifications/NotificationBell.tsx  # Global header bell icon + dropdown
    Announcements/               # AnnouncementCard, AnnouncementForm, RichTextEditor, TargetSelector
    Attendance/                  # AttendanceFilters, AttendanceHistory, AttendanceRecordModal, AttendanceStatus, ClockDisplay
    Leave/CreditPreview.tsx      # Module-specific components
    Personnel/                   # EmployeeCard, EmployeeForm, EmployeeTable, PositionCombobox
    Roles/                       # RoleModal, RoleAssignmentModal, RolesNavigation
    app-sidebar.tsx
    app-sidebar-header.tsx       # Global header with breadcrumbs + NotificationBell
    app-header.tsx               # Top-level header (navigation, user menu)
    dynamic-icon.tsx
    ActionButtons.tsx            # Reusable action buttons
    EmployeeSearch.tsx           # Shared employee search combobox
    Pagination.tsx               # Shared pagination
    ui/sliding-tabs.tsx          # Reusable segmented control with framer-motion
  layouts/                       # app, auth, settings layouts

routes/
  web.php                        # Core routes only
  settings.php
  console.php                    # Scheduled cleanup: notifications:prune (daily)

database/
  factories/                     # UserFactory, AnnouncementFactory, AttendanceFactory, DivisionFactory, PositionFactory, EmploymentStatusFactory
                                   # Note: UserFactory does NOT include position_id — use user->positions()->sync() after factory creation
  seeders/                       # DatabaseSeeder, RoleAndPermissionSeeder, PersonnelSeeder, LeaveTypeSeeder, LeaveStatusSeeder, HolidaySeeder
                                   # DTRSuperAdminAprilSeeder, OjtAttendanceSeeder (dev-only data seeders)

tests/
  Feature/                       # Root-level feature tests
    Modules/                     # Module-specific test subdirectories
      DTR/DTRExportTest.php
      LeaveCreditTest.php, LeaveDigitizationTest.php, LeaveTest.php
      Roles/
  Pest.php                       # Global Pest config (RefreshDatabase for Feature tests)

.github/workflows/
  tests.yml                      # CI: Pest tests against PostgreSQL
  lint.yml                       # CI: Code linting
```

---

## Implemented Modules

### Announcements Module (`app/Modules/Announcements/`)
- **Viewing**: All authenticated users with `announcements.view` see published announcements targeted to them (by division, position, individual, or "all") via `Index.tsx`.
- **Detail View**: `Show.tsx` renders a single announcement with rich HTML content (sanitized via DOMPurify). Unpublished announcements are only visible to users with `announcements.manage`.
- **Management**: Users with `announcements.manage` access the management dashboard (`Manage.tsx`) via an in-module button (top-right of the index page, not via the sidebar). Supports draft/publish workflow.
- **CRUD**: Full create, edit, publish, and soft delete. Rich text editor (Tiptap) with image and link support. Target audience selection (all, division, position, individual user).
- **Form Requests**: `AnnouncementCreateRequest`, `AnnouncementUpdateRequest`, `AnnouncementPublishRequest` for validation.
- **Service Layer**: `AnnouncementService` handles business logic: `getPublishedForUser()`, `getAllForHR()`, `create()`, `update()`, `publish()`, `delete()`.
- **Permissions**: `announcements.view` (all roles), `announcements.manage` (hr_staff, hr_admin, super_admin, division_head).

### Attendance Module (`app/Modules/Attendance/`)
- **Clock In/Out**: Server-side timestamp recording via `ClockInOut.tsx`. Three states: not clocked in, clocked in, completed.
- **History**: Recent 7-day activity table on the employee view.
- **Record Management**: HR roles with `attendance.logs.manage` can manually add missing records and edit clock-in/out timestamps via `ManageRecords.tsx` and `AttendanceRecordModal.tsx`. Management button is rendered in-module (top-right of ClockInOut page), not in the sidebar.
- **Soft Delete**: HR admins and super admins with `attendance.logs.manage` can soft delete records.
- **Filtering & Search**: Server-side filtering by status (Working/Incomplete/Completed), date range, and full-text employee name search. 500ms debounce with instant Enter key trigger. Paginated via `paginate(15)`.
- **Controllers**: `AttendanceController` (clock in/out, index), `AttendanceManagementController` (CRUD for records).
- **Permissions**: `attendance.clock` (employee, hr_staff, hr_admin, division_head), `attendance.view` (all roles), `attendance.logs.view` (hr_staff, hr_admin, super_admin), `attendance.logs.manage` (hr_admin, super_admin).
- **Timezone & Safari Compatibility**: Timezone manipulation is handled via `toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })` on the frontend to prevent day-shifting. iOS Safari's native time picker strips seconds; always pad with `:00` before submitting to satisfy Laravel's `date_format:Y-m-d H:i:s`.

### Leave Tracking Module (`app/Modules/Leave/`)
- **Dashboard** (`Index.tsx`): Paginated table of all leave requests with employee search (via `EmployeeSearch` component). Shows employee, leave type (with color dot), dates (specific or range), days requested, status badge, pay status, and who encoded it. "Encode" button to create new leave requests. For HR admins (`leave.manage`), the default filter view is set to "view all" rather than just their own.
- **Soft Deletes / Archiving**: Only users with `leave.manage` can archive or restore leave requests using dedicated action buttons that trigger a custom `Dialog` confirmation (native browser prompts are strictly avoided). Regular employees can view their own "Archived" requests via a status filter but cannot perform archiving actions.
- **Detail View** (`Show.tsx`): Detailed leave request view with CS Form 6 sections — leave information (type, status, pay status, filing details, commutation), schedule & duration (days breakdown, specific dates or range, pay status breakdown with days with/without pay), credit balances at filing (VL/SL), employee info sidebar, timeline (filed/received/approved dates), authorization (encoded by, approved by), attachments, and supporting documents.
- **Leave Form** (`Form.tsx`): Shared create/edit form. Supports date range or specific date picking, half-day logic, and automatic working-day calculation. Features reactive validation feedback with per-field error messages and red borders. Mandatory fields are marked with red asterisks (*). Attachment URLs are automatically prefixed with `https://` if a protocol is missing but a domain structure is detected. Data is transformed before submission using `useForm`'s `transform` method. Includes CS Form 6 digitization fields: salary, date filed, pay status breakdown (days with/without pay, others remarks), approved by official, leave detail type/remarks, VL/SL balance at filing, supporting documents, maternity allocation details.
- **Calendar** (`Calendar.tsx`): Visual monthly calendar showing leave requests per day. Employee filter via Headless UI Combobox. Color-coded by leave type. Click on a day to see details in a dialog.
- **Leave Credits** (`Credits.tsx`): Dual-view (uses standard `p-4` padding) — HR sees a paginated table of all employees with inline-editable earned/used credits; employees/division_heads see their own credits. Features a "Display Leave Types" toggle to choose which credits are visible in the table. This visibility state is persisted via `localStorage` and defaults to VL and SL. Includes `CreditDetailSheet` for viewing individual employee credit details and `AdjustBalanceForm` for balance adjustments.
- **Tardiness & Undertime** (`Tardiness.tsx`): Paginated table of employees with inline-editable tardiness/undertime counts per month (uses standard `p-4` padding). Features a custom counter UI with `+`/`-` buttons and a 500ms debounce for database updates to prevent rapid redundant requests.
- **Settings** (`Settings.tsx`): Admin-only tab (requires `leave.settings.manage`, uses standard `p-4` padding). CRUD for holidays (add/edit/delete by year), leave types (add with name/color/description/abbreviation/credit-behavior, toggle active/inactive), and leave statuses (add, toggle active/inactive). Deactivation pattern preferred over hard deletion to preserve historical integrity.
  - **Credit Behavior**: Leave types have a **tri-state** `is_cumulative` field (`true` = Cumulative, `false` = Non-Cumulative, `null` = N/A). The Settings UI uses a `<Select>` with string values `'true'`/`'false'`/`'null'` that are transformed to the appropriate PHP types on submission.
- **Navigation**: `LeaveNavigation.tsx` provides in-module tab navigation (Dashboard, Calendar, Credits, Tardiness, Settings). Settings tab is hidden from users without `leave.settings.manage`.
- **Service Layer**: `LeaveService` handles overlap validation, half-day validation, working-day calculation, and automatic credit deduction/restoration on approved leave changes. `LeaveCreditService` handles credit queries and updates.
- **Models**: `LeaveRequest` (with CS Form 6 digitization fields: `salary`, `date_filed`, `days_with_pay`, `days_without_pay`, `others_pay_remarks`, `approved_by_official`, `leave_detail_type`, `leave_detail_remarks`, `vl_balance_at_filing`, `sl_balance_at_filing`, `has_attachments`, `supporting_documents`, `maternity_allocation_details`, plus computed `pay_status` accessor), `LeaveType` (with `color_code`, `abbreviation`, `is_active`, `is_cumulative` tri-state nullable boolean), `LeaveStatus` (with `is_active`), `LeaveCredit` (per user, per type, per year), `TardinessRecord` (per user, per year/month, with `tardiness_count` and `undertime_count`), `Holiday`.
- **Controllers**: `LeaveController` (index, create, store, show, edit, update, destroy, calendar, settings), `LeaveCreditController` (index, show, update), `TardinessController`, `HolidayController`, `LeaveTypeController`, `LeaveStatusController`.
- **Permissions**: `leave.view` (all roles), `leave.manage` (hr_staff, hr_admin, super_admin), `leave.tardiness.manage` (hr_staff, hr_admin, super_admin), `leave.credits.view` (all roles), `leave.credits.manage` (hr_staff, hr_admin, super_admin), `leave.settings.manage` (hr_admin, super_admin).

### Personnel Directory Module (`app/Modules/Personnel/`)
- **Employee CRUD**: Full create, read, update, soft delete, and restore via `EmployeeService`. Extensive profile fields including Personal Information (including `middle_name`), Employment Details, Contact Information, and Government IDs/Credentials. Auto-calculates `age` based on birthdate.
- **`middle_name` field**: Present on the `users` table and `User` model (`#[Fillable]`). The `name` accessor on `User` concatenates `first_name`, `middle_name`, and `last_name`, filtering null values. `EmployeeService` includes `middle_name` in search queries. All Personnel forms (`Create`, `Edit`) expose this field.
- **Multi-Position Architecture**: Employees are linked to positions via a `position_user` **many-to-many pivot table** (not a `position_id` column on `users`). The pivot includes an `is_primary` boolean to distinguish the employee's primary role from secondary ones. The `User` model exposes a `positions()` `belongsToMany` relationship. This is the source of truth — never reference a `position_id` column on `users`.
- **Dynamic Position Creation**: The `PositionCombobox` React component (in `resources/js/components/Personnel/`) allows selecting existing positions or typing a new name to create one on-the-fly. The `EmployeeService` handles new position creation inside a database transaction when syncing pivot data.
- **Lookup Tables**: `divisions`, `units`, `positions`, `employment_statuses` — all use `is_active` flag, never hard deleted. `units` and `positions` are hierarchically nested under a `division`. Each user belongs to exactly one `division_id` and optionally one `unit_id` (primary assignment), but can hold multiple positions.
- **Organization Management**: Dedicated management dashboard for Divisions, Units, and Positions (`Organization/Index.tsx`) via `OrganizationController` and `OrganizationService`. Full CRUD with form requests for each entity type.
- **Dynamic Field Logic**: Position and Unit comboboxes filter by selected Division in create/edit forms. PRC Expiration is automatically enabled/disabled based on validation of a 7-digit PRC ID number.
- **Soft Delete & Restoration**: Archived employees viewable by `personnel.view` users (read-only at `Archived.tsx`). Restore restricted to `personnel.manage` users via `/personnel/archived`.
- **Search & Filtering**: By name, employee number, division, employment status. 500ms debounce with Enter key trigger.
- **Permissions**: `personnel.view` (hr_staff, hr_admin, super_admin), `personnel.manage` (hr_admin, super_admin).
- **Integration**: On employee creation, `EmployeeService` dispatches a high-priority non-dismissible "change default password" notification via `NotificationService`.

### Document Requests Module (`app/Modules/DocumentRequests/`)
- **Purpose**: Allows employees to request official HR documents (e.g., Certificate of Employment, Service Record) and allows HR to process, generate, and release/reject these requests.
- **Dashboard** (`Index.tsx`): Shared dashboard with role-based views. Employees see a list of their own requests and a button to create new ones. HR personnel with `document_requests.manage` see a comprehensive dashboard with unassigned, processing, and completed tabs to manage all requests across the organization. Uses Inertia `usePoll` (15s interval) to auto-refresh the queue, preventing stale data and concurrency conflicts.
- **Detail View** (`Show.tsx`): A detailed view for a single request. Shows request metadata, employee info, and a dynamic timeline of the request's status (Submitted -> Received -> Released / Rejected / Cancelled). The timeline conditionally displays formatted status reasons for rejected or cancelled requests.
- **Request Flow**: Requests start as `Pending`. HR can mark them as `Received`. Once ready, HR can `release` the document (generating a digital copy or marking it for physical pickup) or `reject` it with an optional reason. Employees can `cancel` their own pending requests with an optional reason.
- **Concurrency Safeguards**: Backend controllers (`markAsReceived`, `release`, `markAsPickedUp`) strictly validate the prerequisite status of the request (e.g. must be `Pending` to be marked `Received`). Denied state transitions flash errors to the UI via `Inertia::flash('toast', ...)`, fully integrated with the Sonner toast system.
- **Components**: Utilizes dedicated components like `DocumentRequestTimeline` for tracking status visually, `ReleaseModal` for handling the release process, and a custom `Dialog`-based Reject/Cancel modal equipped with a Textarea for capturing status reasons (native `window.confirm` is strictly avoided). Shared `Pagination.tsx` is used for lists.
- **Service Layer**: `DocumentRequestService` manages the business logic for creating requests, updating statuses, assigning requests to HR staff, and generating document previews/PDFs.
- **Controllers**: `DocumentRequestController` handles CRUD, status transitions, and document preview/generation. Rejection notifications dynamically include the reason directly in the notification message payload.
- **Permissions**: `document_requests.view` (all roles, access to own requests), `document_requests.manage` (HR staff/admin, access to all requests).

### Roles & Permissions Module (`app/Modules/Roles/`)
- **Role Management** (`RolesIndex.tsx`): Dashboard to view, create, update, and delete roles. Uses a paginated table.
- **User Role Assignment** (`UserRolesIndex.tsx`): Dashboard to view users and assign them specific roles. Includes employee search and role assignment modal.
- **Components**: `RoleModal.tsx` for creating/editing roles, `RoleAssignmentModal.tsx` for assigning roles to users, `RolesNavigation.tsx` for in-module tabs.
- **Controllers**: `RoleController`, `UserRoleController`.
- **Requests**: `RoleCreateRequest`, `RoleUpdateRequest`, `UserRoleSyncRequest`.
- **Service Layer**: `RoleService` handles role business logic.
- **Permissions**: Requires `roles.manage` (assigned to `super_admin`).

### DTR Export Module (`app/Modules/DTR/`)
- **Purpose**: Generates CS Form 48 (Daily Time Record) exports from attendance data. Accessible to all users with `attendance.view`. HR admins with `dtr.manage` can export for any employee; regular users can only export their own.
- **Export Formats**: PDF (via `barryvdh/laravel-dompdf`, rendered from `resources/views/exports/dtr_pdf.blade.php`) and CSV (raw data).
- **Official Hours**: Supports Regular (08:00 AM – 05:00 PM, Mon-Fri), Compressed (07:00 AM – 06:00 PM, Mon-Thu), and Custom modes. The compressed flag is auto-detected by `DTRService` when generating daily data (Fridays marked accordingly).
- **Daily Data Logic**: `DTRService::generateDailyData()` maps clock-in/out timestamps to AM/PM slots, marking holidays (from `Holiday` model), Saturdays, Sundays, and Fridays (compressed only) with labels.
- **Controller**: `DTRController` — `index()` renders the form, `export()` returns the file download response.
- **Sidebar**: Registered with `attendance.view` permission, ordered after Travel Orders (weight 60).
- **Tests**: `tests/Feature/Modules/DTR/DTRExportTest.php`.
- **Permissions**: Uses `attendance.view` for access (all roles), `dtr.manage` (hr_admin, super_admin) to export on behalf of others.

### Travel Orders Module (`app/Modules/Travel/`)
- **Status**: **Stub / Under Construction** — the index page renders a placeholder card. No meaningful backend logic yet.
- **Controller**: `TravelOrderController` (minimal).
- **Sidebar**: Registered with `travel_order.create|travel_order.manage` permission, ordered before DTR Export (weight 50).
- **Permissions**: `travel_order.create` (employee, division_head, super_admin), `travel_order.manage` (hr_staff, hr_admin, super_admin).

### Notifications Infrastructure (Hybrid: `app/Core/Services/` + `app/Modules/Notifications/`)
This is **infrastructure, not a feature module**. It is a hybrid: the dispatch/management service lives in `app/Core/Services/NotificationService.php` (consumed by all modules), while the UI routes and pages live in `app/Modules/Notifications/` (auto-registered by `ModuleServiceProvider`). It has **no sidebar link** — no `navigation.php` file exists.
- **Core Service**: `NotificationService` provides `notifyUser()`, `notifyDepartment()`, `notifyPosition()`, `notifyAll()`, `markAsRead()`, `markAllAsRead()`, `dismissBySubtype()`. Any module can inject this service to dispatch notifications. `notifyPosition()` queries the `positions` relationship (`whereHas`) — never the removed `position_id` column.
- **Notification Class**: A single `GenericDatabaseNotification` handles all types. The `type`, `subtype`, `priority`, and `dismissible` fields in the JSON payload differentiate behavior.
- **Bell Icon**: `NotificationBell.tsx` renders in the global `AppSidebarHeader` on every authenticated page. Shows unread count badge (from `appNotifications.unread_count` shared prop). Opens a dropdown with the 20 most recent notifications fetched via `fetch()` to `GET /notifications/recent` (JSON endpoint).
- **Full Page**: `GET /notifications` renders `Index.tsx` — a paginated list using shared `Pagination.tsx`.
- **Non-Dismissible Notifications**: System notifications (e.g., default password nudge) have `dismissible: false`. The API returns 403 if a user attempts to mark one as read. These are only removed by system events.
- **Auto-Dismissal**: `UserObserver` watches for password changes on the `User` model and calls `NotificationService::dismissBySubtype($user, 'default_password')` to automatically delete the password nudge.
- **Retention**: A scheduled `notifications:prune` command runs daily and deletes all notifications older than 1 year.
- **No Permissions Required**: All queries are scoped to `$request->user()` — no role/permission middleware needed.

### Storage Optimization & Maintenance Commands
- **Orphan Cleanup (`app/Console/Commands/CleanOrphanedFiles.php`)**: A dedicated Artisan command (`php artisan maintenance:clean-orphans`) that securely scans the configured S3 storage bucket for `avatars` and `document_requests/attachments`. It compares physical files against database records (including soft-deleted records) to identify and delete unreferenced files.
  - **Safeguards**: Requires a `--dry-run` flag if run locally, preventing accidental deletion of production files when local and production environments share the same bucket for testing purposes.

---

## Roles

| Role | Access Level |
|---|---|
| `super_admin` | Full system access, all modules, system settings, all permissions |
| `hr_admin` | All HR modules, leave settings, attendance logs manage, personnel view/manage, announcements view/manage, DTR manage, travel order manage |
| `hr_staff` | Attendance view + logs view, leave manage/credits/tardiness, personnel view, announcements view/manage, travel order manage |
| `division_head` | Clock in/out, attendance view, leave view, leave credits view, announcements view/manage, travel order create |
| `employee` | Clock in/out, attendance view, leave view, leave credits view, announcements view, travel order create (no `travel_order.create` in seeder — see note) |

> **Note**: `travel_order.create` is seeded for `division_head` and `super_admin`. Regular `employee` role currently does **not** have `travel_order.create` in `RoleAndPermissionSeeder`.

### All Permissions (from `RoleAndPermissionSeeder`)

| Permission | Roles |
|---|---|
| `attendance.clock` | employee, division_head, hr_staff, hr_admin, super_admin |
| `attendance.view` | employee, division_head, hr_staff, hr_admin, super_admin |
| `attendance.logs.view` | hr_staff, hr_admin, super_admin |
| `attendance.logs.manage` | hr_admin, super_admin |
| `leave.view` | employee, division_head, hr_staff, hr_admin, super_admin |
| `leave.manage` | hr_staff, hr_admin, super_admin |
| `leave.tardiness.manage` | hr_staff, hr_admin, super_admin |
| `leave.credits.view` | employee, division_head, hr_staff, hr_admin, super_admin |
| `leave.credits.manage` | hr_staff, hr_admin, super_admin |
| `leave.settings.manage` | hr_admin, super_admin |
| `personnel.view` | hr_staff, hr_admin, super_admin |
| `personnel.manage` | hr_admin, super_admin |
| `announcements.view` | employee, division_head, hr_staff, hr_admin, super_admin |
| `announcements.manage` | division_head, hr_staff, hr_admin, super_admin |
| `dtr.manage` | hr_admin, super_admin |
| `travel_order.create` | division_head, super_admin |
| `travel_order.manage` | hr_staff, hr_admin, super_admin |
| `roles.manage` | super_admin |

---

---

## Security Audit & Deployment Checklist
Based on a recent security audit, the following pending items MUST be addressed before or during production deployment:
- **Server-Side Sanitization**: Tiptap `content` is currently stored as raw HTML (e.g., Announcements). A server-side HTML Purifier (like `mews/purifier`) must be installed and applied to prevent stored XSS.
- **HTTP Security Headers**: A middleware (e.g., `SecurityHeaders.php`) must be added to enforce `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, and `Referrer-Policy`.
- **Session Security**: `SESSION_SECURE_COOKIE=true` must be explicitly defined in the production `.env`.
- **Production Cache Scripting**: Ensure deployment scripts explicitly run `php artisan config:cache`, `route:cache`, `view:cache`, `event:cache`, and `permission:cache-reset`.
- **Mass Assignment Refactor**: Remove `password` from the `User` model's `#[Fillable]` attribute; explicitly use `$user->forceFill(['password' => ...])` in services.
- **Data Isolation**: HR modules do not currently enforce cross-division scoping (i.e. division heads or HR staff seeing only their own division). Confirm business requirements and implement scoping if necessary.
