## Travel Order Tracking Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `RULES_AND_GUIDELINES.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in `routes.php` (auto-registered), thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for real-world entities, and frontend pages under `resources/js/pages/Modules/{ModuleName}/`. Ensure to use Laravel 13 PHP attributes (`#[Fillable]`), `Laravel Wayfinder` for routing, `sonner` for toast notifications, and properly handle Inertia History via `router.clearHistory()` on inline mutations.

**TL;DR:** Track travel orders with filing and status.

---

## Steps

1. Migration for `travel_orders` table: id, user_id, destination, purpose, start_date, end_date, estimated_cost, status (pending/approved/rejected), approved_by (nullable), approved_at (nullable), created_at, updated_at, deleted_at. Ensure PostgreSQL compatibility (e.g., proper foreign keys).
2. TravelOrder model with relationships, soft deletes, scopes, and PHP 8.4 attributes (`#[Fillable]`).
3. TravelOrderService for filing, approving, rejecting, and calculating duration. Keep the controller thin.
4. Form Requests: `TravelOrderCreateRequest`, `TravelApprovalRequest`. Ensure validation happens here and not in the controller. Use request-level `authorize()` checks if necessary.
5. TravelOrderController with `index`, `create`, `store`, `show`, `approve`, `reject`.
6. Create `app/Modules/Travel/routes.php` with resource routes, protected by route-level middleware (`permission:travel_order.create`, `permission:travel_order.manage`).
7. Create `app/Modules/Travel/navigation.php` to register the Travel sidebar links via `ModuleRegistry`. Return a closure accepting `$registry`.
8. Create frontend pages in `resources/js/pages/Modules/Travel/` using **Laravel Wayfinder** for all routing. 
    - For paginated views, use the existing reusable `Pagination.tsx`.
    - Apply `matte-card elev-2` for card containers. 
    - Use `EmployeeSearch.tsx` combobox if needed.
    - Implement `disabled={isProcessing}` loading states on forms and action buttons.
    - Call `router.clearHistory()` upon successful create/approve/reject mutations to handle state refresh.
9. Seed Permissions: Ensure 'travel_order.create' and 'travel_order.manage' exist in `RoleAndPermissionSeeder`.
10. Notifications: Use `NotificationService` to dispatch notifications to the relevant employee upon approval/rejection.
11. Write Pest feature tests in `tests/Feature/Modules/Travel/` against PostgreSQL using `RefreshDatabase`.
12. Run `vendor/bin/pint --dirty --format agent` and test.

---

## Relevant Files

- `app/Modules/Travel/routes.php`
- `app/Modules/Travel/navigation.php`
- Module files in `app/Modules/Travel/`
- Frontend files in `resources/js/pages/Modules/Travel/`
- `database/seeders/RoleAndPermissionSeeder.php`

---

## Verification

1. Routes auto-registered via `ModuleServiceProvider`.
2. Feature tests pass against PostgreSQL (`DB_CONNECTION=pgsql`).
3. Filing and tracking works in the UI.
4. Wayfinder routes are correctly typed and working.
5. Toast notifications (`sonner`) show on success.

---

## Decisions

- Soft deletes apply to `travel_orders` since it's a real-world entity.
- No new lookups specified, but if any are added, they must use `is_active = false` instead of soft deletes.

---

## Expected Behavior When Complete

### Employee View (`/travel`)
- **Index Page**: List of own travel orders with status, dates, destination. Fluid `w-full` layout. Pending yellow, approved green, rejected red.
- **File Travel Page**: Form for destination, purpose, dates, cost estimate. Validation for future dates.

### HR View (`/travel/manage`)
- **Manage Page**: Table of pending orders. Columns: employee, destination, dates, purpose. Actions: Approve/Reject as in-module buttons.
- History tab for approved/rejected.