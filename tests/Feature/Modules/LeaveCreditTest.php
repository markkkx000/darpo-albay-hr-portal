<?php

use App\Models\User;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveType;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('hr_admin');

    $this->employee = User::factory()->create();
    $this->employee->assignRole('employee');

    $this->leaveType = LeaveType::create([
        'name' => 'Vacation Leave',
        'code' => 'VL',
        'is_active' => true,
    ]);
});

test('hr admin can see all employee credits', function () {
    $this->actingAs($this->admin)
        ->get(route('leave.credits.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Modules/Leave/Credits')
            ->has('users.data')
            ->where('canManageCredits', true)
        );
});

test('employee can only see their own credits', function () {
    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'year' => now()->year,
        'balance' => 10,
        'used' => 2,
        'earned' => 12,
    ]);

    $this->actingAs($this->employee)
        ->get(route('leave.credits.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Modules/Leave/Credits')
            ->where('users', null)
            ->has('personalCredits', 1)
            ->where('canManageCredits', false)
        );
});

test('hr admin can update credits and it calculates earned correctly', function () {
    $this->actingAs($this->admin)
        ->put(route('leave.credits.update'), [
            'user_id' => $this->employee->id,
            'leave_type_id' => $this->leaveType->id,
            'year' => now()->year,
            'balance' => 15.5,
            'used' => 1.5,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('leave_credits', [
        'user_id' => $this->employee->id,
        'balance' => 15.5,
        'used' => 1.5,
        'earned' => 17.0, // 15.5 + 1.5
    ]);
});

test('credits.show returns JSON credits for a user', function () {
    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'year' => 2026,
        'balance' => 15.0,
        'used' => 0,
        'earned' => 15.0,
    ]);

    $this->actingAs($this->admin)
        ->get(route('leave.credits.show', ['user' => $this->employee->id]).'?year=2026')
        ->assertStatus(200)
        ->assertJsonFragment([
            'balance' => '15.000', // Cast to string because of decimal cast in model
            'leave_type_id' => $this->leaveType->id,
        ]);
});

test('employee can fetch their own credits via credits.show', function () {
    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $this->leaveType->id,
        'year' => 2026,
        'balance' => 10.0,
        'used' => 0,
        'earned' => 10.0,
    ]);

    $this->actingAs($this->employee)
        ->get(route('leave.credits.show', ['user' => $this->employee->id]).'?year=2026')
        ->assertStatus(200)
        ->assertJsonFragment([
            'balance' => '10.000',
        ]);
});
