<?php

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
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
        'clock_in' => now()->startOfMonth()->setHour(8),
        'clock_out' => now()->startOfMonth()->setHour(17),
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
