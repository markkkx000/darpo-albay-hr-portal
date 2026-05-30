#!/bin/bash
set -euo pipefail

echo "Running production deployment..."

# Install/update dependencies
composer install --no-dev --optimize-autoloader --no-interaction

# Run migrations
php artisan migrate --force --no-interaction

# Clear and rebuild all caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Reset Spatie permission cache
php artisan permission:cache-reset

# Build frontend assets
npm ci
npm run build

echo "Deployment complete."
