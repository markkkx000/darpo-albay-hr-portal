<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'leave.view']);
    Permission::firstOrCreate(['name' => 'leave.settings.manage']);

    $this->superAdmin = User::factory()->create();
    $superRole = Role::firstOrCreate(['name' => 'super_admin']);
    $superRole->syncPermissions(['leave.view', 'leave.settings.manage']);
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
