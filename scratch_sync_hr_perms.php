<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Spatie\Permission\Models\Role;

$roles = ['hr_admin', 'hr_staff'];
$permissions = ['attendance.clock', 'attendance.view_own'];

foreach ($roles as $roleName) {
    echo "Processing role: $roleName\n";
    try {
        $role = Role::findByName($roleName);
        $role->givePermissionTo($permissions);
        echo "  - Successfully synced attendance permissions.\n";
    } catch (Exception $e) {
        echo '  - Error: '.$e->getMessage()."\n";
    }
}

echo "Permission sync complete.\n";
