<?php

use App\Models\User;
use App\Modules\DocumentRequests\Models\DocumentRequest;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

use function Pest\Laravel\actingAs;

beforeEach(function () {
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    $hrRole = Role::create(['name' => 'hr_admin']);
    Role::create(['name' => 'hr_staff']);
    Permission::create(['name' => 'document_requests.view']);
    Permission::create(['name' => 'document_requests.manage']);
    $hrRole->givePermissionTo('document_requests.view', 'document_requests.manage');

    $this->employee = User::factory()->create();
    $this->employee->givePermissionTo('document_requests.view');

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

it('allows an employee to create a request for themselves', function () {
    actingAs($this->employee)
        ->post(route('documentrequests.store'), [
            'user_id' => $this->employee->id,
            'requests' => ['Certificate of Employment'],
            'purpose' => 'Loan application',
        ])
        ->assertRedirect(route('documentrequests.index'));

    $this->assertDatabaseHas('document_requests', [
        'user_id' => $this->employee->id,
        'requested_by' => $this->employee->id,
        'purpose' => 'Loan application',
        'status' => 'Pending',
    ]);
});

it('prevents an employee from creating a request for someone else', function () {
    $otherEmployee = User::factory()->create();
    actingAs($this->employee)
        ->post(route('documentrequests.store'), [
            'user_id' => $otherEmployee->id,
            'requests' => ['Service Record'],
            'purpose' => 'Record verification',
        ])
        ->assertInvalid(['user_id']);
});

it('allows hr to create a request for another employee', function () {
    actingAs($this->hrAdmin)
        ->post(route('documentrequests.store'), [
            'user_id' => $this->employee->id,
            'requests' => ['Service Record'],
            'purpose' => 'Record verification',
        ])
        ->assertRedirect(route('documentrequests.index'));

    $this->assertDatabaseHas('document_requests', [
        'user_id' => $this->employee->id,
        'requested_by' => $this->hrAdmin->id,
        'purpose' => 'Record verification',
    ]);
});

it('prevents non-hr users from transitioning status to received', function () {
    $request = DocumentRequest::create([
        'user_id' => $this->employee->id,
        'requested_by' => $this->employee->id,
        'requests' => ['Certificate of Employment'],
        'purpose' => 'Loan application',
        'status' => 'Pending',
    ]);

    actingAs($this->employee)
        ->post(route('documentrequests.receive', $request))
        ->assertForbidden();
});

it('allows hr users to transition status to received', function () {
    $request = DocumentRequest::create([
        'user_id' => $this->employee->id,
        'requested_by' => $this->employee->id,
        'requests' => ['Certificate of Employment'],
        'purpose' => 'Loan application',
        'status' => 'Pending',
    ]);

    actingAs($this->hrAdmin)
        ->post(route('documentrequests.receive', $request))
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $request->id,
        'status' => 'Received',
        'received_by' => $this->hrAdmin->id,
    ]);
});
