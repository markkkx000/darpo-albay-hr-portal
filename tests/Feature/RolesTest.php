<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    $this->employee = User::factory()->create();
    $this->employee->assignRole('employee');
});

test('super admin can assign roles to users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->superAdmin)->put(route('roles.users.assign', $user->id), [
        'role' => 'hr_admin',
    ]);

    $response->assertRedirect();

    $user->refresh();
    expect($user->hasRole('hr_admin'))->toBeTrue();
});

test('regular employee cannot assign roles (escalation check)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->employee)->put(route('roles.users.assign', $user->id), [
        'role' => 'super_admin',
    ]);

    $response->assertStatus(403);

    $user->refresh();
    expect($user->hasRole('super_admin'))->toBeFalse();
});

test('super admin can view roles and permissions page', function () {
    $response = $this->actingAs($this->superAdmin)->get(route('roles.index'));
    $response->assertStatus(200);
});

test('regular employee cannot view roles page', function () {
    $response = $this->actingAs($this->employee)->get(route('roles.index'));
    $response->assertStatus(403);
});
