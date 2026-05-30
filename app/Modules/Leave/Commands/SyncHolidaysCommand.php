<?php

namespace App\Modules\Leave\Commands;

use App\Modules\Leave\Models\Holiday;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncHolidaysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave:sync-holidays {--year= : The year to sync holidays for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync official Philippine holidays from Nager.Date API';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $year = $this->option('year') ?: now()->year;
        $countryCode = 'PH';

        $this->info("Fetching holidays for {$countryCode} in {$year}...");

        try {
            $response = Http::timeout(10)->get("https://date.nager.at/api/v3/PublicHolidays/{$year}/{$countryCode}");

            if ($response->failed()) {
                $this->error("Failed to fetch holidays. Status code: {$response->status()}");
                Log::error('Holiday Sync Failed', [
                    'year' => $year,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return Command::FAILURE;
            }

            $holidays = $response->json();
            $count = 0;

            foreach ($holidays as $holiday) {
                // Ensure we only grab Public holidays if we want to filter, but Nager returns all for PublicHolidays endpoint
                Holiday::updateOrCreate(
                    ['date' => $holiday['date']],
                    ['name' => $holiday['name']]
                );
                $count++;
            }

            $this->info("Successfully synced {$count} holidays for {$year}.");
            Log::info("Holiday Sync Success", ['year' => $year, 'count' => $count]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("An error occurred: {$e->getMessage()}");
            Log::error('Holiday Sync Exception', [
                'year' => $year,
                'message' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
