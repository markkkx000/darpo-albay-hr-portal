<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OjtAttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find or create the OJT user
        $user = User::updateOrCreate(
            ['employee_number' => 'OJT-4220719'],
            [
                'first_name' => 'Allan Paul II',
                'middle_name' => 'Alejandre',
                'last_name' => 'Sodsod',
                'email' => 'allan.sodsod@darpo-albay.gov.ph',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        // Assign the employee role
        if (! $user->hasRole('employee')) {
            $user->assignRole('employee');
        }

        $jsonPath = base_path('ojt-temp-file/updated_ojt_backup_2026-05-20.json');

        if (! file_exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");

            return;
        }

        $records = json_decode(file_get_contents($jsonPath), true);
        $count = 0;

        foreach ($records as $record) {
            if ($record['status'] === 'absent') {
                continue;
            }

            $date = $record['date'];

            $amIn = ! empty($record['morIn']) ? Carbon::parse("{$date} {$record['morIn']}") : null;
            $amOut = ! empty($record['morOut']) ? Carbon::parse("{$date} {$record['morOut']}") : null;
            $pmIn = ! empty($record['aftIn']) ? Carbon::parse("{$date} {$record['aftIn']}") : null;
            $pmOut = ! empty($record['aftOut']) ? Carbon::parse("{$date} {$record['aftOut']}") : null;

            if (! $amIn && ! $amOut && ! $pmIn && ! $pmOut) {
                continue;
            }

            Attendance::updateOrCreate(
                ['user_id' => $user->id, 'date' => $date],
                [
                    'am_clock_in' => $amIn,
                    'am_clock_out' => $amOut,
                    'pm_clock_in' => $pmIn,
                    'pm_clock_out' => $pmOut,
                ]
            );
            $count++;
        }

        $this->command->info("Seeded {$count} attendance records for {$user->name}");
    }
}
