# DARPO Albay HR Portal

A modern, high-performance Human Resource Information System (HRIS) tailored for the Department of Agrarian Reform Provincial Office (DARPO) Albay. This project aims to digitize and streamline all core HR operations, from attendance tracking and leave management to document requests and personnel organization.

---

## Project Goals

1. **Digitize HR Operations**: Move away from paper-based forms (like CS Form 6 for Leaves and CS Form 48 for DTRs) to fully auditable digital records.
2. **Role-Based Access Control**: Ensure strict data isolation. Super Admins, HR Staff, Division Heads, and Regular Employees each have tailored views and specific permissions.
3. **High Performance & Modern UI**: Provide a lightning-fast Single Page Application (SPA) experience with a premium, aesthetic design.
4. **Data Integrity & Auditability**: Maintain full system logs of all critical actions and track who performed what, down to the attribute level.

---

## Code Structure & Architecture

This application utilizes a modern, modular tech stack:

*   **Backend:** PHP 8.4 + Laravel 13
*   **Frontend:** React 19 + Inertia.js v3 (SPA architecture)
*   **Styling:** TailwindCSS v4
*   **Database:** PostgreSQL
*   **Type Safety:** Laravel Wayfinder (auto-generates typed routes for frontend)
*   **Testing:** Pest PHP v4
*   **Code Quality:** Laravel Pint (Formatting) & PHPStan (Static Analysis)

### Modular Design (`app/Modules/`)
The backend avoids standard Laravel monolith clutter by grouping features into domain-specific modules. Each module contains its own Controllers, Models, Form Requests, Services, and `routes.php`.

The frontend mimics this structure, with components and pages organized into `resources/js/pages/Modules/`.

---

## Modules & Dependency Tree

The application is composed of several independent but cooperating modules:

1. **Personnel Directory (`app/Modules/Personnel/`)**
   - *Core Entity*. Manages Employees, Divisions, Units, and Positions.
   - *Dependencies*: Relies on Spatie Roles for permission assignment.
2. **Attendance Tracking (`app/Modules/Attendance/`)**
   - Employee clock-in/out and HR manual logging.
   - *Dependencies*: Personnel.
3. **Leave Tracking (`app/Modules/Leave/`)**
   - Digitizes CS Form 6. Tracks Leave Credits, Requests, and Holidays.
   - *Dependencies*: Personnel.
4. **DTR Export (`app/Modules/DTR/`)**
   - Generates CS Form 48 exports from attendance and leave data.
   - *Dependencies*: Attendance, Leave, Personnel.
5. **Document Requests (`app/Modules/DocumentRequests/`)**
   - Allows employees to request CoEs, Service Records, etc., with a full HR processing pipeline.
   - *Dependencies*: Personnel.
6. **Audit Logs (`app/Modules/Audit/`)**
   - Tracks all system events across all modules.
   - *Dependencies*: `spatie/laravel-activitylog`.
7. **Notifications Infrastructure (`app/Modules/Notifications/`)**
   - Cross-cutting service. Any module can dispatch database notifications (e.g., Leave approvals).
8. **Roles & Permissions (`app/Modules/Roles/`)**
   - Manages access control matrices.
9. **Support Tickets (`app/Modules/SupportTickets/`)**
   - GitHub Issue integration for user bug reports.

---

## Database Schema Overview

The database uses PostgreSQL exclusively. Key structures include:
- **Users**: Extended with HR data (encrypted PII like Salary, TIN, PhilHealth).
- **Organization**: `divisions`, `units`, `positions` (hierarchical). A `position_user` pivot table allows employees to hold multiple roles (with one primary).
- **Leave Data**: `leave_credits` (balances), `leave_requests` (filed leaves), `holidays`, `tardiness_records`.
- **Attendance**: `attendances` (daily logs with in/out timestamps).
- **Documents**: `document_requests` (json payload of requested forms + status timeline).
- **Audit**: `activity_log` (Spatie table containing attribute-level changes).

*Note: Real-world entities use `SoftDeletes`. Lookup tables use an `is_active` boolean instead of deletion to preserve historical data integrity.*

---

## Deployment Procedure

Deployment is fully automated via GitHub Actions (`.github/workflows/tests.yml`).

1. **Continuous Integration (CI):** Every push to `main` runs the Pest test suite against a PostgreSQL service container, runs PHPStan, and builds Vite assets.
2. **Continuous Deployment (CD):** If the CI job succeeds on the `main` branch, the workflow triggers a deployment to **Laravel Cloud**.
3. **Database & Migrations:** Laravel Cloud connects to a **Supabase PostgreSQL** pooler. The deployment hook automatically runs `php artisan migrate --force`.
4. **Asset Storage:** Avatars and documents are uploaded to **Supabase Storage** (S3-compatible) via Laravel's S3 driver.

### External Services Required for Production
- **Laravel Cloud**: Application hosting and zero-downtime deployments.
- **Supabase**: Managed PostgreSQL database.
- **Supabase Storage**: Object storage for file uploads (S3-compatible).
- **GitHub**: Source control and CI/CD pipelines.

---

## Future Recommendations (Scaling)

As DARPO Albay's usage grows, consider the following infrastructural upgrades:

1. **Biometric Integration**: Currently, attendance is web-based. Future phases should expose API endpoints for local biometric scanners (ZKTeco, etc.) to push clock-in/out data directly to the application.
2. **Dedicated Queue Workers**: Currently, background jobs run on the default database queue driver. If email notifications and PDF generations scale up, transition to **Laravel Horizon** backed by a **Redis** cluster.
3. **Database Read Replicas**: If DTR report generation and Audit Log filtering become slow due to data volume, configure Supabase Read Replicas to handle heavy `SELECT` queries off the primary write database.
4. **Caching Layer**: Shift heavy, static computations (like the organizational chart structure) to Redis instead of recalculating them on the fly.
