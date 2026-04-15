## Travel Order Tracking Implementation Plan: DO NOT EXECUTE YET (STILL NEEDS REVIEW)

**Reminder:** Follow the rules and checklist in `adding_modules.md` strictly to avoid shortcuts. Each module must adhere to the modular architecture, with backend components in `app/Modules/{ModuleName}/`, routes in separate files, thin controllers delegating to services, validation via form requests, PostgreSQL-compatible migrations, soft deletes for entities, frontend pages under `resources/js/pages/Modules/{ModuleName}/`, no large conditionals in `dashboard.tsx`, and permissions seeded in `RoleAndPermissionSeeder`.

**TL;DR:** Track travel orders with filing and status.

---

## Steps

1. Migration for `travel_orders` table: id, user_id, destination, purpose, start_date, end_date, estimated_cost, status (pending/approved/rejected), approved_by (nullable), approved_at (nullable), created_at, updated_at, deleted_at.
2. TravelOrder model with relationships, soft deletes, scopes.
3. TravelOrderService for filing, approving, calculating duration.
4. Requests: TravelOrderCreateRequest, TravelApprovalRequest.
5. TravelOrderController with index, create, store, show, approve, reject.
6. Routes/travel.php with routes protected by permissions.
7. Frontend: pages/Modules/Travel/Index.tsx (my orders), FileTravel.tsx, ManageTravel.tsx (HR).
8. Components for travel forms and status.
9. Permissions: 'travel.file' (employees), 'travel.view_all', 'travel.approve' (HR).
10. Tests.
11. Pint and test.

---

## Relevant Files

- In `app/Modules/Travel/`

---

## Verification

1. Routes.
2. Tests.
3. Filing and tracking works.

---

## Decisions

- Soft deletes.

---

## Expected Behavior When Complete

### Employee View (`/travel`)
- **Index Page**: List of own travel orders with status, dates, destination. Pending yellow, approved green, rejected red.
- **File Travel Page**: Form for destination, purpose, dates, cost estimate. Validation for future dates.

### HR View (`/travel/manage`)
- **Manage Page**: Table of pending orders. Columns: employee, destination, dates, purpose. Actions: Approve/Reject.
- History tab for approved/rejected.