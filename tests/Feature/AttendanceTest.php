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

    $response->assertStatus(200);
});

test('user can clock in', function () {
    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertRedirect();
    $this->assertDatabaseHas('attendances', [
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
    ]);
});

test('user cannot clock in twice', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'clock_in' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-in'));

    $response->assertSessionHasErrors('attendance');
});

test('user can clock out after clocking in', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'clock_in' => Carbon::now()->subHours(8),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertRedirect();
    $attendance = Attendance::where('user_id', $this->user->id)->first();
    expect($attendance->clock_out)->not->toBeNull();
});

test('user cannot clock out without clocking in', function () {
    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});

test('user cannot clock out twice', function () {
    Attendance::create([
        'user_id' => $this->user->id,
        'date' => Carbon::today()->toDateString(),
        'clock_in' => Carbon::now()->subHours(8),
        'clock_out' => Carbon::now(),
    ]);

    $response = $this->actingAs($this->user)->post(route('attendance.clock-out'));

    $response->assertSessionHasErrors('attendance');
});
