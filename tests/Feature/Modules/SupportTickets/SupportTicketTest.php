<?php

namespace Tests\Feature\Modules\SupportTickets;

use App\Models\User;
use App\Modules\SupportTickets\Models\SupportTicket;
use App\Modules\SupportTickets\Services\GitHubSupportService;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

uses(RefreshDatabase::class);

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
    $this->withoutMiddleware(PreventRequestForgery::class);
    $this->withoutVite();

    $this->employee = User::factory()->create();
    $employeeRole = Role::firstOrCreate(['name' => 'employee']);
    $this->employee->assignRole($employeeRole);

    $this->otherUser = User::factory()->create();
    $otherRole = Role::firstOrCreate(['name' => 'employee']);
    $this->otherUser->assignRole($otherRole);
});

it('requires authentication to access support tickets', function () {
    $this->get(route('supporttickets.index'))
        ->assertRedirect(route('login'));
});

it('displays the support tickets index page', function () {
    $this->actingAs($this->employee)
        ->get(route('supporttickets.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Modules/SupportTickets/Index')
            ->has('tickets')
        );
});

it('only shows tickets belonging to the authenticated user', function () {
    SupportTicket::create([
        'user_id' => $this->employee->id,
        'github_issue_id' => 1,
        'title' => 'My ticket',
        'type' => 'Bug',
        'status' => 'open',
    ]);

    SupportTicket::create([
        'user_id' => $this->otherUser->id,
        'github_issue_id' => 2,
        'title' => 'Other user ticket',
        'type' => 'Bug',
        'status' => 'open',
    ]);

    $this->actingAs($this->employee)
        ->get(route('supporttickets.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('tickets', 1)
        );
});

it('validates required fields when creating a ticket', function () {
    $this->mock(GitHubSupportService::class);

    $this->actingAs($this->employee)
        ->post(route('supporttickets.store'), [])
        ->assertSessionHasErrors(['type', 'title', 'description']);
});

it('validates ticket type must be a valid option', function () {
    $this->mock(GitHubSupportService::class);

    $this->actingAs($this->employee)
        ->post(route('supporttickets.store'), [
            'type' => 'InvalidType',
            'title' => 'Test ticket',
            'description' => 'Test description',
        ])
        ->assertSessionHasErrors('type');
});

it('prevents viewing another user ticket', function () {
    $ticket = SupportTicket::create([
        'user_id' => $this->otherUser->id,
        'github_issue_id' => 99,
        'title' => 'Private ticket',
        'type' => 'Bug',
        'status' => 'open',
    ]);

    $this->actingAs($this->employee)
        ->get(route('supporttickets.show', $ticket))
        ->assertForbidden();
});
