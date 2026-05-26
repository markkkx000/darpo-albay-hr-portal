# DARPO Albay HR Portal

A modern, high-performance Human Resource Information System (HRIS) tailored for the Department of Agrarian Reform Provincial Office (DARPO) Albay. 

---

## Core Technology Stack

This application utilizes a modern, optimized tech stack built for responsiveness, type safety, and clean maintainability:

*   **Backend:** PHP 8.4 + Laravel 13
*   **Frontend:** React 19 + Inertia.js v3 (Single Page Application architecture)
*   **Styling:** TailwindCSS v4
*   **Database:** PostgreSQL
*   **Type Safety:** Laravel Wayfinder (automatically generates typed routes and controller bindings)
*   **Testing:** Pest PHP v4

---

## Local Development Setup (WSL2 / Linux / macOS)

For the best experience and zero permission or filesystem speed issues, this project is designed to run in a **Linux environment** (Native Linux, macOS, or Windows WSL2).

### 1. Prerequisites

| Environment | Requirement | Notes |
| :--- | :--- | :--- |
| **Windows** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Must be running. Enable **WSL Integration** for your distro in Settings. |
| **Windows** | [Ubuntu on WSL2](https://aka.ms/wslinstall) | Code **MUST** be stored in the Linux filesystem (e.g., `~/projects/...`). |
| **Linux** | [Docker Engine](https://docs.docker.com/engine/install/) | Ensure the docker service is running (`sudo systemctl start docker`). |
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Ensure the Docker app is running. |

### 2. Windows-Specific WSL2 Ubuntu Setup

If you are on Windows, you must use WSL2 to run this project:

1.  **Install WSL2**: Open PowerShell as Administrator and run:
    ```powershell
    wsl --install
    ```
2.  **Install Ubuntu 24.04**: Launch PowerShell and run:
    ```powershell
    wsl --install -d Ubuntu-24.04
    ```
3.  **Enable Docker Integration**:
    *   Open Docker Desktop.
    *   Go to **Settings > Resources > WSL Integration**.
    *   Toggle on **Ubuntu-24.04** and click **Apply & Restart**.
4.  **Verify WSL Version**: Verify via `wsl --list --verbose` that Ubuntu is running version 2.

### 3. Quick Setup

Open your terminal (inside the WSL2 environment if on Windows) and run:

```bash
# Clone the repository
git clone <repository-url>
cd darpo-albay-hr-portal

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The script will automatically:
*   Create your `.env` file and set the correct permissions/User IDs.
*   Install Composer (PHP) and Node.js dependencies.
*   Start Docker containers (Postgres, Redis, Laravel).
*   Generate the application key and migrate/seed the database.
*   Build the frontend assets.

---

## Development Workflow (Sail)

Manage your local Docker environment using **Laravel Sail**:

```bash
# Start the containers in the background
./vendor/bin/sail up -d

# Stop the containers
./vendor/bin/sail down

# Start the Vite dev server (Hot Module Replacement)
./vendor/bin/sail npm run dev

# Run Artisan commands
./vendor/bin/sail artisan migrate
```

### Common Commands

| Action | Command |
| :--- | :--- |
| **Run Tests** | `./vendor/bin/sail artisan test` |
| **Reset Database** | `./vendor/bin/sail artisan migrate:fresh --seed` |
| **Tinker** | `./vendor/bin/sail artisan tinker` |
| **Format Code** | `./vendor/bin/sail vendor/bin/pint --dirty` |

### Environment Access

| Service | URL / Port |
| :--- | :--- |
| **Web App** | [http://localhost](http://localhost) |
| **PostgreSQL** | Port `5432` |
| **Redis** | Port `6379` (Local cache/session) |

---

## Default Test Accounts

Initial accounts created by the database seeders:

| Role | Employee Number | Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `superadmin@example.com` | `password` |
| **HR Admin** | `hradmin` | `hradmin@example.com` | `password` |

> [!TIP]
> Standard employees can log in using their system-assigned Employee Number (e.g., `EMP-0001`) and the default password `password` once registered.

---

## Production Deployment Guide

This guide details how to deploy the HR Portal to a production environment using **Laravel Cloud** with **Supabase** (Database) and **Cloudflare R2** (Object Storage).

### 1. Application Hosting (Laravel Cloud)

Laravel Cloud provides native, automated build pipelines for modern Laravel apps:

*   **Region Alignment:** The Laravel Cloud app instance **MUST** be deployed in the same region as your database (e.g., AWS Singapore `ap-southeast-1`). Cross-region hosting (such as app in Singapore and database in Tokyo) introduces sequential network latency which slows down page navigation and operations significantly.
*   **Asset Bundling:** You do **NOT** need to manually compile assets or run `npm run build` on production. Laravel Cloud automatically builds frontend assets using Vite on every deployment.
*   **Deployment Commands:** Set your deployment hook/command to run migrations safely on release:
    ```bash
    php artisan migrate --force
    ```

### 2. Database Integration (Supabase)

For production, we use a cloud-hosted PostgreSQL database on Supabase:

*   **Connection Pooling:** Always connect using the Supabase transaction/session pooler connection string (defaulting to Port `5432`) to handle simultaneous requests efficiently.
*   **Initial Database Seeding:** On your initial deployment, you can seed the default roles, appointment statuses, and admin credentials by running the following command via the Laravel Cloud terminal or CLI:
    ```bash
    php artisan db:seed --force
    ```

### 3. File & Avatar Storage (Cloudflare R2 or Supabase Storage)

To persist user uploads (such as employee avatars and documents) across serverless deployments, we configure an S3-compatible disk. You can use either **Cloudflare R2** or **Supabase Storage**:

*   **Required Package:** The Laravel S3 Flysystem driver (`league/flysystem-aws-s3-v3`) is pre-installed.
*   **Bucket Settings:** The storage bucket must have **Public** access enabled.
*   **Safe Code Handling:** Deletions of profiles bypass missing cloud-file errors gracefully, ensuring that database updates finish even if physical assets are not present on the disk.

#### Option A: Cloudflare R2
Configure R2 using the standard S3 credentials. Set `AWS_DEFAULT_REGION=auto`, `AWS_USE_PATH_STYLE_ENDPOINT=true`, and provide your account endpoint URL.

#### Option B: Supabase Storage (Alternative)
Supabase Storage is S3-compatible. To use it:
1. Enable the S3 protocol in the Supabase Dashboard under **Storage > Settings**.
2. Generate S3 Access Keys (Access Key ID and Secret Access Key) in the same settings page.
3. Configure `AWS_ENDPOINT` to `https://<your-project-ref>.supabase.co/storage/v1/s3`.
4. Configure `AWS_URL` to `https://<your-project-ref>.supabase.co/storage/v1/object/public/<bucket-name>`.
5. Set `AWS_DEFAULT_REGION` to match your Supabase region (e.g. `ap-southeast-1`).

### 4. Lean Architecture Drivers

To avoid extra infrastructure complexity and costs, the application is optimized to run session state, caching, and background jobs directly on the primary database in production:

*   `SESSION_DRIVER=database`
*   `CACHE_STORE=database`
*   `QUEUE_CONNECTION=database`

This keeps the application structure lean, avoiding the need for an external Redis service in production, while maintaining lightning-fast performance due to low database-to-app latency.

### 5. Production Environment Variables Template

Add the following environment variables to your production environment in the Laravel Cloud settings:

```env
APP_NAME="DARPO Albay HR Portal"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://hrdarpoalbay.laravel.cloud
APP_TIMEZONE=Asia/Manila

# Database Configuration (Supabase AWS Singapore Pooler)
DB_CONNECTION=pgsql
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.your_project_id
DB_PASSWORD=your_secure_supabase_password

# Session, Cache, & Queue Management
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
BCRYPT_ROUNDS=10

# Cloud Storage: Option A (Cloudflare R2)
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=your_r2_access_key_id
# AWS_SECRET_ACCESS_KEY=your_r2_secret_access_key
# AWS_DEFAULT_REGION=auto
# AWS_BUCKET=your_r2_bucket_name
# AWS_ENDPOINT=https://your_cloudflare_account_id.r2.cloudflarestorage.com
# AWS_USE_PATH_STYLE_ENDPOINT=true
# AWS_URL=https://your-public-r2-domain-or-subdomain.r2.dev

# Cloud Storage: Option B (Supabase Storage)
# FILESYSTEM_DISK=s3
# AWS_ACCESS_KEY_ID=your_supabase_s3_access_key_id
# AWS_SECRET_ACCESS_KEY=your_supabase_s3_secret_access_key
# AWS_DEFAULT_REGION=ap-southeast-1
# AWS_BUCKET=your_supabase_bucket_name
# AWS_ENDPOINT=https://your_project_id.supabase.co/storage/v1/s3
# AWS_USE_PATH_STYLE_ENDPOINT=true
# AWS_URL=https://your_project_id.supabase.co/storage/v1/object/public/your_supabase_bucket_name
```

---

## Security & Performance Tuning

Once deployed live:
1.  **Cache Configuration & Routes:** Optimize startup speeds by running `php artisan config:cache` and `php artisan route:cache` as part of your deployment workflow (handled automatically by Laravel Cloud).
2.  **HTTPS Enforcement:** Laravel Cloud automatically routes requests over HTTPS. Ensure the `APP_URL` environment variable starts with `https://` to generate correct asset and route URLs.
3.  **Bcrypt Hashing Work Factor (Slow Logins):** Bcrypt is CPU-bound by design. On serverless containers with restricted CPU allocation (like starter tiers), high round values can result in multi-second login latencies (5-8 seconds). To resolve this, specify `BCRYPT_ROUNDS=10` in your production environment variables to keep verification times sub-second while maintaining standard security.
