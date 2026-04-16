<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Attendance',
        'href' => '/attendance',
        'icon' => 'Clock',
        'permission' => 'attendance.clock',
    ]);

    $registry->register([
        'title' => 'Attendance Management',
        'href' => '/attendance/manage/records',
        'icon' => 'CalendarClock',
        'permission' => 'attendance.manage',
    ]);
};
