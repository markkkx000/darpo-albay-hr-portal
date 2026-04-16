<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Modules\Attendance\Services\AttendanceService;
use Illuminate\Contracts\Console\Kernel;

$user = User::first();
if (! $user) {
    echo "No user found\n";
    exit;
}

echo "User: {$user->email}\n";

$service = app(AttendanceService::class);

try {
    $attendance = $service->getTodayAttendance($user);
    if ($attendance) {
        echo 'Already clocked in: '.json_encode($attendance)."\n";
    } else {
        echo "Not clocked in. Attempting...\n";
        $attendance = $service->clockIn($user);
        echo 'Clocked in: '.json_encode($attendance)."\n";
    }
} catch (Exception $e) {
    echo 'Error: '.$e->getMessage()."\n";
}
