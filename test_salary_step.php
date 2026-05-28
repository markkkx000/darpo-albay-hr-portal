<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$user = User::first();
echo 'Before update: '.$user->salary_step."\n";
$user->update(['salary_step' => 6]);
echo 'After update: '.$user->refresh()->salary_step."\n";
