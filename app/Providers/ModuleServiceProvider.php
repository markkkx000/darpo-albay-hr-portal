<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $modulesPath = app_path('Modules');

        if (! File::isDirectory($modulesPath)) {
            return;
        }

        $modules = File::directories($modulesPath);

        foreach ($modules as $modulePath) {
            $moduleName = basename($modulePath);

            // Register Routes
            $routePath = $modulePath.'/routes.php';
            if (File::exists($routePath)) {
                $this->registerRoutes($moduleName, $routePath);
            }

            // Register Views (Inertia handles this differently, but we can register Blade if needed)
            // For Inertia, we just need to make sure the components are in the right place.
        }
    }

    /**
     * Register module routes.
     */
    protected function registerRoutes(string $moduleName, string $routePath): void
    {
        Route::middleware('web')
            ->prefix(strtolower($moduleName))
            ->name(strtolower($moduleName).'.')
            ->group($routePath);
    }
}
