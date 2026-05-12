<?php

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->givePermissionTo('attendance.logs.view');
    $this->actingAs($this->admin);

    // Create a few users
    $this->employee1 = User::factory()->create(['first_name' => 'John', 'last_name' => 'Doe']);
    $this->employee2 = User::factory()->create(['first_name' => 'Jane', 'last_name' => 'Smith']);

    // Today's record (Working)
    Attendance::factory()->create([
        'user_id' => $this->employee1->id,
        'date' => Carbon::today()->toDateString(),
        'clock_in' => Carbon::now()->subHours(2),
        'clock_out' => null,
    ]);

    // Past record (Incomplete)
    Attendance::factory()->create([
        'user_id' => $this->employee2->id,
        'date' => Carbon::yesterday()->toDateString(),
        'clock_in' => Carbon::yesterday()->setHour(8),
        'clock_out' => null,
    ]);

    // Completed record
    Attendance::factory()->create([
        'user_id' => $this->employee1->id,
        'date' => Carbon::yesterday()->subDay()->toDateString(),
        'clock_in' => Carbon::yesterday()->subDay()->setHour(8),
        'clock_out' => Carbon::yesterday()->subDay()->setHour(17),
    ]);
});

it('can filter attendance by search name', function () {
    $response = $this->get(route('attendance.manage.records.index', ['search' => 'John']));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records']['data'];

    expect($records)->toHaveCount(2); // John has 2 records (Working today, Completed 2 days ago)
    foreach ($records as $record) {
        expect($record['user']['first_name'])->toBe('John');
    }
});

it('can filter attendance by working status', function () {
    $response = $this->get(route('attendance.manage.records.index', ['status' => 'working']));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records']['data'];

    expect($records)->toHaveCount(1);
    expect($records[0]['clock_out'])->toBeNull();
    expect($records[0]['date'])->toBe(Carbon::today()->toDateString());
});

it('can filter attendance by incomplete status', function () {
    $response = $this->get(route('attendance.manage.records.index', ['status' => 'incomplete']));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records']['data'];

    expect($records)->toHaveCount(1);
    expect($records[0]['clock_out'])->toBeNull();
    expect($records[0]['date'])->toBe(Carbon::yesterday()->toDateString());
});

it('can filter attendance by completed status', function () {
    $response = $this->get(route('attendance.manage.records.index', ['status' => 'completed']));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records']['data'];

    expect($records)->toHaveCount(1);
    expect($records[0]['clock_out'])->not->toBeNull();
});

it('can filter attendance by date range', function () {
    $fromDate = Carbon::yesterday()->toDateString();
    $toDate = Carbon::today()->toDateString();

    $response = $this->get(route('attendance.manage.records.index', [
        'from_date' => $fromDate,
        'to_date' => $toDate,
    ]));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records']['data'];

    expect($records)->toHaveCount(2); // Today and Yesterday
});

it('returns full pagination metadata', function () {
    $response = $this->get(route('attendance.manage.records.index'));

    $response->assertStatus(200);
    $records = $response->viewData('page')['props']['records'];

    expect($records)->toHaveKeys(['data', 'links', 'current_page', 'last_page', 'total']);
});
