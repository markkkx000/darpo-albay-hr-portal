# Codebase Summary

## Overview
This application is a Laravel 13 backend with an Inertia.js React frontend. Authentication is custom and uses Laravel `Auth::attempt()` instead of Fortify, with role-based redirects to a single dashboard page.

## Key Architecture

- **Backend**
  - `routes/web.php` defines custom auth routes and the dashboard route.
  - `app/Core/Auth/Controllers/AuthController.php` handles login/logout and redirects.
  - `app/Http/Middleware/HandleInertiaRequests.php` shares common Inertia props including `auth`, `roles`, and `permissions`.
  - `config/permission.php` and `spatie/laravel-permission` are used for role/permission support.

- **Frontend**
  - `resources/js/app.tsx` initializes Inertia, selects layouts, and adds global providers.
  - `resources/js/pages/dashboard.tsx` renders role-based dashboard content.
  - `resources/js/pages/welcome.tsx` is the public landing page.
  - `resources/js/pages/auth/login.tsx` is the login page.
  - `resources/js/components/app-sidebar.tsx`, `app-header.tsx`, and `app-logo.tsx` provide the main app shell UI.
  - `resources/js/layouts/app/app-sidebar-layout.tsx` composes sidebar-based page layout.

## File Structure

- `app/` — Laravel application code and controllers
- `app/Core/` — custom authentication core classes
- `app/Http/Middleware/` — Inertia middleware and shared props
- `resources/js/pages/` — Inertia page components for dashboard, auth, settings, welcome
- `resources/js/components/` — reusable UI components like sidebar, header, logo, user menu
- `resources/js/layouts/` — page layout wrappers for app, auth, and settings
- `routes/` — route definitions, including `web.php` and `settings.php`

## Important Notes

- Shared Inertia data includes `auth.user`, `auth.roles`, `auth.permissions`, and `sidebarOpen`.
- The app uses role detection in the frontend to decide whether a user is `super_admin`, `hr_admin`/`hr_staff`, or `employee`.
- The dashboard is intended as the central place to render role-specific content.
- `app.tsx` chooses layouts by page name:
  - `welcome` uses no layout
  - `auth/*` uses `AuthLayout`
  - `settings/*` uses `AppLayout` plus `SettingsLayout`
  - all other pages use `AppLayout`
- `public/dar_logo.png` is used as the logo icon in the header/sidebar instead of the previous starter-kit icon.

## Dependencies

- PHP backend packages are managed in `composer.json`.
- Frontend packages are managed in `package.json`.
- `@headlessui/react` is kept available for component testing even if not currently used.

## Before Making Changes

1. Keep role-specific UI modular.
2. Avoid adding large conditionals inside one page file.
3. Prefer reusable components under `resources/js/components/`.
4. Prefer separate route pages for distinct module workflows.
5. Keep shared Inertia props stable to avoid frontend mismatch issues.
