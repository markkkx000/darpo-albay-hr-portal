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

---

## File Structure

```
app/
  Core/                          # Auth and shared services
    Auth/Controllers/AuthController.php
    Services/ModuleRegistry.php
    Services/NotificationService.php  # Cross-cutting notification infrastructure
  Modules/                       # Feature modules
    Attendance/
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
      Attendance/
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
    Pagination.tsx               # Shared pagination
  layouts/                       # app, auth, settings layouts

routes/
  web.php                        # Core routes only
  settings.php
  console.php                    # Scheduled cleanup: notifications:prune (daily)
```

---

## Implemented Modules

### Attendance Module (`app/Modules/Attendance/`)
- **Clock In/Out**: Server-side timestamp recording via `ClockInOut.tsx`. Three states: not clocked in, clocked in, completed.
- **History**: Recent 7-day activity table on the employee view.
- **Record Management**: HR roles with `attendance.manage` can manually add missing records and edit clock-in/out timestamps via `ManageRecords.tsx` and `AttendanceRecordModal.tsx`.
- **Soft Delete**: HR admins and super admins with `attendance.delete` can soft delete records.
- **Filtering & Search**: Server-side filtering by status (Working/Incomplete/Completed), date range, and full-text employee name search. 500ms debounce with instant Enter key trigger. Paginated via `paginate(15)`.
- **Permissions**: `attendance.clock` (employee, hr_staff, hr_admin), `attendance.manage` (hr_staff, hr_admin, super_admin), `attendance.delete` (hr_admin, super_admin).

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
| `super_admin` | Full system access, all modules, system settings |
| `hr_admin` | All HR modules, no system settings |
| `hr_staff` | Read + limited write on HR modules |
| `employee` | Own records, clock in/out, announcements |

---

## UI Conventions
- **Fluid layouts** (`w-full`) for module indexes and data-heavy tables — avoid restrictive `max-w-*` containers for these views.
- **Debounced search**: 500ms debounce + instant Enter key trigger across all search inputs.
- **Pagination**: Always use the shared `Pagination.tsx` component.
- **Error display**: Use `AlertError.tsx` for alert-style error banners and `InputError.tsx` for inline form field errors.
- **Icons**: Always use `lucide-react`. For dynamic icon rendering from strings, use `DynamicIcon.tsx`.