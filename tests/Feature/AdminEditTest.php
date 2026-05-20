<?php

use App\Models\User;
use App\Modules\Personnel\Models\AppointmentStatus;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    $this->hrAdmin = User::factory()->create([
        'employee_number' => 'HR-0001',
    ]);
    $this->hrAdmin->assignRole('hr_admin');

    $this->division = Division::factory()->create();
    $this->position = Position::factory()->create(['division_id' => $this->division->id]);
    $this->status = AppointmentStatus::factory()->create();
});

test('super admin can edit hr admin', function () {
    $data = [
        'employee_number' => 'HR-0001',
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'division_id' => $this->division->id,
        'positions' => [['id' => $this->position->id, 'is_primary' => true]],
        'appointment_status_id' => $this->status->id,
        'hire_date' => '2020-01-01',
    ];

    $response = $this->actingAs($this->superAdmin)->put(route('personnel.update', $this->hrAdmin->id), $data);

    $response->assertStatus(302);
    $response->assertRedirect(route('personnel.show', $this->hrAdmin->id));
    $this->assertDatabaseHas('users', [
        'id' => $this->hrAdmin->id,
        'first_name' => 'Updated',
    ]);
});

test('super admin can edit themselves', function () {
    $data = [
        'employee_number' => 'SA-0001',
        'first_name' => 'Super',
        'last_name' => 'Admin-Updated',
        'division_id' => $this->division->id,
        'positions' => [['id' => $this->position->id, 'is_primary' => true]],
        'appointment_status_id' => $this->status->id,
        'hire_date' => '2020-01-01',
    ];

    $response = $this->actingAs($this->superAdmin)->put(route('personnel.update', $this->superAdmin->id), $data);

    $response->assertStatus(302);
    $this->assertDatabaseHas('users', [
        'id' => $this->superAdmin->id,
        'last_name' => 'Admin-Updated',
    ]);
});
