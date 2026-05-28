<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
Auth::login($user);

$request = Illuminate\Http\Request::create('/personnel/' . $user->id, 'PUT', [
    'salary_step' => 7,
    'first_name' => $user->first_name,
    'last_name' => $user->last_name,
    'email' => $user->email,
    '_method' => 'put'
]);

$controller = $app->make(App\Modules\Personnel\Controllers\PersonnelController::class);
try {
    // Need to bypass FormRequest validation for a quick test, or just use the service directly.
    // Actually, we can just test if the service updates it correctly from array.
    $service = $app->make(App\Modules\Personnel\Services\EmployeeService::class);
    $service->updateEmployee($user, ['salary_step' => 7]);
    echo "Direct service update successful. DB step: " . $user->refresh()->salary_step . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
