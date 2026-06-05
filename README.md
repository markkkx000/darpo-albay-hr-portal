# DARPO Albay HR Portal

A modern, high-performance Human Resource Information System (HRIS) tailored for the Department of Agrarian Reform Provincial Office (DARPO) Albay. This project aims to digitize and streamline all core HR operations, from attendance tracking and leave management to document requests and personnel organization.

---

## Project Goals

1. **Digitize HR Operations**: Move away from paper-based forms (like CS Form 6 for Leaves and CS Form 48 for DTRs) to fully auditable digital records.
2. **Role-Based Access Control**: Ensure strict data isolation. Super Admins, HR Staff, Division Heads, and Regular Employees each have tailored views and specific permissions.
3. **High Performance & Modern UI**: Provide a lightning-fast Single Page Application (SPA) experience with a premium, aesthetic design.
4. **Data Integrity & Auditability**: Maintain full system logs of all critical actions and track who performed what, down to the attribute level.

---

## Architecture & Development

Detailed information regarding the system architecture, database schema, modular dependencies, background scheduled tasks, and custom console commands are documented in the **[Contributing Guide](CONTRIBUTING.md)**.

---

## Deployment Procedure

Deployment is fully automated via GitHub Actions (`.github/workflows/tests.yml`).

1. **Continuous Integration (CI):** Every push to `main` runs the Pest test suite against a PostgreSQL service container, runs PHPStan, and builds Vite assets.
2. **Continuous Deployment (CD):** If the CI job succeeds on the `main` branch, the workflow triggers a deployment to **Laravel Cloud**.
3. **Database & Migrations:** Laravel Cloud connects to a **Supabase PostgreSQL** pooler. The deployment hook automatically runs `php artisan migrate --force`.
4. **Asset Storage:** Avatars and documents are uploaded to **Supabase Storage** (S3-compatible) via Laravel's S3 driver.

### External Services & Required API Keys

To run the application fully (especially in production), you need to provision the following third-party credentials in your `.env` or Laravel Cloud environment variables:

1. **Supabase PostgreSQL (Database)**
   - Managed PostgreSQL database with connection pooling.
   - Keys required: `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`.

2. **Supabase Storage (File Uploads)**
   - S3-compatible object storage for avatars and document attachments.
   - You must enable S3 compatibility in Supabase and generate access keys.
   - Keys required: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (along with `AWS_ENDPOINT` and `AWS_BUCKET`).

3. **GitHub API (Support Tickets Module)**
   - The Support Tickets module (`app/Modules/SupportTickets`) integrates directly with a GitHub repository to track issues.
   - You must generate a GitHub Personal Access Token (Classic) with `repo` permissions.
   - Keys required: 
     - `GITHUB_TOKEN="ghp_your_personal_access_token"`
     - `GITHUB_REPO="your-github-username/your-repo-name"`

4. **Laravel Cloud**
   - Application hosting and zero-downtime deployments. Tied to your GitHub repository.



## Legal & Compliance (Philippines)

As a government HR information system, this application is strictly designed to comply with several Philippine laws and Civil Service Commission (CSC) mandates:

1. **Republic Act No. 10173 (Data Privacy Act of 2012)**
   - **Compliance:** All highly sensitive Personally Identifiable Information (PII) — such as Monthly Salary, TIN, GSIS, PhilHealth, and HDMF/Pag-IBIG numbers — are permanently encrypted at rest in the database using Laravel's AES-256 encryption. Furthermore, the system implements an auto-redaction layer (`beforeActivityLogged`) to ensure these fields never leak in plain-text into the system's Audit Logs. A self-service "Export Personal Data" feature is also available to employees in compliance with the right to data portability.

2. **Civil Service Commission (CSC) Omnibus Rules on Leave (Rule XVI)**
   - **Compliance:** The system completely digitizes **CS Form No. 6 (Application for Leave)**. It features an automated engine that calculates precise working days requested (accounting for weekends and Philippine holidays), tracks accrued Vacation Leave (VL) and Sick Leave (SL) credits, and manages cumulative vs. non-cumulative leave behaviors.

3. **CSC Memorandum Circular No. 21, s. 1991 (Daily Time Record)**
   - **Compliance:** The application digitizes the generation of **CS Form No. 48 (Daily Time Record)**. The Attendance module tracks exact server-side clock-in and clock-out timestamps, and automatically handles Regular and Compressed workweek schedules, exporting directly to the official CSC-mandated PDF layout.

4. **Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018)**
   - **Compliance:** The Document Requests module fully digitizes and streamlines the workflow for requesting official HR documents (Service Records, Certificates of Employment, etc.), providing full transparency, status tracking, and minimizing bureaucratic friction.

---

## Future Recommendations (Scaling)

As DARPO Albay's usage grows, consider the following infrastructural upgrades:

1. **Biometric Integration**: Currently, attendance is web-based. Future phases should expose API endpoints for local biometric scanners (ZKTeco, etc.) to push clock-in/out data directly to the application.
2. **Dedicated Queue Workers**: Currently, background jobs run on the default database queue driver. If email notifications and PDF generations scale up, transition to **Laravel Horizon** backed by a **Redis** cluster.
3. **Database Read Replicas**: If DTR report generation and Audit Log filtering become slow due to data volume, configure Supabase Read Replicas to handle heavy `SELECT` queries off the primary write database.
4. **Caching Layer**: Shift heavy, static computations (like the organizational chart structure) to Redis instead of recalculating them on the fly.
