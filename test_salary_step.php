<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
echo "Before update: " . $user->salary_step . "\n";
$user->update(['salary_step' => 6]);
echo "After update: " . $user->refresh()->salary_step . "\n";
