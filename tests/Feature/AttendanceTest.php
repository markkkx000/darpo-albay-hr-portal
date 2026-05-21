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
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertSessionHasErrors('attendance');
});

test('user can clock out for AM session after clocking in', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(4),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->am_clock_out)->not->toBeNull();
    expect($attendance->pm_clock_in)->toBeNull();
});

test('user can clock in for PM session after AM clock out', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(8),
        'am_clock_out' => Carbon::now()->subHours(4),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->pm_clock_in)->not->toBeNull();
    expect($attendance->pm_clock_out)->toBeNull();
});

test('user cannot clock in twice for PM session', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(8),
        'am_clock_out' => Carbon::now()->subHours(4),
        'pm_clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertSessionHasErrors('attendance');
});

test('user can clock out for PM session after PM clock in', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(8),
        'am_clock_out' => Carbon::now()->subHours(7),
        'pm_clock_in' => Carbon::now()->subHours(4),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->pm_clock_out)->not->toBeNull();
});

test('user cannot clock out without clocking in', function () {
    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});

test('user cannot clock out twice for PM session', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'am_clock_in' => Carbon::now()->subHours(8),
        'am_clock_out' => Carbon::now()->subHours(7),
        'pm_clock_in' => Carbon::now()->subHours(4),
        'pm_clock_out' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});
