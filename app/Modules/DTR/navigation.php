<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'DTR Export',
        'href' => '/dtr',
        'icon' => 'FileText',
        'permission' => 'attendance.view',
    ]);
};
