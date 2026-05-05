# Implementation Plan: CS Form 6 Digitizer Enhancements

This plan outlines the enhancements required for the `Leave` module to support high-fidelity digitization of **CS Form 6** paper records. The goal is to accurately archive historical records while maintaining automatic credit deduction integrity.

## User Review Required

> [!IMPORTANT]
> - **Schema Changes**: Adding multiple new columns to `leave_requests`. Ensure this aligns with any other planned schema changes.
> - **Pay Status Logic**: The "Without Pay" status will skip credit deduction. Confirm if this is the desired behavior for ALL leave types when marked "Without Pay".
> - **Manual Override**: The auto-calculation of days will be bypassable if the paper form shows a different count.
> - **Tight Coupling**: This plan is linked with plans/leave_credits_enhancements_plan.md. Changes to `pay_status` here directly impact monthly accruals there.

## Proposed Changes

---

### 1. Database & Models

#### [NEW] 2026_04_30_000001_add_digitization_fields_to_leave_requests.php (database/migrations/2026_04_30_000001_add_digitization_fields_to_leave_requests.php)
Add the following columns to the `leave_requests` table:
- `salary`: `decimal(12, 2)`
- `date_filed`: `date`
- `pay_status`: `string` (default: `with_pay`)
- `approved_by_official`: `string` (nullable)
- `leave_detail_type`: `string` (nullable)
- `leave_detail_remarks`: `text` (nullable)
- `vl_balance_at_filing`: `decimal(8, 3)` (nullable)
- `sl_balance_at_filing`: `decimal(8, 3)` (nullable)
- `has_attachments`: `boolean` (default: false)
- `supporting_documents`: `json` (nullable, stores array of document names)
- `maternity_allocation_details`: `string` (nullable, for RA 11210 requirements)
- [DELETE] `attachment_path`: (Remove from feature, consider migration to drop or leave as legacy)

#### [MODIFY] LeaveRequest.php (app/Modules/Leave/Models/LeaveRequest.php)
- Add new fields to `$fillable` (`has_attachments`, `supporting_documents`, `maternity_allocation_details`, etc.).
- Add casts for `salary`, `date_filed`, `vl_balance_at_filing`, `sl_balance_at_filing`, `has_attachments`, `supporting_documents` (array), and `maternity_allocation_details`.

---

### 2. Backend Logic (Services & Requests)

#### [MODIFY] LeaveService.php (app/Modules/Leave/Services/LeaveService.php)
- **`storeLeaveRequest`**: Fetch current VL/SL balances for the user and store snapshots in `vl_balance_at_filing` and `sl_balance_at_filing`.
- **`handleCreditDeduction`**: Update logic to check `pay_status`. Skip deduction if `pay_status === 'without_pay'`.
- **`handleCreditRestoration`**: Ensure it also respects the `pay_status` (skip restoration if it was never deducted).
- **Accrual Integration**: Trigger `LeaveAccrualService@calculateMonthlyAccrual` whenever a `LeaveRequest` with `pay_status === 'without_pay'` is saved or updated.
- **[DELETE] Attachment Handling**: Remove logic for storing physical files in `store` and `update`.

#### [MODIFY] StoreLeaveRequest.php (app/Modules/Leave/Requests/StoreLeaveRequest.php)
- Add validation rules for `has_attachments` (boolean) and `supporting_documents` (array).
- Remove rules for `attachment`.
- **Conditional & Mandatory Validation**:
    - If `has_attachments` is true, ensure `supporting_documents` is not empty.
    - **Sick Leave**: If `leave_type_id` is Sick Leave and (`days_requested > 5` or `date_filed < start_date`), ensure "Medical Certificate" is selected in `supporting_documents`.
    - **Maternity**: If Maternity Leave, ensure "Proof of Pregnancy/Delivery" is selected.
    - **Paternity**: If Paternity Leave, ensure "Proof of Pregnancy/Delivery" AND "Marriage Contract" are selected.
    - **Solo Parent**: If Solo Parent Leave, ensure "Solo Parent Identification Card" is selected.
    - **Magna Carta for Women**: Ensure "Medical Certificate (Gynecological Surgery)" is selected.
    - **VAWC**: Ensure "Protection Order" or "Police Report" is selected.
    - **Study/Rehabilitation**: Ensure "Contract" or "Incident/Police Report" is selected as appropriate.
    - **30+ Days**: If `days_requested >= 30`, ensure "Clearance Form (CS Form 7)" is selected.

---

### 3. Frontend (UI/UX)

#### [MODIFY] Form.tsx (resources/js/pages/Modules/Leave/Form.tsx)
- **New Fields**: Add inputs for `salary`, `date_filed`, and a toggle/select for `pay_status`.
- **Dynamic Details**: Refactor the current `leave_details` logic to use the new `leave_detail_type` and `leave_detail_remarks` fields.
- **Supporting Documents Archival**:
    - Remove `Input type="file"`.
    - Add `has_attachments` checkbox.
    - Implement a dynamic list of checkboxes for `supporting_documents` that appears when `has_attachments` is true.
    - Map specific documents based on `typeName`:
        - **Sick**: Medical Certificate, Affidavit.
        - **Maternity/Paternity**: Proof of Pregnancy, Marriage Contract, Notice of Allocation.
        - **Solo Parent**: Solo Parent ID, Birth Certificate.
        - **Women (Magna Carta)**: Medical Certificate (Gynecological Surgery).
        - **VAWC**: Protection Order, Police Report.
        - **Study/Rehabilitation**: Contract, Incident Report, Written Concurrence.
    - Automatically include "Clearance Form (CS Form 7)" if `days_requested >= 30`.
- **Credit Preview Component**:
    - Add a side panel or inline card showing `Available`, `Requested`, and `Remaining` credits.
    - **Monetization Warning**: If `leave_type` is Monetization and `remaining_vl_balance < 15.000`, show a high-severity warning (CSC rule).
- **Maternity Allocation**:
    - If "Notice of Allocation (CS Form 6a)" is checked in `supporting_documents`, show an input for `maternity_allocation_details` (Name of spouse/beneficiary).
- **Manual Override**: Ensure the `days_requested` input remains editable and doesn't get immediately overwritten by the `useEffect` if the user manually adjusts it.

---

### 4. Route Synchronization

#### [Artisan] `php artisan wayfinder:generate`
Run this after migrations and controller updates to ensure TypeScript types are synchronized.

## Verification Plan

### Automated Tests
- `php artisan test --filter=LeaveServiceTest`
- `php artisan test --filter=LeaveRequestTest`
- Create a new test case for the "Without Pay" credit skip logic.

### Manual Verification
- **Scenario 1**: Encode a Sick Leave and check "Has Attachments". Verify that "Medical Certificate" and "Affidavit" options appear.
- **Scenario 2**: Encode any leave for 31 days. Verify that "Clearance Form (CS Form 7)" is automatically included or flagged.
- **Scenario 3**: Encode an Approved leave as "Without Pay". Verify `leave_credits` table is NOT updated.
- **Scenario 4**: Verify that all new archival fields (`salary`, `date_filed`, `supporting_documents`) are correctly saved to the database.
