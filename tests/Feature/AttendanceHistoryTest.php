<?php

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'attendance.view']);
    Permission::firstOrCreate(['name' => 'attendance.clock']);
    Permission::firstOrCreate(['name' => 'attendance.logs.view']);

    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $employeeRole->syncPermissions(['attendance.view', 'attendance.clock']);

    $hrRole = Role::firstOrCreate(['name' => 'hr_admin']);
    $hrRole->syncPermissions(['attendance.view', 'attendance.logs.view']);

    $this->employee = User::factory()->create();
    $this->employee->assignRole($employeeRole);

    $this->hr = User::factory()->create();
    $this->hr->assignRole($hrRole);
});

it('requires authentication to access the history page', function () {
    $this->get('/attendance/history')
        ->assertRedirect('/login');
});

it('allows an authenticated employee to view their own history', function () {
    $this->actingAs($this->employee)
        ->get('/attendance/history')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Modules/Attendance/HistoryIndex')
            ->has('records')
            ->has('month')
            ->has('year')
        );
});

it('allows hr users to view their own history', function () {
    $this->actingAs($this->hr)
        ->get('/attendance/history')
        ->assertOk();
});

it('returns only the authenticated user\'s own records', function () {
    $now = Carbon::now();

    // Create a record for the employee
    $ownRecord = Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => $now->toDateString(),
    ]);

    // Create a record for another user
    $otherUser = User::factory()->create();
    Attendance::factory()->create([
        'user_id' => $otherUser->id,
        'date' => $now->toDateString(),
    ]);

    $response = $this->actingAs($this->employee)
        ->get('/attendance/history')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Modules/Attendance/HistoryIndex')
        ->where('records', fn ($records) =>
            collect($records)->every(fn ($r) => $r['user_id'] === $this->employee->id)
        )
    );
});

it('defaults to the current month and year', function () {
    $now = Carbon::now();

    $response = $this->actingAs($this->employee)
        ->get('/attendance/history')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('month', $now->month)
        ->where('year', $now->year)
    );
});

it('accepts a custom month and year via query string', function () {
    $response = $this->actingAs($this->employee)
        ->get('/attendance/history?month=3&year=2025')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('month', 3)
        ->where('year', 2025)
    );
});

it('returns only records for the requested month', function () {
    $targetMonth = Carbon::create(2025, 3, 15);
    $otherMonth = Carbon::create(2025, 4, 10);

    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => $targetMonth->toDateString(),
    ]);
    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => $otherMonth->toDateString(),
    ]);

    $response = $this->actingAs($this->employee)
        ->get('/attendance/history?month=3&year=2025')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('records', fn ($records) =>
            count($records) === 1 &&
            str_starts_with($records[0]['date'], '2025-03')
        )
    );
});

it('returns records ordered by date descending', function () {
    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => '2025-03-05',
    ]);
    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => '2025-03-20',
    ]);
    Attendance::factory()->create([
        'user_id' => $this->employee->id,
        'date' => '2025-03-12',
    ]);

    $response = $this->actingAs($this->employee)
        ->get('/attendance/history?month=3&year=2025')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->where('records', fn ($records) =>
            $records[0]['date'] === '2025-03-20' &&
            $records[1]['date'] === '2025-03-12' &&
            $records[2]['date'] === '2025-03-05'
        )
    );
});

it('clamps invalid month values to valid range', function () {
    $this->actingAs($this->employee)
        ->get('/attendance/history?month=0&year=2025')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('month', 1));

    $this->actingAs($this->employee)
        ->get('/attendance/history?month=13&year=2025')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('month', 12));
});
