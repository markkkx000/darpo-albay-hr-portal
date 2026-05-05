<?php

namespace Tests\Feature\Modules\Roles;

use App\Models\User;
use App\Modules\Roles\Services\RoleService;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
    $this->withoutMiddleware(PreventRequestForgery::class);
    $this->withoutVite();

    // Permissions are seeded by DatabaseSeeder usually, but for unit-like feature tests we ensure they exist
    Permission::firstOrCreate(['name' => 'roles.manage']);
    Permission::firstOrCreate(['name' => 'personnel.view']);

    $this->superAdmin = User::factory()->create();
    $superRole = Role::firstOrCreate(['name' => 'super_admin']);
    $superRole->syncPermissions(Permission::all());
    $this->superAdmin->assignRole($superRole);

    $this->hrAdmin = User::factory()->create();
    $hrRole = Role::firstOrCreate(['name' => 'hr_admin']);
    $hrRole->syncPermissions(['personnel.view']);
    $this->hrAdmin->assignRole($hrRole);

    $this->employee = User::factory()->create();
    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $this->employee->assignRole($employeeRole);
});

it('restricts roles module from non-super-admins', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/roles')
        ->assertForbidden();

    $this->actingAs($this->employee)
        ->get('/roles')
        ->assertForbidden();
});

it('allows super admin to access roles dashboard', function () {
    $this->actingAs($this->superAdmin)
        ->get('/roles')
        ->assertOk();
});

it('allows super admin to create a new role', function () {
    $this->actingAs($this->superAdmin)
        ->postJson('/roles', [
            'name' => 'auditor',
            'permissions' => ['personnel.view'],
        ])
        ->assertStatus(302);

    $this->assertDatabaseHas('roles', ['name' => 'auditor']);
    $role = Role::findByName('auditor');
    expect($role->hasPermissionTo('personnel.view'))->toBeTrue();
});

it('prevents renaming core roles', function () {
    $hrRole = Role::findByName('hr_admin');

    // This should fail validation/service logic
    $this->actingAs($this->superAdmin)
        ->put("/roles/{$hrRole->id}", [
            'name' => 'human_resources_administrator',
            'permissions' => ['personnel.view'],
        ]);

    $this->assertDatabaseHas('roles', ['name' => 'hr_admin']);
    $this->assertDatabaseMissing('roles', ['name' => 'human_resources_administrator']);
});

it('prevents deleting core roles', function () {
    $hrRole = Role::findByName('hr_admin');

    $this->actingAs($this->superAdmin)
        ->deleteJson("/roles/{$hrRole->id}")
        ->assertStatus(302)
        ->assertSessionHasErrors(['error']);

    $this->assertDatabaseHas('roles', ['name' => 'hr_admin']);
});

it('allows super admin to assign a role to a user', function () {
    $user = User::factory()->create();
    $user->assignRole('employee');

    $this->actingAs($this->superAdmin)
        ->putJson("/roles/users/{$user->id}/assign", [
            'role' => 'hr_admin',
        ])
        ->assertValid(['role'])
        ->assertStatus(302);

    $user = $user->fresh();
    expect($user->hasRole('hr_admin'))->toBeTrue();
    expect($user->fresh()->hasRole('employee'))->toBeFalse(); // Single role enforcement
});

it('prevents assigning super_admin role via UI', function () {
    $user = User::factory()->create();
    $user->assignRole('employee');

    $this->actingAs($this->superAdmin)
        ->putJson("/roles/users/{$user->id}/assign", [
            'role' => 'super_admin',
        ])
        ->assertStatus(302)
        ->assertSessionHasErrors(['error']);
});

it('service syncs user role correctly', function () {
    $user = User::factory()->create();
    $user->assignRole('employee');

    $service = app(RoleService::class);
    $service->syncUserRole($user, 'hr_admin');

    expect($user->fresh()->hasRole('hr_admin'))->toBeTrue();
    expect($user->fresh()->hasRole('employee'))->toBeFalse();
});
