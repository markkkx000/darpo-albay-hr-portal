# DARPO Albay HR Portal

A modern, containerized Human Resource Management System built for the Department of Agrarian Reform Provincial Office (DARPO) Albay.

---

## 🚀 Quick Start (WSL2 / Linux / macOS)

For the best performance and zero permission issues, this project is designed to run in a **Linux environment** (Native Linux, macOS, or Windows WSL2).

### 1. Prerequisites

| Environment | Requirement | Notes |
| :--- | :--- | :--- |
| **Windows** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Must be **running**. Enable **WSL Integration** for your distro in Settings. |
| **Windows** | [Ubuntu on WSL2](https://aka.ms/wslinstall) | Code **MUST** be stored in the Linux filesystem (e.g., `~/projects/...`). |
| **Linux** | [Docker Engine](https://docs.docker.com/engine/install/) | Ensure the docker service is running (`sudo systemctl start docker`). |
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Ensure the Docker app is running. |

### 2. Setup

Open your terminal (Ubuntu on Windows) and run:

```bash
# Clone the repository
git clone <repository-url>
cd darpo-albay-hr-portal

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The script will automatically:
- Create your `.env` file and set the correct **User IDs**.
- Install PHP (Composer) and Node.js dependencies.
- Start Docker containers (Postgres, Redis, Laravel).
- Generate the application key and seed the database.
- Build the frontend assets.

---

## 🚢 Development Workflow (Sail)

Manage your environment using **Laravel Sail** from your terminal:

```bash
# Start the environment
./vendor/bin/sail up -d

# Start the Vite dev server (Hot Module Replacement)
./vendor/bin/sail npm run dev

# Run Artisan commands
./vendor/bin/sail artisan migrate
```

> **Windows Users:** Use **VS Code** with the **WSL extension** to edit files directly inside the Linux filesystem for maximum performance.

---

## 🧪 Common Commands

| Action | Command |
| :--- | :--- |
| **Run Tests** | `./vendor/bin/sail artisan test` |
| **Reset Database** | `./vendor/bin/sail artisan migrate:fresh --seed` |
| **Tinker** | `./vendor/bin/sail artisan tinker` |
| **Format Code** | `./vendor/bin/sail vendor/bin/pint --dirty` |

---

## 🔑 Environment Access

| Service | URL / Port |
| :--- | :--- |
| **Web App** | [http://localhost](http://localhost) |
| **PostgreSQL** | Port `5432` |
| **Redis** | Port `6379` |

---

## 👥 Default Test Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | admin@darpo-albay.gov.ph | password |
| **HR Admin** | maria.santos@darpo-albay.gov.ph | password |
| **HR Staff** | juan.delacruz@darpo-albay.gov.ph | password |
| **Employee** | login via employee number (e.g., EMP-0001) | password |
