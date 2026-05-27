<?php

use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();
    Role::create(['name' => 'hr_admin']);

    $this->employee = User::factory()->create();
    $this->hrAdmin = User::factory()->create();
    $this->hrAdmin->assignRole('hr_admin');
});

it('allows employees to view their document requests', function () {
    actingAs($this->employee)
        ->get(route('documentrequests.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Modules/DocumentRequests/Index'));
});

it('allows hr to view the document requests queue', function () {
    actingAs($this->hrAdmin)
        ->get(route('documentrequests.index'))
        ->assertStatus(200)
        ->assertInertia(fn ($page) => $page->component('Modules/DocumentRequests/Index'));
});
