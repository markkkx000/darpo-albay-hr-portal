# Implementation Plan: Leave Credits UI Overhaul

This plan details the overhaul of the Leave Credits UI, ensuring full compliance with the project's **Rules and Guidelines**.

## User Review Required

> [!NOTE]
> **Data Terminology**: The `leave_credits` database table tracks `earned` (Total), `used` (Used), and `balance` (Available). The formula "Total = Available + Used" maps to `earned = balance + used`. In the UI, we will present these as "Available", "Used", and "Total".

> [!IMPORTANT]
> **Role-Based Views**: The `/leave/credits` route will dynamically render two different UIs:
> 1. **HR View (`leave.credits.manage`)**: A Master-Detail interface for adjusting balances across all employees.
> 2. **Employee View (`leave.credits.view`)**: A simple, read-only table displaying their own balances.

## Proposed Changes

---

### 1. Route & Middleware Updates
#### [MODIFY] [routes.php](file:///home/hradmin/darpo-albay-hr-portal/app/Modules/Leave/routes.php)
- **Current**: Credits routes are guarded by `permission:leave.credits.manage|leave.manage`. This blocks employees who only have `leave.credits.view`.
- **Change**: Split the group:
  - `GET /credits` (index) → `permission:leave.credits.view|leave.credits.manage|leave.manage` — allows all roles to access the page.
  - `GET /credits/{user}` (show) → keep restricted to `leave.credits.manage|leave.manage` — only HR can fetch other users' data.
  - `PUT /credits` (update) → keep restricted to `leave.credits.manage` — only HR can modify balances.

#### [MODIFY] [navigation.php](file:///home/hradmin/darpo-albay-hr-portal/app/Modules/Leave/navigation.php)
- **Current**: Still references the stale `leave.access_module` in the permission array. Clean up to just `leave.view`.

---

### 2. Backend Refactoring (Thin Controller)
#### [NEW] [UpdateLeaveCreditRequest.php](file:///home/hradmin/darpo-albay-hr-portal/app/Modules/Leave/Requests/UpdateLeaveCreditRequest.php)
- Move validation out of the controller per project rules.
- Validate: `user_id`, `leave_type_id`, `year`, `balance` (Available, numeric ≥ 0), `used` (numeric ≥ 0).
- Authorize via `leave.credits.manage` permission.

#### [NEW] [LeaveCreditService.php](file:///home/hradmin/darpo-albay-hr-portal/app/Modules/Leave/Services/LeaveCreditService.php)
- Extract all business logic from the controller:
  - `getCreditsForUser(User $user, int $year)` — fetch a single employee's credits.
  - `getAllCredits(Request $request, int $year)` — paginated list of all employees with credits (for HR).
  - `updateCredit(array $data)` — handles the `updateOrCreate` with `earned = balance + used` calculation.

#### [MODIFY] [LeaveCreditController.php](file:///home/hradmin/darpo-albay-hr-portal/app/Modules/Leave/Controllers/LeaveCreditController.php)
- Delegate all logic to `LeaveCreditService`.
- Use `UpdateLeaveCreditRequest` for validation on the `update` method.
- Update `index()`:
  - If user has `leave.credits.manage`: return paginated all-employees data (HR view).
  - Else (`leave.credits.view` only): return only the authenticated user's own credits (Employee view).
- Pass a `canManageCredits` boolean to the frontend to determine which UI to render.

---

### 3. Frontend: Leave Navigation Update
#### [MODIFY] [LeaveNavigation.tsx](file:///home/hradmin/darpo-albay-hr-portal/resources/js/pages/Modules/Leave/Components/LeaveNavigation.tsx)
- **Current**: "Leave Credits" tab only shows when `canManageCredits` (`leave.credits.manage`).
- **Change**: Show the tab when user has `leave.credits.view` OR `leave.credits.manage`. Update the condition:
  ```tsx
  const canViewCredits = permissions.includes('leave.credits.view') || permissions.includes('leave.credits.manage');
  ```

---

### 4. Frontend: Dual-View Credits Page
#### [MODIFY] [Credits.tsx](file:///home/hradmin/darpo-albay-hr-portal/resources/js/pages/Modules/Leave/Credits.tsx)
- Completely rewrite. Check `canManageCredits` prop from the controller to determine UI mode.

- **Employee Mode (Read-Only)**:
  - Render a clean, simple table:

    | Leave Type | Available | Used | Total |
    |---|---|---|---|
    | Vacation Leave | 13.500 | 1.500 | 15.000 |
    | Sick Leave | 10.000 | 0.000 | 10.000 |

  - Maps to `leaveType.name | credit.balance | credit.used | credit.earned`.
  - No edit controls, no employee search, no pagination.
  - Year selector remains for historical viewing.

- **HR Mode (Master-Detail)**:
  - **Employee List** with: Name, ID, compact badges for primary balances (e.g., `VL: 10.00`, `SL: 15.00`).
  - Year selector and `EmployeeSearch` for filtering.
  - Shared `Pagination` component for paginated views.
  - "View Details" button per row opens the `CreditDetailSheet`.
  - Use **Wayfinder** for all route calls (already using `LeaveRoutes`).
  - Use `sonner` for success toasts after updates.

---

### 5. New Components
#### [NEW] [CreditDetailSheet.tsx](file:///home/hradmin/darpo-albay-hr-portal/resources/js/pages/Modules/Leave/Components/CreditDetailSheet.tsx)
- Uses existing `sheet.tsx` UI primitive.
- Displays the selected employee's header (Name, ID, Division).
- Grid of **ALL** active leave types with Available / Used / Total breakdown.
- "Edit" toggle per leave type row to show the `AdjustBalanceForm`.

#### [NEW] [AdjustBalanceForm.tsx](file:///home/hradmin/darpo-albay-hr-portal/resources/js/pages/Modules/Leave/Components/AdjustBalanceForm.tsx)
- Inline form rendered within the Sheet when "Edit" is toggled.
- User inputs `Available` (balance) and `Used`. `Total` (earned) auto-calculates visually in real-time.
- On submit: PUT via `router.put()` with `preserveScroll: true` and `onSuccess` toast.
- Submit button disabled during `processing` state (per project rules).
- Use `router.clearHistory()` on success to ensure data freshness on back-navigation.

---

### 6. Update Credit Preview Component
#### [MODIFY] [CreditPreview.tsx](file:///home/hradmin/darpo-albay-hr-portal/resources/js/components/Leave/CreditPreview.tsx)
- This component is used in the Leave Request form (`Form.tsx`) to show real-time credit deductions during leave filing.
- It already fetches credits from `/credits/{user}` via `useHttp`.
- No structural changes needed — it correctly reads `balance` as "Available". Verify during testing that data flows correctly end-to-end after the backend refactor.

---

### 7. Wayfinder Regeneration
- Run `sail artisan wayfinder:generate` after route changes to ensure all TypeScript route functions are up to date.

## Verification Plan

### Automated Tests
- `sail artisan test --compact --filter=LeaveCredit` — verify backend logic (employee-only data, HR full data, update calculation).
- `sail artisan migrate:fresh --seed` — ensure clean migration with no errors.

### Manual Verification
- **Employee Login**: Verify the Credits tab appears in the Leave navigation, and the page shows a simple read-only table of their own balances.
- **HR Login**: Verify the employee list renders, the Sheet opens, and adjusting balances updates correctly.
- **Leave Filing**: Verify `CreditPreview` still shows correct "Available" balance during encoding.

### Rules Compliance
- `vendor/bin/pint --dirty --format agent` — run on all modified PHP files.
- `sail npm run build` — confirm frontend compiles cleanly.