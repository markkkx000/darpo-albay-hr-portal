# DARPO Albay HR Portal

A modern, containerized Human Resource Management System built for the Department of Agrarian Reform Provincial Office (DARPO) Albay.

## Quick Start (Jumpstart)

We have automated the entire environment setup. Follow these steps to get the project running on any machine.

### 1. Prerequisites
Ensure you have **Docker** installed on your system:
- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (For Windows, use the WSL2 backend).
- **Linux:** [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/).

### 2. Setup
Clone the repository and run the setup script for your operating system:

**Unix/Linux/macOS:**
```bash
./setup.sh
```

**Windows:**
```powershell
.\setup.bat
```

The script will automatically:
- Create your .env file.
- Install PHP and Node dependencies (via Docker if needed).
- Start the Docker containers (Postgres, Redis, Laravel).
- Run migrations and seed the database.
- Build the initial frontend assets.

---

## Development Workflow

Once the setup is complete, use **Laravel Sail** to manage your environment.

### Starting the Application
```bash
./vendor/bin/sail up -d
```

### Frontend Development (Vite)
To enable Hot Module Replacement (HMR) for live UI changes:
```bash
./vendor/bin/sail npm run dev
```

### Stopping the Application
```bash
./vendor/bin/sail down
```

---

## Common Commands

| Action | Command |
| :--- | :--- |
| **Run Tests** | `./vendor/bin/sail artisan test --compact` |
| **Clear Cache** | `./vendor/bin/sail artisan optimize:clear` |
| **Reset DB** | `./vendor/bin/sail artisan migrate:fresh --seed` |
| **Tinker** | `./vendor/bin/sail artisan tinker` |
| **Format Code** | `./vendor/bin/sail vendor/bin/pint --dirty` |

---

## Environment Access
- **Web App:** [http://localhost](http://localhost)
- **Database:** PostgreSQL (Port 5432)
- **Redis:** Port 6379

---

## Default Test Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | admin@darpo-albay.gov.ph | password |
| **HR Admin** | maria.santos@darpo-albay.gov.ph | password |
| **HR Staff** | juan.delacruz@darpo-albay.gov.ph | password |
| **Employee** | EMP-0001 (login via employee number) | password |
