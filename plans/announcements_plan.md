## Announcements Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** System for HR to post announcements visible to employees.

---

## Steps

1. Migration for `announcements` table: id, title, content, posted_by, is_active (boolean, default true), priority (low/medium/high), created_at, updated_at, deleted_at.
2. Announcement model with soft deletes, relationships, scopes for active.
3. AnnouncementService for posting and retrieving announcements.
4. Requests: AnnouncementCreateRequest, AnnouncementUpdateRequest.
5. AnnouncementController with index, create, store, edit, update, destroy methods.
6. Create `app/Modules/Announcements/routes.php` with resource routes, protected by permissions. Use relative paths as the module name is automatically prefixed by the provider.
7. Create `app/Modules/Announcements/navigation.php` to register the Announcements sidebar links via `ModuleRegistry`. This file must return a closure that accepts `App\Core\Services\ModuleRegistry $registry` and calls `$registry->register([...])`.
8. Create frontend pages in `resources/js/pages/Modules/Announcements/` using **Laravel Wayfinder** for all routing. For paginated views, use the existing reusable `Pagination.tsx` component from `@/components/Pagination` — do NOT create a module-specific pagination component.
8. Components for announcement cards and rich text editor.
9. Permissions: 'announcements.view' (all), 'announcements.manage' (HR).
10. Tests for CRUD and visibility.
11. Pint and test.

---

## Relevant Files

- `app/Modules/Announcements/routes.php`
- `app/Modules/Announcements/navigation.php`
- Frontend in `resources/js/pages/Modules/Announcements/`

---

## Verification

1. Routes.
2. Tests.
3. HR posts, employees see.

---

## Decisions

- Soft deletes for announcements.

---

## Expected Behavior When Complete

### All Users View (`/announcements`)
- **List Page**: Paginated list of active announcements, sorted by priority then date. Shows title, excerpt, posted by, date. Click to expand full content.

### HR View (`/announcements/create`, `/announcements/edit`)
- **Create/Edit Page**: Form with title, content (rich text), priority, active toggle. Preview before posting.