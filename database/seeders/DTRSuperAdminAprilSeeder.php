<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DTRSuperAdminAprilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::where('employee_number', 'superadmin')
            ->orWhere('email', 'admin@darpo-albay.gov.ph')
            ->first();

        if (! $superAdmin) {
            $this->command->error('Super Admin user not found. Seeding aborted.');

            return;
        }

        $year = 2026;
        $month = 4; // April

        // Holidays to skip in April
        $holidays = [
            '2026-04-02', // Maundy Thursday
            '2026-04-03', // Good Friday
            '2026-04-04', // Black Saturday
            '2026-04-09', // Araw ng Kagitingan
        ];

        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;

        // Clear existing attendance for this user in April 2026 to ensure clean seeding
        Attendance::where('user_id', $superAdmin->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->forceDelete();

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $date = Carbon::createFromDate($year, $month, $day);
            $dateString = $date->toDateString();

            // Skip holidays
            if (in_array($dateString, $holidays)) {
                continue;
            }

            // Skip Friday, Saturday, Sunday (Compressed schedule is Mon-Thu)
            if (in_array($date->dayOfWeek, [Carbon::FRIDAY, Carbon::SATURDAY, Carbon::SUNDAY])) {
                continue;
            }

            // Compressed schedule: 7:00 AM to 6:00 PM
            // Randomize arrival between 6:45 AM and 6:58 AM
            $clockIn = $date->copy()->setTime(6, rand(45, 58), rand(0, 59));

            // Randomize departure between 6:00 PM and 6:15 PM (18:00 - 18:15)
            $clockOut = $date->copy()->setTime(18, rand(0, 15), rand(0, 59));

            Attendance::create([
                'user_id' => $superAdmin->id,
                'date' => $dateString,
                'clock_in' => $clockIn,
                'clock_out' => $clockOut,
            ]);
        }

        $this->command->info("Successfully seeded April {$year} compressed DTR records for Super Admin.");
    }
}
