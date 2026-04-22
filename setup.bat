@echo off
setlocal EnableDelayedExpansion

:: =============================================================================
:: DARPO Albay HR Portal — Project Jumpstart Script (Windows)
:: =============================================================================
:: Automates a fresh development environment setup:
::   1. Verifies / installs PHP 8.4, Composer, Node.js
::   2. Installs Composer ^& NPM dependencies
::   3. Configures environment file ^& SQLite database
::   4. Runs migrations, seeders, and builds frontend assets
:: =============================================================================
:: Run this script from the project root directory.
:: Requires Administrator privileges for the PHP installer step.
:: =============================================================================

title DARPO Albay HR Portal — Setup

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║ DARPO Albay HR Portal — Project Jumpstart (Windows)  ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

set "REQUIRED_PHP_MAJOR=8"
set "REQUIRED_PHP_MINOR=4"

:: Change to the directory where this script lives
cd /d "%~dp0"

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 1/8 — PHP
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 1/8 — Checking PHP ──
echo.

where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN]  PHP is not installed.
    goto :install_php
)

:: Parse PHP version
for /f "tokens=*" %%v in ('php -r "echo PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;"') do set "PHP_VERSION=%%v"
for /f "tokens=1,2 delims=." %%a in ("!PHP_VERSION!") do (
    set "PHP_MAJOR=%%a"
    set "PHP_MINOR=%%b"
)

if !PHP_MAJOR! GTR %REQUIRED_PHP_MAJOR% (
    echo [OK]    PHP !PHP_VERSION! detected ^(^>= %REQUIRED_PHP_MAJOR%.%REQUIRED_PHP_MINOR%^)
    goto :php_done
)
if !PHP_MAJOR! EQU %REQUIRED_PHP_MAJOR% if !PHP_MINOR! GEQ %REQUIRED_PHP_MINOR% (
    echo [OK]    PHP !PHP_VERSION! detected ^(^>= %REQUIRED_PHP_MAJOR%.%REQUIRED_PHP_MINOR%^)
    goto :php_done
)

echo [WARN]  PHP !PHP_VERSION! detected — this project requires ^>= %REQUIRED_PHP_MAJOR%.%REQUIRED_PHP_MINOR%

:install_php
echo [INFO]  Installing PHP %REQUIRED_PHP_MAJOR%.%REQUIRED_PHP_MINOR%, Composer, and Laravel installer via php.new ...
echo [INFO]  This step requires Administrator privileges.
echo.

:: Check for admin privileges
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] This script must be run as Administrator to install PHP.
    echo [ERROR] Right-click the script and select "Run as administrator", then try again.
    echo.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/%REQUIRED_PHP_MAJOR%.%REQUIRED_PHP_MINOR%'))"

:: Refresh PATH
call refreshenv >nul 2>&1
set "PATH=%USERPROFILE%\.config\herd-lite\bin;%APPDATA%\Composer\vendor\bin;%PATH%"

where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PHP still not found after installation.
    echo [ERROR] Please close this terminal, open a NEW terminal, and re-run this script.
    echo [ERROR] The installer may require a terminal restart to update the PATH.
    pause
    exit /b 1
)

echo [OK]    PHP installed successfully

:php_done

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 2/8 — Composer
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 2/8 — Checking Composer ──
echo.

where composer >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Composer is not installed.
    echo [ERROR] The php.new installer should have included Composer.
    echo [ERROR] If it didn't, install it manually: https://getcomposer.org/download/
    echo [ERROR] After installing, close this terminal, open a NEW one, and re-run.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('composer --version 2^>nul') do echo [OK]    %%v detected
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 3/8 — Node.js ^& NPM
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 3/8 — Checking Node.js ^& NPM ──
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN]  Node.js is not installed.
    echo [ERROR] Please install Node.js from https://nodejs.org/ and re-run this script.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do echo [OK]    Node.js %%v detected

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] NPM is not installed. Install Node.js ^(which includes NPM^) and re-run.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('npm --version') do echo [OK]    NPM %%v detected

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 4/8 — Environment Configuration
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 4/8 — Environment Configuration ──
echo.

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [OK]    Created .env from .env.example
    ) else (
        echo [ERROR] .env.example not found — cannot create .env file.
        pause
        exit /b 1
    )
) else (
    echo [OK]    .env file already exists
)

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 5/8 — Composer Dependencies
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 5/8 — Installing Composer Dependencies ──
echo.

call composer install --no-interaction --prefer-dist --optimize-autoloader
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Composer install failed.
    pause
    exit /b 1
)
echo [OK]    Composer dependencies installed

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 6/8 — Laravel Application Setup
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 6/8 — Laravel Application Setup ──
echo.

:: Generate application key (only if not set)
findstr /B "APP_KEY=$" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    php artisan key:generate --no-interaction
    echo [OK]    Application key generated
) else (
    echo [OK]    Application key already set
)

:: Create SQLite database if configured
for /f "tokens=2 delims==" %%a in ('findstr /B "DB_CONNECTION=" .env') do set "DB_CONN=%%a"
:: Trim whitespace
for /f "tokens=*" %%a in ("!DB_CONN!") do set "DB_CONN=%%a"

if "!DB_CONN!"=="sqlite" (
    if not exist database\database.sqlite (
        type nul > database\database.sqlite
        echo [OK]    Created SQLite database: database\database.sqlite
    ) else (
        echo [OK]    SQLite database already exists
    )
)

:: Run migrations
echo [INFO]  Running database migrations ...
php artisan migrate --no-interaction --force
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Migrations failed.
    pause
    exit /b 1
)
echo [OK]    Migrations completed

:: Run seeders
echo [INFO]  Running database seeders ...
php artisan db:seed --no-interaction --force
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Seeders failed.
    pause
    exit /b 1
)
echo [OK]    Seeders completed

:: Storage link
echo [INFO]  Creating storage symlink ...
php artisan storage:link --no-interaction --force >nul 2>&1
echo [OK]    Storage link created

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 7/8 — NPM Dependencies ^& Build
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ── Step 7/8 — Installing NPM Dependencies ^& Building Assets ──
echo.

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] NPM install failed.
    pause
    exit /b 1
)
echo [OK]    NPM dependencies installed

echo [INFO]  Building frontend assets ...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)
echo [OK]    Frontend assets built

:: ─────────────────────────────────────────────────────────────────────────────
:: Step 8/8 — Done
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║            Setup completed successfully!              ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo   Quick Reference:
echo   ─────────────────────────────────────────────────────
echo   Start dev server:   composer run dev
echo   Run tests:          php artisan test --compact
echo   Run linter:         vendor\bin\pint --dirty
echo   Build assets:       npm run build
echo.

pause
endlocal
