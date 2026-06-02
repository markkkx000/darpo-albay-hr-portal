<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    // Support Tickets is typically accessed via the sidebar, but it can be a global item.
    // If we want it in the global sidebar, we can register it. But since it's already in the sidebar statically or via global settings, we might just register it here with a generic icon.
    $registry->registerNavigation([
        'title' => 'Help & Support',
        'icon' => 'Lifebuoy',
        'route' => 'supporttickets.index',
        'permission' => null,
        'order' => 999,
    ]);
};
