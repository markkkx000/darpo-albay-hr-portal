<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole('super_admin');

    $this->hrAdmin = User::factory()->create();
    $this->hrAdmin->assignRole('hr_admin');

    $this->hrStaff = User::factory()->create();
    $this->hrStaff->assignRole('hr_staff');

    $this->employee = User::factory()->create();
    $this->employee->assignRole('employee');
});

test('unauthorized users cannot access management index', function () {
    $this->actingAs($this->employee)->get(route('attendance.manage.records.index'))->assertStatus(403);
});

test('authorized users can access management index', function () {
    $this->actingAs($this->hrStaff)->get(route('attendance.manage.records.index'))->assertStatus(200);
    $this->actingAs($this->hrAdmin)->get(route('attendance.manage.records.index'))->assertStatus(200);
});

test('hr_staff cannot manually store attendance record', function () {
    $data = [
        'user_id' => $this->employee->id,
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(8, 0, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrStaff)->post(route('attendance.manage.records.store'), $data);
    $response->assertForbidden();
});

test('authorized user can manually store attendance record', function () {
    $data = [
        'user_id' => $this->employee->id,
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(8, 0, 0)->format('Y-m-d H:i:s'),
        'am_clock_out' => Carbon::yesterday()->setTime(12, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_in' => Carbon::yesterday()->setTime(13, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_out' => Carbon::yesterday()->setTime(17, 0, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrAdmin)->post(route('attendance.manage.records.store'), $data);

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'user_id' => $this->employee->id,
        'date' => $data['date'],
    ]);
});

test('validation prevents duplicate records for same employee and date', function () {
    Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(8, 0, 0),
    ]);

    $data = [
        'user_id' => $this->employee->id,
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(9, 0, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrAdmin)->post(route('attendance.manage.records.store'), $data);

    $response->assertSessionHasErrors('user_id');
});

test('authorized user can update attendance record', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(4),
    ]);

    $data = [
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::today()->setTime(8, 30, 0)->format('Y-m-d H:i:s'),
        'am_clock_out' => Carbon::today()->setTime(12, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_in' => Carbon::today()->setTime(13, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_out' => Carbon::today()->setTime(17, 30, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrAdmin)->put(route('attendance.manage.records.update', $attendance), $data);

    $response->assertRedirect();
    $attendance->refresh();
    expect($attendance->am_clock_in->format('H:i:s'))->toBe('08:30:00');
    expect($attendance->pm_clock_out->format('H:i:s'))->toBe('17:30:00');
});

test('authorized user can update attendance record date', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::today()->setTime(8, 0, 0),
    ]);

    $newDate = Carbon::yesterday()->toDateString();
    $data = [
        'date' => $newDate,
        'am_clock_in' => Carbon::yesterday()->setTime(8, 30, 0)->format('Y-m-d H:i:s'),
        'am_clock_out' => Carbon::yesterday()->setTime(12, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_in' => Carbon::yesterday()->setTime(13, 0, 0)->format('Y-m-d H:i:s'),
        'pm_clock_out' => Carbon::yesterday()->setTime(17, 30, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrAdmin)->put(route('attendance.manage.records.update', $attendance), $data);

    $response->assertRedirect();
    $attendance->refresh();
    expect($attendance->date->format('Y-m-d'))->toBe($newDate);
});

test('updating attendance record date prevents duplicate records', function () {
    // Existing record on yesterday
    Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(8, 0, 0),
    ]);

    // Record on today we want to update to yesterday
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::today()->setTime(8, 0, 0),
    ]);

    $data = [
        'date' => Carbon::yesterday()->toDateString(),
        'am_clock_in' => Carbon::yesterday()->setTime(8, 30, 0)->format('Y-m-d H:i:s'),
    ];

    $response = $this->actingAs($this->hrAdmin)->put(route('attendance.manage.records.update', $attendance), $data);

    $response->assertSessionHasErrors('date');
});

test('hr_staff cannot delete attendance record', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->hrStaff)->delete(route('attendance.manage.records.destroy', $attendance));

    $response->assertForbidden();
});

test('hr_admin and super_admin can soft delete attendance record', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->hrAdmin)->delete(route('attendance.manage.records.destroy', $attendance));

    $response->assertRedirect();
    $this->assertSoftDeleted('attendances', ['id' => $attendance->id]);
});

test('authorized user can view archived records', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $attendance->delete();

    $response = $this->actingAs($this->hrStaff)
        ->get(route('attendance.manage.records.index', ['status' => 'archived']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('records.data', 1)
        ->where('records.data.0.id', $attendance->id)
    );
});

test('authorized user can restore archived record', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $attendance->delete();

    $response = $this->actingAs($this->hrAdmin)
        ->post(route('attendance.manage.records.restore', ['id' => $attendance->id]));

    $response->assertRedirect();
    $this->assertNotSoftDeleted('attendances', ['id' => $attendance->id]);
});

test('unauthorized user cannot restore archived record', function () {
    $attendance = Attendance::create([
        'user_id' => $this->employee->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $attendance->delete();

    // employee doesn't have attendance.logs.manage
    $response = $this->actingAs($this->employee)
        ->post(route('attendance.manage.records.restore', ['id' => $attendance->id]));

    $response->assertForbidden();
});

test('permissions are correctly shared to the frontend', function () {
    // Check as HR Staff (should see it)
    $this->actingAs($this->hrStaff)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.permissions', function ($perms) {
                return is_array($perms) ? in_array('attendance.logs.view', $perms) : collect($perms)->contains('attendance.logs.view');
            })
        );

    // Check as Employee (should NOT see it)
    $this->actingAs($this->employee)->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.permissions', function ($perms) {
                return is_array($perms) ? ! in_array('attendance.logs.view', $perms) : ! collect($perms)->contains('attendance.logs.view');
            })
        );
});
