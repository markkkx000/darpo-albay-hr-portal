<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Spatie\Permission\Models\Role;

$roles = Role::with('permissions')->get();

foreach ($roles as $role) {
    echo "========================================\n";
    echo 'ROLE: '.strtoupper($role->name)."\n";
    echo "========================================\n";

    $permissions = $role->permissions->pluck('name')->sort();

    if ($permissions->isEmpty()) {
        echo "  (No specific permissions assigned)\n";
    } else {
        foreach ($permissions as $permission) {
            echo "  [x] $permission\n";
        }
    }
    echo "\n";
}
