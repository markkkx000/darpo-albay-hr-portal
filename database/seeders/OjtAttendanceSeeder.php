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
        if (!$user->hasRole('employee')) {
            $user->assignRole('employee');
        }

        $jsonPath = base_path('ojt-temp-file/ojt_backup_2026-05-20.json');

        if (!file_exists($jsonPath)) {
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

            // "only take the first clock-in and the last clock-out, so for full day of attendance, take the morning clock-in and the afternoon clock-out. for half-days, well no need to do anything just take the clock-in and clock-out."
            $clockInTime = null;
            if (!empty($record['morIn'])) {
                $clockInTime = $record['morIn'];
            } elseif (!empty($record['aftIn'])) {
                $clockInTime = $record['aftIn'];
            }

            $clockOutTime = null;
            if (!empty($record['aftOut'])) {
                $clockOutTime = $record['aftOut'];
            } elseif (!empty($record['morOut'])) {
                $clockOutTime = $record['morOut'];
            }

            if (!$clockInTime || !$clockOutTime) {
                continue;
            }

            $clockIn = Carbon::parse("{$date} {$clockInTime}");
            $clockOut = Carbon::parse("{$date} {$clockOutTime}");

            Attendance::updateOrCreate(
                ['user_id' => $user->id, 'date' => $date],
                [
                    'clock_in' => $clockIn,
                    'clock_out' => $clockOut,
                ]
            );
            $count++;
        }

        $this->command->info("Seeded {$count} attendance records for {$user->name}");
    }
}
