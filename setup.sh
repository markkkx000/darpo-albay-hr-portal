#!/bin/bash

# =============================================================================
# DARPO Albay HR Portal — Project Jumpstart Script (Unix/Linux/macOS)
# =============================================================================
# Automates a fresh development environment setup:
#   1. Verifies / installs PHP 8.4, Composer, Node.js
#   2. Installs Composer & NPM dependencies
#   3. Configures environment file & SQLite database
#   4. Runs migrations, seeders, and builds frontend assets
# =============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Colors
# ---------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; }
step()    { echo -e "\n${CYAN}${BOLD}── $* ──${NC}"; }

# Ensure we're in the project root (same directory as this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   DARPO Albay HR Portal — Project Jumpstart (Unix)   ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

REQUIRED_PHP_MAJOR=8
REQUIRED_PHP_MINOR=4

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 1. PHP                                                                     │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 1/8 — Checking PHP"

install_php() {
    info "Installing PHP ${REQUIRED_PHP_MAJOR}.${REQUIRED_PHP_MINOR}, Composer, and the Laravel installer via php.new ..."
    OS_TYPE=$(uname -s)
    if [ "$OS_TYPE" = "Darwin" ]; then
        /bin/bash -c "$(curl -fsSL https://php.new/install/mac/${REQUIRED_PHP_MAJOR}.${REQUIRED_PHP_MINOR})"
    elif [ "$OS_TYPE" = "Linux" ]; then
        /bin/bash -c "$(curl -fsSL https://php.new/install/linux/${REQUIRED_PHP_MAJOR}.${REQUIRED_PHP_MINOR})"
    else
        error "Unsupported OS ($OS_TYPE). Install PHP manually: https://laravel.com/docs/12.x/installation"
        exit 1
    fi

    # Reload shell paths so the new binaries are visible
    export PATH="$HOME/.config/herd-lite/bin:$HOME/.composer/vendor/bin:$PATH"
    hash -r 2>/dev/null || true
}

if command -v php &>/dev/null; then
    PHP_VERSION=$(php -r 'echo PHP_MAJOR_VERSION . "." . PHP_MINOR_VERSION;')
    PHP_MAJOR=$(echo "$PHP_VERSION" | cut -d. -f1)
    PHP_MINOR=$(echo "$PHP_VERSION" | cut -d. -f2)

    if [ "$PHP_MAJOR" -gt "$REQUIRED_PHP_MAJOR" ] || \
       { [ "$PHP_MAJOR" -eq "$REQUIRED_PHP_MAJOR" ] && [ "$PHP_MINOR" -ge "$REQUIRED_PHP_MINOR" ]; }; then
        success "PHP $PHP_VERSION detected (>= ${REQUIRED_PHP_MAJOR}.${REQUIRED_PHP_MINOR})"
    else
        warn "PHP $PHP_VERSION detected — this project requires >= ${REQUIRED_PHP_MAJOR}.${REQUIRED_PHP_MINOR}"
        install_php
    fi
else
    warn "PHP is not installed."
    install_php
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 2. Composer                                                                │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 2/8 — Checking Composer"

if command -v composer &>/dev/null; then
    COMPOSER_VER=$(composer --version 2>/dev/null | grep -oP '\d+\.\d+\.\d+' | head -1)
    success "Composer $COMPOSER_VER detected"
else
    warn "Composer is not installed."
    info "The php.new installer should have included Composer."
    info "Attempting to install Composer via php.new ..."
    install_php

    if ! command -v composer &>/dev/null; then
        error "Composer still not found after installation attempt."
        error "Please install Composer manually: https://getcomposer.org/download/"
        exit 1
    fi
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 3. Node.js & NPM                                                          │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 3/8 — Checking Node.js & NPM"

if command -v node &>/dev/null; then
    NODE_VER=$(node --version)
    success "Node.js $NODE_VER detected"
else
    warn "Node.js is not installed."
    info "The php.new installer should have included Node."
    info "If not, install Node.js from https://nodejs.org/ or via nvm."
    error "Cannot proceed without Node.js. Please install it and re-run this script."
    exit 1
fi

if command -v npm &>/dev/null; then
    NPM_VER=$(npm --version)
    success "NPM $NPM_VER detected"
else
    error "NPM is not installed. Please install Node.js (which includes NPM) and re-run."
    exit 1
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 4. Environment file                                                        │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 4/8 — Environment Configuration"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        success "Created .env from .env.example"
    else
        error ".env.example not found — cannot create .env file."
        exit 1
    fi
else
    success ".env file already exists"
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 5. Install Composer dependencies                                           │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 5/8 — Installing Composer Dependencies"

composer install --no-interaction --prefer-dist --optimize-autoloader
success "Composer dependencies installed"

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 6. Laravel application setup                                               │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 6/8 — Laravel Application Setup"

# Generate application key (only if not set)
if grep -q "^APP_KEY=$" .env 2>/dev/null || grep -q "^APP_KEY=base64:$" .env 2>/dev/null; then
    php artisan key:generate --no-interaction
    success "Application key generated"
else
    success "Application key already set"
fi

# Create SQLite database if configured
DB_CONNECTION=$(grep "^DB_CONNECTION=" .env | cut -d '=' -f2 | tr -d '[:space:]')
if [ "$DB_CONNECTION" = "sqlite" ]; then
    if [ ! -f database/database.sqlite ]; then
        touch database/database.sqlite
        success "Created SQLite database: database/database.sqlite"
    else
        success "SQLite database already exists"
    fi
fi

# Run migrations
info "Running database migrations ..."
php artisan migrate --no-interaction --force
success "Migrations completed"

# Run seeders
info "Running database seeders ..."
php artisan db:seed --no-interaction --force
success "Seeders completed"

# Storage link
info "Creating storage symlink ..."
php artisan storage:link --no-interaction --force 2>/dev/null || true
success "Storage link created"

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 7. Install NPM dependencies & build assets                                │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 7/8 — Installing NPM Dependencies & Building Assets"

npm install
success "NPM dependencies installed"

info "Building frontend assets ..."
npm run build
success "Frontend assets built"

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 8. Final checks & summary                                                 │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 8/8 — Setup Complete"

echo ""
echo -e "${GREEN}${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║            ✅  Setup completed successfully!          ║${NC}"
echo -e "${GREEN}${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}Quick Reference:${NC}"
echo -e "  ───────────────────────────────────────────────────"
echo -e "  Start dev server:   ${CYAN}composer run dev${NC}"
echo -e "  Run tests:          ${CYAN}php artisan test --compact${NC}"
echo -e "  Run linter:         ${CYAN}vendor/bin/pint --dirty${NC}"
echo -e "  Build assets:       ${CYAN}npm run build${NC}"
echo ""
