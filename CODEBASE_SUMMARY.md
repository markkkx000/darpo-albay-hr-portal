# Codebase Summary

## Overview
This application is a Laravel 13 backend with an Inertia.js React frontend. It strictly requires **PHP 8.4**. Authentication is custom and uses Laravel `Auth::attempt()` instead of Fortify, with role-based redirects to a single dashboard page. The application uses a modular architecture for navigation and feature development.

## Key Architecture

- **Backend**
  - `routes/web.php` defines custom auth routes and the dashboard route.
  - `app/Core/Auth/Controllers/AuthController.php` handles login/logout and redirects.
  - `app/Core/Services/ModuleRegistry.php` (Singleton) aggregates navigation items and module metadata.
  - `app/Providers/ModuleServiceProvider.php` bootstraps modules, automatically scanning for and registering `routes.php` and `navigation.php` files in each module directory.
  - `app/Http/Middleware/HandleInertiaRequests.php` shares common Inertia props including `auth` (with `user`, `roles`, `permissions`, and `navigation`), and `sidebarOpen`.
  - `config/permission.php` and `spatie/laravel-permission` are used for role/permission support.
  - **Laravel Wayfinder**: Used to auto-generate typed functions for Laravel controllers and routes, significantly improving frontend-backend communication safety.

- **Database**
  - **Local Development**: SQLite is used for local development.
  - **Production**: All migrations must be PostgreSQL-compatible for production deployment on Supabase. See migration guidelines in `adding_modules.md`.

- **Frontend**
  - `resources/js/app.tsx` initializes Inertia, selects layouts, and adds global providers.
  - `resources/js/pages/dashboard.tsx` acts as a dispatcher for role-specific dashboard overviews (`AdminOverview`, `HROverview`, `EmployeeOverview`).
  - `resources/js/pages/welcome.tsx` is the public landing page.
  - `resources/js/pages/auth/login.tsx` is the login page.
  - `resources/js/components/app-sidebar.tsx` renders a unified sidebar merging the core Dashboard link with dynamic module links. Settings and Logout are available via the user dropdown menu at the bottom of the sidebar.
  - `resources/js/components/dynamic-icon.tsx` renders Lucide icons from string names with a fallback mechanism.

## File Structure

- `app/Core/` — custom authentication core and shared services like `ModuleRegistry`.
- `app/Modules/` — feature-specific modules. Currently only `Attendance` exists.
  - **Attendance Module**: Core feature providing Clock In/Out and activity history. Each module contains its own `routes.php` (for auto-registration) and `navigation.php`.
- `app/Http/Middleware/` — Inertia middleware and shared props.
- `resources/js/pages/` — Inertia page components for dashboard, auth, settings, welcome.
- `resources/js/components/` — reusable UI components.
  - `dashboard/` — role-specific overviews and shared `StatCard`.
- `resources/js/layouts/` — page layout wrappers for app, auth, and settings.
- `routes/` — core route definitions, including `web.php` and `settings.php`.

## Important Notes

- Shared Inertia data includes `auth.user`, `auth.roles`, `auth.permissions`, `auth.navigation`, and `sidebarOpen`.
- **Dynamic Navigation**: Every new module must include a `navigation.php` file in its directory to appear in the sidebar. This file should return a closure that registers items with the `ModuleRegistry`.
- **Dashboard Componentization**: Complex role-specific logic is moved into dedicated components in `resources/js/components/dashboard/` to keep `Dashboard.tsx` clean.
- **Attendance Features**:
    - **Clock In/Out**: Real-time status tracking via `ClockInOut.tsx`.
    - **History**: Recent activity history shown in a table format.
    - **Record Management**: HR roles with attendance.manage can manually add missing records and edit existing clock-in/out timestamps via `ManageRecords.tsx` and `AttendanceRecordModal.tsx`. HR admins and super admins with attendance.delete can soft delete records. The "Attendance Management" sidebar link is dynamically registered via `navigation.php` and only visible to authorized roles.
- `app.tsx` chooses layouts by page name.
- `public/dar_logo.png` is used as the logo icon in the header/sidebar.

## Dependencies

- **PHP 8.4** (Mandatory for Laravel 13 compatibility).
- PHP backend packages are managed in `composer.json`.
- Frontend packages are managed in `package.json`.
- `lucide-react` is used for all icons, supporting both static and dynamic rendering.

## Before Making Changes

1. Keep role-specific UI modular.
2. Avoid adding large conditionals inside one page file; favor the dispatcher pattern used in `Dashboard.tsx`.
3. Prefer reusable components under `resources/js/components/`.
4. Register module navigation items via `navigation.php` rather than hardcoding in `AppSidebar.tsx`.
5. Keep shared Inertia props stable to avoid frontend mismatch issues.
