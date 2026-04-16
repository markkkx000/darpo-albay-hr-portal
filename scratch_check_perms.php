<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

$user = User::where('email', 'admin@darpo-albay.gov.ph')->first();
if (! $user) {
    echo "No user found\n";
    exit;
}

echo "User: {$user->email}\n";
echo 'Roles: '.$user->roles->pluck('name')->implode(', ')."\n";
echo 'Permissions: '.$user->getAllPermissions()->pluck('name')->implode(', ')."\n";
