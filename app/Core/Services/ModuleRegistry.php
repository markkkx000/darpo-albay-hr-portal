<?php

namespace App\Core\Services;

class ModuleRegistry
{
    protected array $navigation = [];

    /**
     * Register a navigation item.
     */
    public function registerNavigation(array $item): void
    {
        $this->navigation[] = $item;
    }

    /**
     * Alias for registerNavigation.
     */
    public function register(array $item): void
    {
        $this->registerNavigation($item);
    }

    /**
     * Get all registered navigation items.
     */
    public function getNavigation(): array
    {
        // For now, just return all. Later we can filter by permissions here.
        return $this->navigation;
    }
}
