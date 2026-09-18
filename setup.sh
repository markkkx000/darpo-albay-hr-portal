#!/bin/bash

# =============================================================================
# DARPO Albay HR Portal — Project Jumpstart Script (Unix/Linux/macOS)
# =============================================================================
# Automates a fresh development environment setup with Docker (Sail) support.
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

# Ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

clear
echo -e "${BOLD}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║   DARPO Albay HR Portal — Project Jumpstart (Sail)    ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════════╝${NC}"

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 1. Environment Detection                                                    │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 1/6 — Environment Detection"

HAS_DOCKER=false
if command -v docker &>/dev/null; then
    if docker info &>/dev/null; then
        HAS_DOCKER=true
        success "Docker is running"
    else
        if grep -qi microsoft /proc/version; then
            error "Docker is NOT running. Please start Docker Desktop on Windows and ensure WSL integration is enabled."
        else
            error "Docker is NOT running. Please start the Docker service (e.g., 'sudo systemctl start docker')."
        fi
        exit 1
    fi
else
    warn "Docker not detected. Local installation will be required."
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 2. Environment Configuration                                                │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 2/6 — Environment Configuration"

if [ ! -f .env ]; then
    cp .env.example .env
    success "Created .env from .env.example"
    
    if [ "$HAS_DOCKER" = true ]; then
        info "Configuring .env for Docker PostgreSQL ..."
        sed -i 's/DB_CONNECTION=sqlite/DB_CONNECTION=pgsql/' .env
        sed -i 's/DB_HOST=127.0.0.1/DB_HOST=pgsql/' .env
        sed -i 's/DB_PORT=3306/DB_PORT=5432/' .env
        sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/' .env
        
        # Add Sail User IDs
        {
            echo ""
            echo "WWWUSER=$(id -u)"
            echo "WWWGROUP=$(id -g)"
        } >> .env
        success ".env configured for Docker PostgreSQL (User ID: $(id -u))"
    fi
else
    success ".env file already exists"
fi

# Ensure storage directories exist and have proper permissions
mkdir -p storage/framework/{sessions,views,cache}
chmod -R 775 storage bootstrap/cache

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 3. Dependency Installation                                                  │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 3/6 — Installing Dependencies"

if [ ! -d vendor ]; then
    if [ "$HAS_DOCKER" = true ]; then
        info "Using Docker to install Composer dependencies ..."
        docker run --rm \
            -u "$(id -u):$(id -g)" \
            -v "$(pwd):/var/www/html" \
            -w /var/www/html \
            laravelsail/php84-composer:latest \
            composer install --ignore-platform-reqs --no-interaction
    else
        info "Installing Composer dependencies via local PHP ..."
        composer install --no-interaction
    fi
    success "Composer dependencies installed"
else
    success "Vendor directory already exists"
fi

if [ "$HAS_DOCKER" = true ]; then
    info "Starting Docker containers (Sail) ..."
    ./vendor/bin/sail up -d
    info "Waiting for PostgreSQL database to be ready..."
    sleep 8 # Give postgres container time to initialize
fi

if [ ! -d node_modules ]; then
    info "Installing NPM dependencies ..."
    if [ "$HAS_DOCKER" = true ]; then
        ./vendor/bin/sail npm install
    else
        npm install
    fi
    success "NPM dependencies installed"
fi

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 4. Application Setup                                                        │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 4/6 — Application Setup"

if [ "$HAS_DOCKER" = true ]; then
    info "Generating App Key ..."
    ./vendor/bin/sail artisan key:generate --no-interaction
    
    info "Linking Storage ..."
    ./vendor/bin/sail artisan storage:link || true
    
    info "Running Migrations ..."
    ./vendor/bin/sail artisan migrate --no-interaction
    
    info "Running Seeders ..."
    ./vendor/bin/sail artisan db:seed --no-interaction
    
    info "Warming up Wayfinder ..."
    ./vendor/bin/sail artisan wayfinder:generate --with-form
    
    info "Building Assets ..."
    ./vendor/bin/sail npm run build
    
    info "Clearing Caches ..."
    ./vendor/bin/sail artisan optimize:clear
else
    php artisan key:generate --no-interaction
    php artisan storage:link || true
    php artisan migrate --no-interaction
    php artisan db:seed --no-interaction
    php artisan wayfinder:generate --with-form
    npm run build
    php artisan optimize:clear
fi

success "Application setup complete"

# ┌─────────────────────────────────────────────────────────────────────────────┐
# │ 5. Final Summary                                                            │
# └─────────────────────────────────────────────────────────────────────────────┘
step "Step 5/6 — Summary"

echo -e "\n${GREEN}${BOLD}Setup completed successfully!${NC}"
echo -e "\n  ${BOLD}Daily Commands:${NC}"
if [ "$HAS_DOCKER" = true ]; then
    echo -e "  Start App:      ${CYAN}./vendor/bin/sail up -d${NC}"
    echo -e "  Stop App:       ${CYAN}./vendor/bin/sail down${NC}"
    echo -e "  Vite (Dev):     ${CYAN}./vendor/bin/sail npm run dev${NC}"
    echo -e "  Run Tests:      ${CYAN}./vendor/bin/sail artisan test --compact${NC}"
    echo -e "  Run Pint:       ${CYAN}./vendor/bin/sail vendor/bin/pint --dirty${NC}"
    echo -e "  Run PHPStan:    ${CYAN}./vendor/bin/sail php -d memory_limit=2G ./vendor/bin/phpstan analyse${NC}"
else
    echo -e "  Start App:      ${CYAN}composer run dev${NC}"
    echo -e "  Run Tests:      ${CYAN}php artisan test --compact${NC}"
fi

# Get APP_URL from .env
APP_URL=$(grep '^APP_URL=' .env | cut -d '=' -f2- | sed -e 's/^"//' -e 's/"$//' | tr -d '\r')
APP_URL=${APP_URL:-http://localhost}

echo -e "\n  Access the site at: ${BLUE}${APP_URL}${NC}\n"
