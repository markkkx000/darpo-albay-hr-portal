<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated employee receives employee metrics and null admin/hr metrics', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock permissions to be false
    Gate::define('roles.manage', fn () => false);
    Gate::define('personnel.view', fn () => false);
    Gate::define('leave.manage', fn () => false);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    // Verify Inertia data structures
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('employeeData')
        ->has('employeeData.today_status')
        ->has('employeeData.leave_balances')
        ->where('adminData', null)
        ->where('hrData', null)
    );
});

test('authenticated admin receives admin and HR metrics stacked', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock roles.manage to return true
    Gate::define('roles.manage', fn () => true);
    Gate::define('personnel.view', fn () => false);
    Gate::define('leave.manage', fn () => false);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('adminData')
        ->has('adminData.total_users')
        ->has('adminData.active_sessions')
        ->has('adminData.failed_jobs')
        ->has('hrData') // Super admin has HR dashboard stacked under admin
        ->has('hrData.total_employees')
        ->has('employeeData') // Employee data is passed but UI may not render it
    );
});

test('authenticated HR personnel receives HR metrics', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    // Mock HR permissions to return true
    Gate::define('roles.manage', fn () => false);
    Gate::define('personnel.view', fn () => true);
    Gate::define('leave.manage', fn () => false);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('hrData')
        ->has('hrData.total_employees')
        ->has('hrData.pending_leaves')
        ->has('hrData.active_today')
        ->has('employeeData') // Employee data is passed but UI may not render it
        ->where('adminData', null)
    );
});
