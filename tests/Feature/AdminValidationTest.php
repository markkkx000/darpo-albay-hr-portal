<?php

use App\Models\User;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    // Admin with NULL organization fields (like in current seeders)
    $this->hrAdmin = User::factory()->create([
        'division_id' => null,
        'employment_status_id' => null,
    ]);
    $this->hrAdmin->assignRole('hr_admin');

    $this->division = Division::factory()->create();
    $this->position = Position::factory()->create(['division_id' => $this->division->id]);
    $this->status = EmploymentStatus::factory()->create();
});

test('editing admin with null fields succeeds when fields are left empty', function () {
    $data = [
        'employee_number' => 'HR-TEST',
        'first_name' => 'Updated',
        'last_name' => 'Name',
        'division_id' => null,
        'positions' => [],
        'employment_status_id' => null,
        'hire_date' => null,
    ];

    $response = $this->actingAs($this->superAdmin)->put(route('personnel.update', $this->hrAdmin->id), $data);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('personnel.show', $this->hrAdmin->id));

    $this->hrAdmin->refresh();
    expect($this->hrAdmin->first_name)->toBe('Updated');
});
