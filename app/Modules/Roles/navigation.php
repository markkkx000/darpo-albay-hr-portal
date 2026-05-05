<?php

use App\Core\Services\ModuleRegistry;

return function (ModuleRegistry $registry) {
    $registry->register([
        'title' => 'Roles & Permissions',
        'href' => '/roles',
        'icon' => 'ShieldCheck',
        'permission' => 'roles.manage',
    ]);
};
