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
});

it('skips credit deduction when days_with_pay is 0', function () {
    $vlType = LeaveType::where('name', 'Vacation Leave')->first();
    $approvedStatus = LeaveStatus::where('name', 'Approved')->first();

    // Set initial credits
    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $vlType->id,
        'year' => now()->year,
        'earned' => 10,
        'used' => 0,
        'balance' => 10,
    ]);

    $data = [
        'user_id' => $this->employee->id,
        'leave_type_id' => $vlType->id,
        'leave_status_id' => $approvedStatus->id,
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
        'days_requested' => 1,
        'days_with_pay' => 0,
        'days_without_pay' => 1,
        'date_filed' => now()->format('Y-m-d'),
    ];

    $this->actingAs($this->admin)
        ->post('/leave', $data)
        ->assertRedirect();

    $credit = LeaveCredit::where('user_id', $this->employee->id)
        ->where('leave_type_id', $vlType->id)
        ->first();

    expect($credit->balance)->toBe('10.000');
});

it('deducts only days_with_pay from credits', function () {
    $vlType = LeaveType::where('name', 'Vacation Leave')->first();
    $approvedStatus = LeaveStatus::where('name', 'Approved')->first();

    LeaveCredit::create([
        'user_id' => $this->employee->id,
        'leave_type_id' => $vlType->id,
        'year' => now()->year,
        'earned' => 10,
        'used' => 0,
        'balance' => 10,
    ]);

    $data = [
        'user_id' => $this->employee->id,
        'leave_type_id' => $vlType->id,
        'leave_status_id' => $approvedStatus->id,
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->addDay()->format('Y-m-d'),
        'days_requested' => 2,
        'days_with_pay' => 1,
        'days_without_pay' => 1,
        'date_filed' => now()->format('Y-m-d'),
    ];

    $this->actingAs($this->admin)
        ->post('/leave', $data);

    $credit = LeaveCredit::where('user_id', $this->employee->id)
        ->where('leave_type_id', $vlType->id)
        ->first();

    expect($credit->balance)->toBe('9.000');
});



it('validates sick leave attachments for more than 5 days', function () {
    $slType = LeaveType::where('name', 'Sick Leave')->first();
    $status = LeaveStatus::where('name', 'For Signature')->first();

    $data = [
        'user_id' => $this->employee->id,
        'leave_type_id' => $slType->id,
        'leave_status_id' => $status->id,
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->addDays(10)->format('Y-m-d'),
        'days_requested' => 10,
        'days_with_pay' => 10,
        'days_without_pay' => 0,
        'has_attachments' => true,
        'supporting_documents' => ['Birth Certificate'], // Wrong document
    ];

    $this->actingAs($this->admin)
        ->post('/leave', $data)
        ->assertSessionHasErrors(['supporting_documents']);
});

it('validates that sum of pay days does not exceed requested days', function () {
    $vlType = LeaveType::where('name', 'Vacation Leave')->first();
    $status = LeaveStatus::where('name', 'For Signature')->first();

    $data = [
        'user_id' => $this->employee->id,
        'leave_type_id' => $vlType->id,
        'leave_status_id' => $status->id,
        'start_date' => now()->format('Y-m-d'),
        'end_date' => now()->format('Y-m-d'),
        'days_requested' => 1,
        'days_with_pay' => 1,
        'days_without_pay' => 1, // Sum is 2, requested is 1
    ];

    $this->actingAs($this->admin)
        ->post('/leave', $data)
        ->assertSessionHasErrors(['days_with_pay']);
});
