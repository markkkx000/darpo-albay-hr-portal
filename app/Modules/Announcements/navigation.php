<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Announcements',
        'href' => '/announcements',
        'icon' => 'Megaphone',
        'permission' => 'announcements.view',
    ]);
};
