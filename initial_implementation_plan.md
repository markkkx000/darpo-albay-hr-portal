# DARPO Albay HR Portal - Implementation Plan (Phase 1: Auth & Architecture)

This plan outlines the setup of a modular Laravel 13 + Inertia React portal with a dual-strategy authentication system and a PostgreSQL-compatible schema.

## User Review Required

> [!IMPORTANT]
> **Modular Strategy**: Features will reside in `app/Modules`. Core logic will be in `app/Core`. Navigation will be dynamically built via a shared service.
> **Dual Authentication**: Users can login with `email` or `employee_number`. The system will auto-detect the input type.
> **Custom Auth Implementation**: We will implement custom routes and controllers for authentication using Laravel's built-in `Auth::attempt()`, Form Requests, and manual session management. No Fortify or Breeze routes will be used, for total control over modular redirections.

## Proposed Changes

### 1. Foundation & Modular Architecture
---
We will establish a structure that allows features to be self-contained.

#### [NEW] [ModuleServiceProvider.php](file:///app/Providers/ModuleServiceProvider.php)
- Auto-registers routes, service providers, and navigation items from `app/Modules`.
- Scans subdirectories in `app/Modules` for a standard `routes.php`.

#### [NEW] [ModuleRegistry.php](file:///app/Core/Services/ModuleRegistry.php)
- A singleton service that collects navigation items from all active modules for the sidebar component.

### 2. Database & Models
---
PostgreSQL-compatible migrations using SQLite for local development.

#### [MODIFY] [0001_01_01_000000_create_users_table.php](file:///database/migrations/0001_01_01_000000_create_users_table.php)
- Add `employee_number` (unique, nullable).
- Replace `name` with `first_name` and `last_name`.
- Add `is_active` (boolean, default true).
- Add `deleted_at` (soft deletes).

#### [MODIFY] [User.php](file:///app/Models/User.php)
- Update `$fillable` for new fields.
- Add `HasRoles` trait from Spatie.
- Implement SoftDeletes.

### 3. Roles & Permissions (Spatie)
---
#### [NEW] [RoleAndPermissionSeeder.php](file:///database/seeders/RoleAndPermissionSeeder.php)
- Define `super_admin`, `hr_admin`, `hr_staff`, `employee`.
- Define module-specific permissions (`attendance.clock`, `leave.file`, etc.).

### 4. Authentication System (Phase 1)
---
Dual-field login logic implementation.

#### [NEW] [LoginRequest.php](file:///app/Core/Auth/Requests/LoginRequest.php)
- Handles validation for `login_field` (detects if email or employee number).

#### [NEW] [AuthController.php](file:///app/Core/Auth/Controllers/AuthController.php)
- Implements `login`, `logout` with rate limiting.
- Uses `Auth::attempt()` for credential validation and manual session handling.
- Logic: `if (filter_var($login, FILTER_VALIDATE_EMAIL))` use email, else use employee number.

#### [NEW] [routes/web.php](file:///routes/web.php)
- Defines all auth routes manually (`login`, `logout`, and protected dashboard routes).
- No Fortify routes or Fortify service provider usage.

### 5. Frontend (React 19 + Tailwind)
---
#### [NEW] [Login.tsx](file:///resources/js/Pages/Auth/Login.tsx)
- Modern UI with Tailwind.
- Single input field for Email / Employee ID.
- Seamless interaction using Inertia `useForm`.

#### [NEW] [Dashboard.tsx](file:///resources/js/Pages/Dashboard/Index.tsx)
- Role-specific landing page.

#### [NEW] [AppLayout.tsx](file:///resources/js/Components/Core/Layout/AppLayout.tsx)
- Main layout with a dynamic sidebar.
- Sidebar fetches navigation from `props.auth.navigation`.

## Open Questions

> [!NOTE]
> All previous open questions have been resolved. We are proceeding with Laravel 13 and a custom Auth implementation.

## Verification Plan

### Automated Tests
- `php artisan test --filter=AuthTest`: Test dual-login strategy.
- `php artisan test --filter=PermissionTest`: Verify role assignments.

### Manual Verification
- Login as Super Admin via Email.
- Login as Employee via Employee Number.
- Verify role-based navigation visibility in the sidebar.
