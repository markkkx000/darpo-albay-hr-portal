<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'System Logs',
        'href' => '/audit/admin/system-audit',
        'icon' => 'Shield',
        'permission' => 'system.audit', // Super Admin only
    ]);
};
