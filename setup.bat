@echo off
setlocal EnableDelayedExpansion

:: =============================================================================
:: DARPO Albay HR Portal — Project Jumpstart Script (Windows)
:: =============================================================================
:: Automates a fresh development environment setup with Docker (Sail) support.
:: =============================================================================

title DARPO Albay HR Portal — Setup

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║ DARPO Albay HR Portal — Project Jumpstart (Sail)     ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

:: Change to the directory where this script lives
cd /d "%~dp0"

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 1/6 — Environment Detection
:: ─────────────────────────────────────────────────────────────────────────────
echo ── Step 1/6 — Environment Detection ──
echo.

set "HAS_DOCKER=false"
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "HAS_DOCKER=true"
    echo [OK]    Docker detected
) else (
    echo [WARN]  Docker not detected. Local installation will be required.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 2/6 — Environment Configuration
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 2/6 — Environment Configuration ──
echo.

if not exist .env (
    copy .env.example .env >nul
    echo [OK]    Created .env from .env.example
    
    if "!HAS_DOCKER!"=="true" (
        echo [INFO]  Configuring .env for Docker (Postgres ^& Redis) ...
        powershell -Command "(gc .env) -replace 'DB_CONNECTION=sqlite', 'DB_CONNECTION=pgsql' | Out-File -encoding ASCII .env"
        powershell -Command "(gc .env) -replace 'DB_HOST=127.0.0.1', 'DB_HOST=pgsql' | Out-File -encoding ASCII .env"
        powershell -Command "(gc .env) -replace 'DB_PORT=3306', 'DB_PORT=5432' | Out-File -encoding ASCII .env"
        powershell -Command "(gc .env) -replace 'REDIS_HOST=127.0.0.1', 'REDIS_HOST=redis' | Out-File -encoding ASCII .env"
    )
) else (
    echo [OK]    .env file already exists
)

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 3/6 — Installing Dependencies
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 3/6 — Installing Dependencies ──
echo.

if not exist vendor (
    where php >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        if "!HAS_DOCKER!"=="true" (
            echo [INFO]  PHP not found locally. Using Docker to install Composer dependencies ...
            docker run --rm -v "%cd%":/var/www/html -w /var/www/html laravelsail/php84-composer:latest composer install --ignore-platform-reqs
        ) else (
            echo [ERROR] PHP and Docker not found. Cannot install dependencies.
            pause
            exit /b 1
        )
    ) else (
        echo [INFO]  Installing Composer dependencies via local PHP ...
        call composer install
    )
    echo [OK]    Composer dependencies installed
)

if not exist node_modules (
    echo [INFO]  Installing NPM dependencies ...
    if "!HAS_DOCKER!"=="true" (
        call .\vendor\bin\sail npm install
    ) else (
        call npm install
    )
    echo [OK]    NPM dependencies installed
)

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 4/6 — Application Setup
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 4/6 — Application Setup ──
echo.

if "!HAS_DOCKER!"=="true" (
    echo [INFO]  Starting Docker containers (Sail) ...
    call .\vendor\bin\sail up -d
    
    echo [INFO]  Generating App Key ...
    call .\vendor\bin\sail artisan key:generate --no-interaction
    
    echo [INFO]  Running Migrations ...
    call .\vendor\bin\sail artisan migrate --no-interaction
    
    echo [INFO]  Running Seeders (Optional) ...
    call .\vendor\bin\sail artisan db:seed --no-interaction
    
    echo [INFO]  Building Assets ...
    call .\vendor\bin\sail npm run build
) else (
    php artisan key:generate --no-interaction
    php artisan migrate --no-interaction
    call npm run build
)

echo [OK]    Application setup complete

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 5/6 — Summary
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║            Setup completed successfully!              ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo   Commands:
if "!HAS_DOCKER!"=="true" (
    echo   Start App:      .\vendor\bin\sail up -d
    echo   Stop App:       .\vendor\bin\sail down
    echo   Vite (Dev):     .\vendor\bin\sail npm run dev
) else (
    echo   Start App:      composer run dev
)

echo.
echo   Access the site at: http://localhost
echo.

pause
endlocal
