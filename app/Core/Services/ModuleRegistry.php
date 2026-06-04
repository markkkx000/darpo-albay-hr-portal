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
        $order = [
            'Attendance' => 10,
            'Announcements' => 20,
            'Leave Tracking' => 30,
            'Personnel Directory' => 40,
            'Yearly Report' => 50,
            'Travel Orders' => 60,
            'Document Requests' => 70,
            'DTR Export' => 80,
            'Roles & Permissions' => 90,
        ];

        usort($this->navigation, function ($a, $b) use ($order) {
            $orderA = $order[$a['title']] ?? 999;
            $orderB = $order[$b['title']] ?? 999;

            return $orderA <=> $orderB;
        });

        return $this->navigation;
    }
}
