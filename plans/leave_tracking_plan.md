# Leave Tracking & Credits Implementation Plan - GOOD TO GO

Provide a comprehensive system for encoding leave applications submitted via paper forms (specifically aligned with Philippine CS Form No. 6), including leave history calendars, tardiness/undertime tracking, leave credit balances, and dynamic lookups (Holidays, Leave Types, Leave Statuses). 

**Module Access Restriction:** The entire module is restricted to `super_admin`, `hr_admin`, and `hr_staff`. No regular employees can access this module.


## Proposed Changes

### Database Migrations & Models

#### `leave_types` Table
- **Columns**: `id`, `name` (unique), `description`, `color_code` (for calendar UI), `is_active` (boolean, default true), timestamps. (No soft deletes, use `is_active` per guidelines).
- **Seeder**: Seed the 14 specified leave types (Vacation, Sick, etc.) with professional color codes assigned by me.

#### `leave_statuses` Table
- **Columns**: `id`, `name` (unique), `is_active` (boolean, default true), timestamps. (No soft deletes).
- **Seeder**: Seed with: "Approved", "For Signature", "No Filed Leave", "Cancelled".

#### `holidays` Table
- **Columns**: `id`, `name`, `date` (date), timestamps.
- **Behavior**: Grouped by Year.

#### `leave_credits` Table (Merged from Leave Credits Plan)
- **Columns**: `id`, `user_id`, `leave_type_id`, `earned` (decimal), `used` (decimal), `balance` (decimal), `year` (integer), timestamps.
- **Behavior**: Tracks available credits per year per type for the employee. Updated automatically on leave approval or manually via HR overrides.

#### `leave_requests` Table (The Log / CS Form No. 6)
- **Columns**: `id`, `user_id`, `leave_type_id`, `leave_status_id`, `start_date`, `end_date`, `days_requested` (decimal), `date_received` (nullable date, maps to 'Date of Filing'), `date_approved` (nullable date), `leave_details` (string/json, maps to 'Details of Leave' e.g. Within Philippines, Out Patient, etc.), `commutation_requested` (boolean, maps to 'Commutation' requested/not requested), `is_filed` (boolean, default false), `notes` (text, nullable), `attachment_path` (nullable string for scanned PDF/images), `created_by` (foreign key to `users.id` for audit trail), timestamps, soft deletes.

#### `tardiness_records` Table
- **Columns**: `id`, `user_id`, `year` (integer), `month` (integer 1-12), `tardiness_count` (integer default 0), `tardiness_minutes` (integer default 0), `undertime_count` (integer default 0), `undertime_minutes` (integer default 0), `created_by` (foreign key to `users.id` for audit trail), timestamps.
- **Constraint**: Unique on `(user_id, year, month)`.

---

### Backend Logic & Security

#### Roles & Permissions
- `leave.access_module`, `leave.encode`, `leave.manage_tardiness`, `leave.manage_credits`: `super_admin`, `hr_admin`, `hr_staff`.
- `leave.manage_settings`: `super_admin` and `hr_admin` (controls Types, Statuses, Holidays).

#### Form Requests & Services
- **Validation**:
  - `days_requested` auto-calculates (excluding weekends and holidays) but can be manually overridden. 
  - **Half-Day Logic**: Backend prevents encoding >1.0 days for a single specific date.
  - **Overlap Prevention**: Backend throws validation error if the user already has a leave request in the `start_date` to `end_date` range.
  - **Credit Check Warning**: Service checks `leave_credits` balance. If `days_requested` > `balance`, throw a warning (which HR can override if necessary).
- **Controllers**: `LeaveController`, `LeaveCreditController`, `HolidayController`, `TardinessController`, `LeaveTypeController`, `LeaveStatusController`.

---

### Frontend Components (React + Inertia + Tailwind)
*Note: All frontend pages will use a fragment `<>...</>` instead of manually wrapping in `<AppLayout>`, and will use a static `.layout` property for breadcrumbs.*

#### Navigation
- **Sidebar**: The `navigation.php` file must register **only one single sidebar link** for the entire Leave Tracking module (`/leave`).
- **Internal Tabs/Sub-navigation**: Inside the module, provide internal navigation to switch between the Dashboard, Leave Credits, Calendar, Tardiness, and Settings pages.

#### Leave Dashboard / Data Log (`/leave`)
- Datatable of all encoded leave forms. Uses the shared `Pagination.tsx`.
- Displays `created_by` for accountability.

#### Encode Form (`/leave/create`)
- Inputs for Employee, Leave Type, Leave Status, Dates, `days_requested`.
- File upload for `attachment_path` (signed CS Form No. 6).
- Credit check indicator (shows current balance for selected type).
- Warnings for overlapping dates or insufficient balance.

#### Leave Credits (`/leave/credits`)
- View and manually adjust `earned` and `used` balances for employees per year.

#### Leave Calendar (`/leave/calendar`)
- Visual matrix UI showing attendance/leave for employees across months.
- **Global Year Selector**: Filters data specifically for a fiscal year.
- **Half-Day Rendering**: Split-cell UI or partial color filling if a day contains 0.5 leaves.

#### Tardiness & Undertime (`/leave/tardiness`)
- Table listing employees and their Tardiness/Undertime (counts and minutes) for Jan-Dec of a selected year.
- **Global Year Selector** included.
- "Edit" button opens a modal to update counts/minutes for all 12 months. Tracks `created_by`.

#### Settings / Lookups (`/leave/settings`) - *Admins Only*
- **Holidays**: View, add, and generate holiday lists per year. 
  - **UI Requirement**: The holiday management page must include a notice and hyperlink instructing the admin to refer to the official list: `[Official List of Regular Holidays and Special Non-Working Days](https://www.officialgazette.gov.ph/nationwide-holidays/)`.
- **Leave Types**: Create/Edit/Deactivate leave types and update colors.
- **Leave Statuses**: Create/Edit/Deactivate custom statuses.