<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Leave Tracking',
        'href' => '/leave',
        'icon' => 'CalendarClock',
        'permission' => ['leave.view'],
    ]);
};
