<?php

use App\Modules\Leave\Models\Holiday;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

it('fetches holidays and stores them in the database', function () {
    Http::fake([
        'date.nager.at/api/v3/PublicHolidays/*' => Http::response([
            [
                'date' => '2026-01-01',
                'name' => "New Year's Day",
            ],
            [
                'date' => '2026-12-25',
                'name' => 'Christmas Day',
            ],
        ], 200),
    ]);

    $this->artisan('leave:sync-holidays', ['--year' => '2026'])
        ->expectsOutput('Fetching holidays for PH in 2026...')
        ->expectsOutput('Successfully synced 2 holidays for 2026.')
        ->assertSuccessful();

    $this->assertDatabaseHas('holidays', [
        'date' => '2026-01-01',
        'name' => "New Year's Day",
    ]);

    $this->assertDatabaseHas('holidays', [
        'date' => '2026-12-25',
        'name' => 'Christmas Day',
    ]);
});

it('avoids duplicating holidays if run multiple times', function () {
    Http::fake([
        'date.nager.at/api/v3/PublicHolidays/*' => Http::response([
            [
                'date' => '2026-01-01',
                'name' => "New Year's Day",
            ],
        ], 200),
    ]);

    $this->artisan('leave:sync-holidays', ['--year' => '2026'])->assertSuccessful();
    $this->artisan('leave:sync-holidays', ['--year' => '2026'])->assertSuccessful();

    expect(Holiday::where('date', '2026-01-01')->count())->toBe(1);
});

it('logs an error and fails if the api request fails', function () {
    Http::fake([
        'date.nager.at/api/v3/PublicHolidays/*' => Http::response([], 500),
    ]);

    Log::shouldReceive('error')->once()->withArgs(function ($message) {
        return $message === 'Holiday Sync Failed';
    });

    $this->artisan('leave:sync-holidays', ['--year' => '2026'])
        ->expectsOutput('Failed to fetch holidays. Status code: 500')
        ->assertFailed();

    expect(Holiday::count())->toBe(0);
});
