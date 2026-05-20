<?php

use App\Models\User;
use App\Modules\Leave\Models\Holiday;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'leave.view']);
    Permission::firstOrCreate(['name' => 'leave.settings.manage']);
    Permission::firstOrCreate(['name' => 'leave.manage']);

    $this->superAdmin = User::factory()->create();
    $superRole = Role::firstOrCreate(['name' => 'super_admin']);
    $superRole->syncPermissions(['leave.view', 'leave.settings.manage', 'leave.manage']);
    $this->superAdmin->assignRole($superRole);

    $this->employee = User::factory()->create();
    $this->employee->assignRole(Role::firstOrCreate(['name' => 'employee']));
});

it('restricts leave module from regular employees', function () {
    $this->actingAs($this->employee)
        ->get('/leave')
        ->assertForbidden();
});

it('allows super admin to access leave dashboard', function () {
    $this->actingAs($this->superAdmin)
        ->get('/leave')
        ->assertOk();
});

it('allows super admin to access leave settings', function () {
    $this->actingAs($this->superAdmin)
        ->get('/leave/settings')
        ->assertOk();
});

it('allows super admin to access leave calendar with holidays', function () {
    Holiday::create([
        'name' => 'Test Holiday',
        'date' => now()->format('Y-m-d'),
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get('/leave/calendar')
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('Modules/Leave/Calendar')
        ->has('holidays')
    );
});
