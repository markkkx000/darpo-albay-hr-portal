# Contributing to DARPO Albay HR Portal

Welcome to the DARPO Albay HR Portal project! Whether you are a new developer onboarding to the team or an AI agent assisting with the codebase, this document serves as your central guide to setting up and working on the project.

---

## Setting Up Your Development Environment

For the best experience, this project is designed to run in a **Linux environment** (Native Linux, macOS, or Windows WSL2) using Docker and Laravel Sail.

### 1. Prerequisites
- **Docker Engine / Docker Desktop** must be running.
- If you are on Windows, you **MUST** use WSL2 (Ubuntu). Clone the repository inside the Linux filesystem (`~/projects/...`), NOT the Windows filesystem (`/mnt/c/...`), to avoid massive performance penalties.

### 2. Automatic Setup (Recommended)
We provide a comprehensive setup script that builds your environment from scratch:

```bash
# Ensure the script is executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

The script will automatically:
1. Detect Docker and set up your `.env` file.
2. Install Composer dependencies (via a temporary Docker container if needed).
3. Start Laravel Sail (`./vendor/bin/sail up -d`).
4. Generate the application key, link storage, and run database migrations & seeders.
5. Install NPM dependencies and build frontend assets.
6. Generate typed frontend routes via Laravel Wayfinder.

### 3. Manual Daily Workflow
Once setup is complete, you will use Laravel Sail for day-to-day commands:

```bash
# Start the application
./vendor/bin/sail up -d

# Start the Vite Hot-Module-Replacement (HMR) server for frontend dev
./vendor/bin/sail npm run dev

# Stop the application
./vendor/bin/sail down
```

You can access the local application at `http://localhost`.

---

## Working with AI Agents

If you are an AI agent or a developer leveraging AI coding assistants, you **MUST** read and adhere to the following core context files before making architectural decisions or writing code:

1. **`CODEBASE_SUMMARY.md`**: Contains the full map of the application's modular architecture, routing logic, and existing features. Read this to avoid duplicating existing components or services.
2. **`RULES_AND_GUIDELINES.md`**: Contains strict backend, frontend, security, and migration rules. Key takeaways:
   - Module logic goes in Services, not Controllers.
   - PII fields must be encrypted and redacted from Audit Logs.
   - Never use SQLite syntax (like `LIKE`); we use PostgreSQL (`ILIKE`).
   - Use Laravel Wayfinder for all frontend routing.
3. **`PREMIUM_UI_GUIDE.md`** *(or the UI UX Design Rules in `RULES_AND_GUIDELINES.md`)*: Contains our strict design language (Gestalt principles, dark/light mode parity, interactive hover states, Fitts's law target sizing).

---

## Code Quality & Testing Requirements

Before submitting a Pull Request, you must ensure your code meets our standards. The CI pipeline will reject any code that fails these checks.

### 1. Formatting (Laravel Pint)
We enforce standard Laravel styling via Pint.
```bash
# Run Pint to automatically fix styling issues
./vendor/bin/sail vendor/bin/pint --dirty
```

### 2. Static Analysis (PHPStan)
We use PHPStan at Level 5 to catch type errors and undefined properties. Because PHPStan can be memory-intensive, you may need to run it with a raised limit:
```bash
# Run PHPStan
./vendor/bin/sail php -d memory_limit=2G ./vendor/bin/phpstan analyse
```

### 3. Testing (Pest PHP)
All business logic must be tested using Pest. We use PostgreSQL for testing to match production.
```bash
# Run the test suite
./vendor/bin/sail artisan test --compact
```

---

## Creating a New Module

If you are tasked with creating a new feature module (e.g., Payroll):
1. Create the module directory: `app/Modules/Payroll/`.
2. Implement standard subdirectories: `Controllers/`, `Models/`, `Requests/`, `Services/`.
3. Create `routes.php` in the module root (it will be auto-registered).
4. Create `navigation.php` if it requires a sidebar link.
5. Create the React frontend pages in `resources/js/pages/Modules/Payroll/`.
6. Assign permissions in `database/seeders/RoleAndPermissionSeeder.php`.
