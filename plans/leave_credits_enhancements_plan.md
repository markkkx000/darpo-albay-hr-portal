# Implementation Plan: CSC-Compliant Leave Credit Enhancements

This plan outlines the enhancements to the `Leave` module's credit system to comply with **Civil Service Commission (CSC)** rules. It focuses on monthly accrual for VL/SL based on "actual service" and fixed entitlements for other leave types.

## User Review Required

> [!IMPORTANT]
> - **Accrual Basis**: Confirm that "Actual Service" will be calculated as `(Working Days) - (LWOP Days) - (Tardiness/Undertime Days)`.
> - **24-Day Rule**: Confirm that the system should strictly follow the CSC Table of Computations (e.g., 15 days service = 0.625 credits).
> - **Entitlement Reset**: Confirm if annual entitlements (Solo Parent, SPL) should reset automatically on January 1st or on the employee's hire date anniversary.

## Proposed Changes

---

### 1. Database Schema Updates

#### [MODIFY] leave_types (database/migrations/xxxx_xx_xx_xxxxxx_add_category_to_leave_types.php)
Add configuration columns to `leave_types`:
- `accrual_type`: `enum(['monthly', 'annual', 'event'])`.
- `base_entitlement`: `decimal(8, 3)` (e.g., 7.000 for Solo Parent).
- `requires_minimum_service`: `integer` (months of service required before entitlement is granted, e.g., 6 for Solo Parent).
- `is_cumulative`: `boolean` (default: false - for VL/SL it's true, for SPL/Solo Parent it's false).

#### [NEW] leave_accrual_logs (database/migrations/xxxx_xx_xx_xxxxxx_create_leave_accrual_logs.php)
Create a table to track monthly credit earnings:
- `user_id`, `month`, `year`, `vl_earned`, `sl_earned`, `actual_service_days`.

---

### 2. Backend Logic (Services)

#### [NEW] LeaveAccrualService.php (app/Modules/Leave/Services/LeaveAccrualService.php)
Implement the core CSC logic:
- **`calculateMonthlyAccrual(User $user, $month, $year)`**:
    - Sum total working days in month.
    - Subtract `days_requested` from any `LeaveRequest` where `pay_status === 'without_pay'` (LWOP).
    - Subtract decimal days from `TardinessRecord` (Combine `tardiness_minutes` and `undertime_minutes`; 480 mins = 1 day).
    - Map the result to the CSC 24-Day Rule table.
- **`grantAnnualEntitlements(User $user)`**:
    - Check service duration for Solo Parent eligibility.
    - Reset SPL and Solo Parent credits to full balance at year-start.

#### [MODIFY] LeaveService.php (app/Modules/Leave/Services/LeaveService.php)
- Update `handleCreditDeduction` to ensure it only deducts from `balance` if the `LeaveType` is cumulative (VL/SL) or has a fixed entitlement.
- Integrate with `LeaveAccrualService` to trigger a re-calculation of current month's accrual if a leave is saved as "Without Pay".

---

### 3. Cross-Check with `leave_form_enhancements_plan.md`

> [!CAUTION]
> **Tight Coupling Requirements**:
> 1. **LWOP Impact**: Any `LeaveRequest` marked `without_pay` in the Digitizer Form (resources/js/pages/Modules/Leave/Form.tsx) MUST trigger a refresh of the `LeaveAccrualService` for that specific month.
> 2. **Credit Preview**: The Credit Preview Component (resources/js/pages/Modules/Leave/Form.tsx) must distinguish between "Earned" (accrued) and "Entitled" (fixed) balances.
> 3. **Salary Data**: The `salary` field in the form is required for future terminal leave/monetization calculations but does not impact current accrual.

---

### 4. Implementation Task List

- [ ] Create migration for `leave_types` configuration and `leave_accrual_logs`.
- [ ] Implement `LeaveAccrualService` with the CSC 24-Day Rule mapping.
- [ ] Create a scheduled job (console command) to run accrual monthly.
- [ ] Update `LeaveCreditController` to return detailed breakdown (Earned vs Entitled).
- [ ] Add "Accrual History" tab to the `Credits.tsx` view in the Leave module.

## Verification Plan

### Automated Tests
- `php artisan test --filter=LeaveAccrualServiceTest`
- **Test Case**: User with 5 days LWOP in a 30-day month should earn less than 1.25 credits.
- **Test Case**: Solo Parent leave granted only after 6 months service.

### Manual Verification
- **Scenario 1**: Encode an LWOP leave and verify the `actual_service_days` in the accrual log decreases.
- **Scenario 2**: Verify SPL resets to 3.000 on January 1st.
- **Scenario 3**: Verify Paternity leave is granted per event and not as a monthly accrual.
