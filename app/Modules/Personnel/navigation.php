<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Personnel Directory',
        'href' => '/personnel',
        'icon' => 'Users',
        'permission' => 'personnel.view',
    ]);
};
