<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Yearly Report',
        'href' => '/yearlyreport',
        'icon' => 'CalendarClock',
        'permission' => 'personnel.view',
    ]);
};
