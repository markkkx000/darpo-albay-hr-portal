<?php

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('employee');
});

test('user can see attendance page', function () {
    $response = $this->actingAs($this->user)->get(route('attendance.index'));

    $response->assertOk();
});

test('user can clock in for AM session', function () {
    $this->travelTo(Carbon::today()->setHour(9)); // 9:00 AM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
    ]);

    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->am_clock_in)->not->toBeNull();
    expect($attendance->am_clock_out)->toBeNull();
    expect($attendance->pm_clock_in)->toBeNull();
    expect($attendance->pm_clock_out)->toBeNull();
});

test('user cannot clock in twice for AM session', function () {
    $this->travelTo(Carbon::today()->setHour(9)); // 9:00 AM

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertSessionHasErrors('attendance');
});

test('user can clock out for AM session after clocking in', function () {
    $this->travelTo(Carbon::today()->setHour(8)); // 8:00 AM

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $this->travelTo(Carbon::today()->setHour(10)); // 10:00 AM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->am_clock_out)->not->toBeNull();
    expect($attendance->pm_clock_in)->toBeNull();
});

test('user can clock in for PM session after AM clock out', function () {
    $this->travelTo(Carbon::today()->setHour(8)); // 8:00 AM
    $amIn = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(12)); // 12:00 PM
    $amOut = Carbon::now();

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => $amIn,
        'am_clock_out' => $amOut,
    ]);

    $this->travelTo(Carbon::today()->setHour(14)); // 2:00 PM (PM session)

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->pm_clock_in)->not->toBeNull();
    expect($attendance->pm_clock_out)->toBeNull();
});

test('user cannot clock in twice for PM session', function () {
    $this->travelTo(Carbon::today()->setHour(8)); // 8:00 AM
    $amIn = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(12)); // 12:00 PM
    $amOut = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(13)); // 1:00 PM
    $pmIn = Carbon::now();

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => $amIn,
        'am_clock_out' => $amOut,
        'pm_clock_in' => $pmIn,
    ]);

    $this->travelTo(Carbon::today()->setHour(14)); // 2:00 PM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertSessionHasErrors('attendance');
});

test('user can clock out for PM session after PM clock in', function () {
    $this->travelTo(Carbon::today()->setHour(8)); // 8:00 AM
    $amIn = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(12)); // 12:00 PM
    $amOut = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(13)); // 1:00 PM
    $pmIn = Carbon::now();

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => $amIn,
        'am_clock_out' => $amOut,
        'pm_clock_in' => $pmIn,
    ]);

    $this->travelTo(Carbon::today()->setHour(17)); // 5:00 PM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->pm_clock_out)->not->toBeNull();
});

test('user cannot clock out without clocking in', function () {
    $this->travelTo(Carbon::today()->setHour(9)); // 9:00 AM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});

test('user cannot clock out twice for PM session', function () {
    $this->travelTo(Carbon::today()->setHour(8)); // 8:00 AM
    $amIn = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(12)); // 12:00 PM
    $amOut = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(13)); // 1:00 PM
    $pmIn = Carbon::now();

    $this->travelTo(Carbon::today()->setHour(17)); // 5:00 PM
    $pmOut = Carbon::now();

    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => $amIn,
        'am_clock_out' => $amOut,
        'pm_clock_in' => $pmIn,
        'pm_clock_out' => $pmOut,
    ]);

    $this->travelTo(Carbon::today()->setHour(18)); // 6:00 PM

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});
