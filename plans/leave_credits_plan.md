## Leave Credits Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Manage leave credits per employee, calculate balances, allow HR overrides.

---

## Steps

1. Migration for `leave_credits` table: id, user_id, leave_type, earned (decimal), used (decimal), balance (calculated), year, created_at, updated_at. No soft deletes as credits are historical records.
2. LeaveCredit model with relationships, scopes for year/type.
3. LeaveCreditService for calculating balances, earning credits (e.g., monthly accrual), deducting on approval, and manual adjustments.
4. Requests: LeaveCreditAdjustmentRequest for HR overrides.
5. LeaveCreditController with index (own credits), show, update (HR adjustments).
6. Create `app/Modules/LeaveCredits/routes.php` with resource routes, protected by permissions. Use relative paths as the module name is automatically prefixed by the provider.
7. Create `app/Modules/LeaveCredits/navigation.php` to register the Leave Credits sidebar links via `ModuleRegistry`. This file must return a closure that accepts `App\Core\Services\ModuleRegistry $registry` and calls `$registry->register([...])`.
8. Create frontend pages in `resources/js/pages/Modules/LeaveCredits/` using **Laravel Wayfinder** for all routing. For paginated views, use the existing reusable `Pagination.tsx` component from `@/components/Pagination` — do NOT create a module-specific pagination component.
8. Components for credit displays and adjustment forms.
9. Permissions: 'leave_credits.view_own' (employees), 'leave_credits.view_all', 'leave_credits.manage' (HR).
10. Tests for calculations and adjustments.
11. Pint and test.

---

## Relevant Files

- Migration.
- `app/Modules/LeaveCredits/routes.php`
- `app/Modules/LeaveCredits/navigation.php`
- Model, service, requests, controller in `app/Modules/LeaveCredits/`
- Frontend pages.
- Seeder.
- Tests.

---

## Verification

1. Routes.
2. Tests.
3. Balances calculate correctly, HR can override.

---

## Decisions

- Separate from Leave Tracking for modularity.
- Soft deletes? Not necessary as credits are calculable.

---

## Expected Behavior When Complete

### Employee View (`/leave-credits`)
- **View Credits Page**: Table showing current year's credits by type: earned, used, balance. Previous years archived.

### HR View (`/leave-credits/manage`)
- **Manage Page**: Search for employee, view their credits, adjust earned/used with form. Confirmation for changes.
- Balances auto-calculate and update.