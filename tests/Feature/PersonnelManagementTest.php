<?php

use App\Models\User;
use App\Modules\Personnel\Models\Department;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('hr_admin');

    $this->department = Department::factory()->create();
    $this->position = Position::factory()->create(['department_id' => $this->department->id]);
    $this->status = EmploymentStatus::factory()->create();
});

test('authorized users can view personnel directory', function () {
    $response = $this->actingAs($this->admin)->get(route('personnel.index'));
    $response->assertStatus(200);
});

test('unauthorized users cannot view personnel directory', function () {
    $user = User::factory()->create();
    $user->assignRole('employee');

    $response = $this->actingAs($user)->get(route('personnel.index'));
    $response->assertStatus(403);
});

test('can create a new employee record', function () {
    $data = [
        'employee_number' => 'P-001',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->status->id,
        'hire_date' => now()->format('Y-m-d'),
    ];

    $response = $this->actingAs($this->admin)->post(route('personnel.store'), $data);

    $response->assertRedirect(route('personnel.index'));
    $this->assertDatabaseHas('users', [
        'employee_number' => 'P-001',
        'first_name' => 'John',
        'last_name' => 'Doe',
    ]);
});

test('can archive an employee record', function () {
    $superAdmin = User::factory()->create();
    $superAdmin->assignRole('super_admin');

    $employee = User::factory()->create();

    $response = $this->actingAs($superAdmin)->delete(route('personnel.destroy', $employee->id));

    $response->assertRedirect(route('personnel.index'));
    $this->assertSoftDeleted('users', ['id' => $employee->id]);
});

test('can view archived records', function () {
    $employee = User::factory()->create();
    $employee->delete();

    $response = $this->actingAs($this->admin)->get(route('personnel.archived'));
    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Modules/Personnel/Archived')
        ->has('employees.data')
    );
});

test('can restore an archived employee record', function () {
    $employee = User::factory()->create();
    $employee->delete();

    $this->assertSoftDeleted('users', ['id' => $employee->id]);

    $response = $this->actingAs($this->admin)->post(route('personnel.restore', $employee->id));

    $response->assertRedirect(route('personnel.index'));
    $this->assertDatabaseHas('users', [
        'id' => $employee->id,
        'deleted_at' => null,
    ]);
});

test('validates unique employee number', function () {
    User::factory()->create(['employee_number' => 'DUPLICATE']);

    $data = [
        'employee_number' => 'DUPLICATE',
        'first_name' => 'Test',
        'last_name' => 'User',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->status->id,
        'hire_date' => now()->format('Y-m-d'),
    ];

    $response = $this->actingAs($this->admin)->post(route('personnel.store'), $data);
    $response->assertSessionHasErrors('employee_number');
});

test('can update an employee record', function () {
    $employee = User::factory()->create([
        'employee_number' => 'ORIGINAL-001',
        'first_name' => 'Original',
        'last_name' => 'Name',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->status->id,
        'hire_date' => '2020-01-01',
    ]);

    $data = [
        'employee_number' => 'ORIGINAL-001', // Keeping the same ID to test unique ignore
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->status->id,
        'hire_date' => '2020-01-01',
    ];

    $response = $this->actingAs($this->admin)->put(route('personnel.update', $employee->id), $data);

    $response->assertRedirect(route('personnel.show', $employee->id));
    $this->assertDatabaseHas('users', [
        'id' => $employee->id,
        'first_name' => 'Updated',
    ]);
});
