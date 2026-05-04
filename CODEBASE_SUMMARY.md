# Codebase Summary

## Overview
This application is a **Laravel 13** backend with an **Inertia.js React** frontend. It strictly requires **PHP 8.4**. Authentication is custom and uses Laravel `Auth::attempt()` instead of Fortify, with role-based redirects to a single dashboard page. The application uses a modular architecture for navigation and feature development.

---

## Key Architecture

### Backend
- `routes/web.php` — defines core auth routes and the dashboard route only. Module routes are never registered here.
- `app/Core/Auth/Controllers/AuthController.php` — handles login/logout and role-based redirects.
- `app/Core/Services/ModuleRegistry.php` — singleton that aggregates navigation items and module metadata from all active modules.
- `app/Core/Services/NotificationService.php` — cross-cutting notification infrastructure. Any module can import this service to dispatch notifications. See Notifications Infrastructure below.
- `app/Observers/UserObserver.php` — listens for User model `password` changes and auto-dismisses the default password notification via `NotificationService::dismissBySubtype()`.
- `app/Providers/ModuleServiceProvider.php` — bootstraps modules by automatically scanning for and registering `routes.php` and `navigation.php` files in each module directory under `app/Modules/`.
- `app/Http/Middleware/HandleInertiaRequests.php` — shares common Inertia props: `auth.user`, `auth.roles`, `auth.permissions`, `auth.navigation`, `sidebarOpen`, and `notifications.unread_count` (lazy-loaded, global infrastructure exception).
- `spatie/laravel-permission` — used for all role and permission management via `config/permission.php`.
- **Laravel Wayfinder** — auto-generates typed TypeScript functions for Laravel routes. All frontend route calls must use Wayfinder. Run `php artisan wayfinder:generate` after registering new routes.

### Database
- **Local**: SQLite for development.
- **Production**: PostgreSQL via Supabase. All migrations must be PostgreSQL-compatible. See `rules_and_guidelines.md` for migration rules.

### Frontend
- `resources/js/app.tsx` — initializes Inertia, selects layouts by page name, and adds global providers.
- `resources/js/pages/dashboard.tsx` — dispatcher that renders role-specific overview components (`AdminOverview`, `HROverview`, `EmployeeOverview`).
- `resources/js/pages/auth/login.tsx` — login page (dual-field: email or employee number).
- `resources/js/pages/welcome.tsx` — public landing page.
- `resources/js/components/app-sidebar.tsx` — renders the core Dashboard link plus dynamic module links from `auth.navigation`. Settings and Logout are in the user dropdown at the bottom.
- `resources/js/components/dynamic-icon.tsx` — renders Lucide icons from string names with a `LayoutDashboard` fallback.
- `resources/js/components/Pagination.tsx` — reusable pagination component. **Use this for all paginated views. Do not create module-specific pagination components.**
- `resources/js/components/EmployeeSearch.tsx` — reusable Headless UI Combobox-based employee search with autocomplete filtering by name and employee number. Used across Leave module tabs (Dashboard, Credits, Tardiness) and available for any module needing employee selection.

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
    Attendance/
    Leave/
    Notifications/               # Hybrid: UI module for core notification infrastructure
    Personnel/
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
    Modules/                     # Module pages
      Announcements/
      Attendance/
      Leave/
      Notifications/             # Full paginated notification list
      Personnel/
  components/
    dashboard/                   # AdminOverview, HROverview, EmployeeOverview, StatCard
    notifications/               # NotificationBell (global header bell icon + dropdown)
    Attendance/                  # Module-specific components
    Personnel/
    app-sidebar.tsx
    app-sidebar-header.tsx       # Global header with breadcrumbs + NotificationBell
    dynamic-icon.tsx
    EmployeeSearch.tsx           # Shared employee search combobox
    Pagination.tsx               # Shared pagination
  layouts/                       # app, auth, settings layouts

routes/
  web.php                        # Core routes only
  settings.php
  console.php                    # Scheduled cleanup: notifications:prune (daily)
```

---

## Implemented Modules

### Announcements Module (`app/Modules/Announcements/`)
- **Viewing**: All authenticated users with `announcements.view` see published announcements targeted to them (by department, position, individual, or "all") via `Index.tsx`.
- **Detail View**: `Show.tsx` renders a single announcement with rich HTML content (sanitized via DOMPurify). Unpublished announcements are only visible to users with `announcements.manage`.
- **Management**: Users with `announcements.manage` access the management dashboard (`Manage.tsx`) via an in-module button (top-right of the index page, not via the sidebar). Supports draft/publish workflow.
- **CRUD**: Full create, edit, publish, and soft delete. Rich text editor (Tiptap) with image and link support. Target audience selection (all, department, position, individual user).
- **Form Requests**: `AnnouncementCreateRequest`, `AnnouncementUpdateRequest`, `AnnouncementPublishRequest` for validation.
- **Service Layer**: `AnnouncementService` handles business logic: `getPublishedForUser()`, `getAllForHR()`, `create()`, `update()`, `publish()`, `delete()`.
- **Permissions**: `announcements.view` (all roles except employee via sidebar; employee sees it too), `announcements.manage` (hr_staff, hr_admin, super_admin, department_head).

### Attendance Module (`app/Modules/Attendance/`)
- **Clock In/Out**: Server-side timestamp recording via `ClockInOut.tsx`. Three states: not clocked in, clocked in, completed.
- **History**: Recent 7-day activity table on the employee view.
- **Record Management**: HR roles with `attendance.manage` can manually add missing records and edit clock-in/out timestamps via `ManageRecords.tsx` and `AttendanceRecordModal.tsx`. Management button is rendered in-module (top-right of ClockInOut page), not in the sidebar.
- **Soft Delete**: HR admins and super admins with `attendance.delete` can soft delete records.
- **Filtering & Search**: Server-side filtering by status (Working/Incomplete/Completed), date range, and full-text employee name search. 500ms debounce with instant Enter key trigger. Paginated via `paginate(15)`.
- **Permissions**: `attendance.clock` (employee, hr_staff, hr_admin), `attendance.manage` (hr_staff, hr_admin, super_admin), `attendance.delete` (hr_admin, super_admin), `attendance.view_own` (employee, department_head) — allows viewing one's own attendance records only.

### Leave Tracking Module (`app/Modules/Leave/`)
- **Dashboard** (`Index.tsx`): Paginated table of all leave requests with employee search (via `EmployeeSearch` component). Shows employee, leave type (with color dot), dates (specific or range), days requested, status badge, and who encoded it. "Encode" button to create new leave requests.
- **Leave Form** (`Form.tsx`): Shared create/edit form. Supports date range or specific date picking, half-day logic, automatic working-day calculation (excludes weekends and holidays), and overlap validation.
- **Calendar** (`Calendar.tsx`): Visual monthly calendar showing leave requests per day. Employee filter via Headless UI Combobox. Color-coded by leave type. Click on a day to see details in a dialog.
- **Leave Credits** (`Credits.tsx`): Paginated table of employees with inline-editable earned/used credits per tracked leave type (Vacation, Sick, Special Privilege). Year filter and employee search. Credit deduction/restoration is handled automatically by `LeaveService` when leaves are approved/modified/deleted.
- **Tardiness & Undertime** (`Tardiness.tsx`): Paginated table of employees with inline-editable tardiness/undertime counts and minutes per month. Year and month filters with employee search.
- **Settings** (`Settings.tsx`): Admin-only tab (requires `leave.manage_settings`). CRUD for holidays (add/delete by year), leave types (add with name/color/description, toggle active/inactive), and leave statuses (add, toggle active/inactive). Deactivation pattern preferred over hard deletion to preserve historical integrity.
- **Navigation**: `LeaveNavigation.tsx` provides in-module tab navigation (Dashboard, Calendar, Credits, Tardiness, Settings). Settings tab is hidden from users without `leave.manage_settings`.
- **Service Layer**: `LeaveService` handles overlap validation, half-day validation, working-day calculation, and automatic credit deduction/restoration on approved leave changes.
- **Models**: `LeaveRequest`, `LeaveType` (with `color_code`, `is_active`), `LeaveStatus` (with `is_active`), `LeaveCredit` (per user, per type, per year), `TardinessRecord` (per user, per year/month), `Holiday`.
- **Controllers**: `LeaveController` (index, create, store, edit, update, destroy, calendar, settings), `LeaveCreditController`, `TardinessController`, `HolidayController`, `LeaveTypeController`, `LeaveStatusController`.
- **Permissions**: `leave.access_module` (hr_staff, hr_admin, super_admin), `leave.encode` (hr_staff, hr_admin, super_admin), `leave.manage_tardiness` (hr_staff, hr_admin, super_admin), `leave.manage_credits` (hr_staff, hr_admin, super_admin), `leave.manage_settings` (hr_admin, super_admin).

### Personnel Directory Module (`app/Modules/Personnel/`)
- **Employee CRUD**: Full create, read, update, soft delete, and restore via `EmployeeService`.
- **Lookup Tables**: `departments`, `positions`, `employment_statuses` — all use `is_active` flag, never hard deleted.
- **Dynamic Position Filtering**: Position dropdown filters by selected department in create/edit forms.
- **Soft Delete & Restoration**: Archived employees viewable by `hr_staff` (read-only). Restore restricted to `hr_admin` and `super_admin` via `/personnel/archived`.
- **Search & Filtering**: By name, employee number, department, employment status. 500ms debounce with Enter key trigger.
- **Permissions**: `personnel.view` (hr_staff, hr_admin, super_admin), `personnel.create`/`personnel.update` (hr_admin, super_admin), `personnel.delete` (super_admin only), `personnel.restore` (hr_admin, super_admin).
- **Integration**: On employee creation, `EmployeeService` dispatches a high-priority non-dismissible "change default password" notification via `NotificationService`.

### Notifications Infrastructure (Hybrid: `app/Core/Services/` + `app/Modules/Notifications/`)
This is **infrastructure, not a feature module**. It is a hybrid: the dispatch/management service lives in `app/Core/Services/NotificationService.php` (consumed by all modules), while the UI routes and pages live in `app/Modules/Notifications/` (auto-registered by `ModuleServiceProvider`). It has **no sidebar link** — no `navigation.php` file exists.
- **Core Service**: `NotificationService` provides `notifyUser()`, `notifyDepartment()`, `notifyPosition()`, `notifyAll()`, `markAsRead()`, `markAllAsRead()`, `dismissBySubtype()`. Any module can inject this service to dispatch notifications.
- **Notification Class**: A single `GenericDatabaseNotification` handles all types. The `type`, `subtype`, `priority`, and `dismissible` fields in the JSON payload differentiate behavior.
- **Bell Icon**: `NotificationBell.tsx` renders in the global `AppSidebarHeader` on every authenticated page. Shows unread count badge (from `notifications.unread_count` shared prop). Opens a dropdown with the 20 most recent notifications fetched via `fetch()` to `GET /notifications/recent` (JSON endpoint).
- **Full Page**: `GET /notifications` renders `Index.tsx` — a paginated list using shared `Pagination.tsx`.
- **Non-Dismissible Notifications**: System notifications (e.g., default password nudge) have `dismissible: false`. The API returns 403 if a user attempts to mark one as read. These are only removed by system events.
- **Auto-Dismissal**: `UserObserver` watches for password changes on the `User` model and calls `NotificationService::dismissBySubtype($user, 'default_password')` to automatically delete the password nudge.
- **Retention**: A scheduled `notifications:prune` command runs daily and deletes all notifications older than 1 year.
- **No Permissions Required**: All queries are scoped to `$request->user()` — no role/permission middleware needed.

---

## Roles

| Role | Access Level |
|---|---|
| `super_admin` | Full system access, all modules, system settings, all permissions |
| `hr_admin` | All HR modules, leave settings, attendance delete, personnel create/update/restore, announcements manage |
| `hr_staff` | Read + limited write on HR modules (attendance manage, leave encode/credits/tardiness, personnel view, announcements manage) |
| `department_head` | Clock in/out, view own attendance, announcements view/manage, travel order file |
| `employee` | Own records, clock in/out, announcements view, travel order file |

---

## UI Conventions
- **Fluid layouts** (`w-full`) for module indexes and data-heavy tables — avoid restrictive `max-w-*` containers for these views.
- **Debounced search**: 500ms debounce + instant Enter key trigger across all search inputs.
- **Pagination**: Always use the shared `Pagination.tsx` component with `meta` prop for "Showing X to Y of Z" info.
- **Employee Search**: Use the shared `EmployeeSearch.tsx` component for employee selection/filtering with autocomplete.
- **Error display**: Use `AlertError.tsx` for alert-style error banners and `InputError.tsx` for inline form field errors.
- **Icons**: Always use `lucide-react`. For dynamic icon rendering from strings, use `DynamicIcon.tsx`.
- **Management buttons**: Module management actions (e.g., "Manage Announcements", "Attendance Management") are rendered as in-module buttons (top-right of the module page), not as sidebar entries. They are gated by appropriate permissions (e.g., `announcements.manage`, `attendance.manage`).
- **Inertia History Management**: For subpage forms (like `Create`/`Edit` pages), append `router.clearHistory()` to the `onSuccess` callback of mutations. This ensures that when a user navigates back to the main list via the browser's "Back" button, Inertia forces a fresh data fetch rather than loading a stale cache. This eliminates the need for manual page refreshes while preserving the expected redirection flows.
- **Toast Notifications**: Use `sonner` for immediate visual feedback after successful data-modifying operations (POST, PUT, DELETE). Use `toast.success('Message')` within the `onSuccess` callback.