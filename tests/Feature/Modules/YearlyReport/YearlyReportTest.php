<?php

namespace Tests\Feature\Modules\YearlyReport;

use App\Models\User;
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

    Permission::firstOrCreate(['name' => 'personnel.view']);

    $this->superAdmin = User::factory()->create();
    $superRole = Role::firstOrCreate(['name' => 'super_admin']);
    $superRole->syncPermissions(Permission::all());
    $this->superAdmin->assignRole($superRole);

    $this->employee = User::factory()->create();
    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $this->employee->assignRole($employeeRole);
});

it('requires authentication to access yearly report', function () {
    $this->get(route('yearlyreport.index'))
        ->assertRedirect(route('login'));
});

it('denies access to users without personnel.view permission', function () {
    $this->actingAs($this->employee)
        ->get(route('yearlyreport.index'))
        ->assertForbidden();
});

it('displays the yearly report index page for authorized users', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('yearlyreport.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Modules/YearlyReport/Index')
            ->has('results')
            ->has('year')
            ->has('filter')
        );
});

it('accepts year and filter query parameters', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('yearlyreport.index', ['year' => 2025, 'filter' => 'all']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('year', 2025)
            ->where('filter', 'all')
        );
});

it('denies export to users without personnel.view permission', function () {
    $this->actingAs($this->employee)
        ->get(route('yearlyreport.export'))
        ->assertForbidden();
});
