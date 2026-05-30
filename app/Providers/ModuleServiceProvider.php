<?php

namespace App\Providers;

use App\Core\Services\ModuleRegistry;
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
        $this->app->singleton(ModuleRegistry::class);
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

            // Register Navigation
            $navPath = $modulePath.'/navigation.php';
            if (File::exists($navPath)) {
                $registry = $this->app->make(ModuleRegistry::class);
                (require $navPath)($registry);
            }

            // Register Commands
            $commandsPath = $modulePath.'/Commands';
            if ($this->app->runningInConsole() && File::isDirectory($commandsPath)) {
                $commandFiles = File::allFiles($commandsPath);
                $commands = [];
                foreach ($commandFiles as $file) {
                    $class = 'App\\Modules\\'.$moduleName.'\\Commands\\'.$file->getFilenameWithoutExtension();
                    if (class_exists($class)) {
                        $commands[] = $class;
                    }
                }
                if (! empty($commands)) {
                    $this->commands($commands);
                }
            }
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
