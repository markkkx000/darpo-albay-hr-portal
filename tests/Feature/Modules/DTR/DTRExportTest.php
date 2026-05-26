<?php

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\DTR\Services\DTRService;
use App\Modules\Leave\Models\Holiday;
use Illuminate\Database\Eloquent\Collection;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'dtr.manage']);

    $this->hrAdmin = User::factory()->create();
    $hrRole = Role::firstOrCreate(['name' => 'hr_admin']);
    $hrRole->syncPermissions(['dtr.manage']);
    $this->hrAdmin->assignRole($hrRole);

    $this->employee = User::factory()->create();
    $this->employee->assignRole(Role::firstOrCreate(['name' => 'employee']));

    $this->otherEmployee = User::factory()->create();
    $this->otherEmployee->assignRole(Role::firstOrCreate(['name' => 'employee']));

    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => now()->startOfMonth()->toDateString(),
        'am_clock_in' => now()->startOfMonth()->setHour(8),
        'am_clock_out' => now()->startOfMonth()->setHour(12),
        'pm_clock_in' => now()->startOfMonth()->setHour(13),
        'pm_clock_out' => now()->startOfMonth()->setHour(17),
    ]);
});

it('blocks unauthenticated user from dtr index', function () {
    $this->get('/dtr')->assertRedirect('/login');
});

it('allows hr admin to access dtr index', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/dtr')
        ->assertOk();
});

it('allows regular employee to access dtr index', function () {
    $this->actingAs($this->employee)
        ->get('/dtr')
        ->assertOk();
});

it('allows hr admin to export any employee dtr as pdf', function () {
    $response = $this->actingAs($this->hrAdmin)
        ->post('/dtr/export', [
            'user_id' => $this->employee->id,
            'month' => now()->month,
            'year' => now()->year,
            'format' => 'pdf',
        ])
        ->assertOk();

    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

it('allows hr admin to export any employee dtr as csv', function () {
    $response = $this->actingAs($this->hrAdmin)
        ->post('/dtr/export', [
            'user_id' => $this->employee->id,
            'month' => now()->month,
            'year' => now()->year,
            'format' => 'csv',
        ])
        ->assertOk();

    expect($response->headers->get('Content-Type'))->toContain('text/csv');
});

it('allows regular employee to export own dtr as pdf', function () {
    $response = $this->actingAs($this->employee)
        ->post('/dtr/export', [
            'user_id' => $this->employee->id,
            'month' => now()->month,
            'year' => now()->year,
            'format' => 'pdf',
        ])
        ->assertOk();

    expect($response->headers->get('Content-Type'))->toContain('application/pdf');
});

it('blocks regular employee from exporting other employee dtr', function () {
    $this->actingAs($this->employee)
        ->post('/dtr/export', [
            'user_id' => $this->otherEmployee->id,
            'month' => now()->month,
            'year' => now()->year,
            'format' => 'pdf',
        ])
        ->assertForbidden();
});

it('validates required parameters for export', function () {
    $this->actingAs($this->hrAdmin)
        ->postJson('/dtr/export', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['user_id', 'month', 'year', 'format']);
});

it('formats weekend days without splitting them into two columns', function () {
    $service = new DTRService;

    // March 1, 2026 is Sunday, March 7 is Saturday.
    $attendance = new Collection;
    $dailyData = $service->generateDailyData($attendance, 3, 2026);

    // Day 1 (Sunday)
    $sunday = collect($dailyData)->firstWhere('day', 1);
    expect($sunday['am_in'])->toBe('SUNDAY');
    expect($sunday['am_out'])->toBeNull();

    // Day 7 (Saturday)
    $saturday = collect($dailyData)->firstWhere('day', 7);
    expect($saturday['am_in'])->toBe('SATURDAY');
    expect($saturday['am_out'])->toBeNull();
});

it('formats holidays without splitting them into two columns', function () {
    $service = new DTRService;

    // Create a holiday on March 2, 2026
    Holiday::create([
        'name' => 'Test Holiday',
        'date' => '2026-03-02',
    ]);

    $attendance = new Collection;
    $dailyData = $service->generateDailyData($attendance, 3, 2026);

    $holiday = collect($dailyData)->firstWhere('day', 2);
    expect($holiday['am_in'])->toBe('HOLIDAY');
    expect($holiday['am_out'])->toBeNull();
});

it('formats compressed Fridays without splitting them into two columns', function () {
    $service = new DTRService;

    $attendance = new Collection;
    // March 6, 2026 is a Friday.
    // Official hours containing "compressed"
    $dailyData = $service->generateDailyData($attendance, 3, 2026, 'Compressed 4-day workweek');

    $friday = collect($dailyData)->firstWhere('day', 6);
    expect($friday['am_in'])->toBe('FRIDAY');
    expect($friday['am_out'])->toBeNull();
});
