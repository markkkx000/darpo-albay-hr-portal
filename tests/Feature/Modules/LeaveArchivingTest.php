<?php

use App\Models\User;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\LeaveStatus;
use App\Modules\Leave\Models\LeaveType;
use Database\Seeders\LeaveStatusSeeder;
use Database\Seeders\LeaveTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(LeaveTypeSeeder::class);
    $this->seed(LeaveStatusSeeder::class);

    Permission::firstOrCreate(['name' => 'leave.manage']);
    Permission::firstOrCreate(['name' => 'leave.view']);
    Role::firstOrCreate(['name' => 'employee']);

    $this->admin = User::factory()->create();
    $this->admin->givePermissionTo(['leave.manage', 'leave.view']);

    $this->employee = User::factory()->create();
    $this->employee->assignRole('employee');

    $this->vlType = LeaveType::where('name', 'Vacation Leave')->first();
    $this->status = LeaveStatus::where('name', 'Approved')->first();

    // Give employee some leave credits to test deduction/restoration during archive
    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $this->vlType->id,
        'year' => now()->year,
        'earned' => 10,
        'used' => 0,
        'balance' => 10,
    ]);

    // Manually create a leave request to test archiving
    $this->leaveRequest = LeaveRequest::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $this->vlType->id,
        'leave_status_id' => $this->status->id,
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->addDay()->format('Y-m-d'),
        'days_requested' => 2,
        'days_with_pay' => 2,
        'days_without_pay' => 0,
        'date_filed' => now()->format('Y-m-d'),
    ]);
});

it('prevents regular employees from archiving leave requests', function () {
    $this->actingAs($this->employee)
        ->delete("/leave/{$this->leaveRequest->id}")
        ->assertForbidden();

    expect($this->leaveRequest->fresh()->trashed())->toBeFalse();
});

it('allows leave.manage admins to archive leave requests', function () {
    $this->actingAs($this->admin)
        ->delete("/leave/{$this->leaveRequest->id}")
        ->assertRedirect('/leave');

    expect($this->leaveRequest->fresh()->trashed())->toBeTrue();
});

it('prevents regular employees from restoring leave requests', function () {
    $this->leaveRequest->delete();

    $this->actingAs($this->employee)
        ->post("/leave/{$this->leaveRequest->id}/restore")
        ->assertForbidden();

    expect($this->leaveRequest->fresh()->trashed())->toBeTrue();
});

it('allows leave.manage admins to restore leave requests', function () {
    $this->leaveRequest->delete();

    $this->actingAs($this->admin)
        ->post("/leave/{$this->leaveRequest->id}/restore")
        ->assertRedirect('/leave');

    expect($this->leaveRequest->fresh()->trashed())->toBeFalse();
});
