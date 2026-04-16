<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Attendance',
        'href' => '/attendance',
        'icon' => 'Clock',
        'permission' => 'attendance.clock',
    ]);
};
