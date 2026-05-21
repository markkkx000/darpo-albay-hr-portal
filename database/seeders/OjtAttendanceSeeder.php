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
        // Find or create the OJT user 1 (Allan Paul II)
        $user1 = User::updateOrCreate(
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

        if (! $user1->hasRole('employee')) {
            $user1->assignRole('employee');
        }

        // Find or create the OJT user 2 (OJT-4220386)
        $user2 = User::updateOrCreate(
            ['employee_number' => 'OJT-4220386'],
            [
                'first_name' => 'Mark Kenneth',
                'middle_name' => 'Sulibaga',
                'last_name' => 'Nudo',
                'email' => 'kennethnudo27@gmail.com',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        if (! $user2->hasRole('employee')) {
            $user2->assignRole('employee');
        }

        // Seed records for OJT-4220719 from JSON backup
        $this->seedFromJson($user1, 'updated_ojt_backup_2026-05-20.json');

        // Seed records for OJT-4220386 from JSON backup
        $this->seedFromJson($user2, 'nudo_ojt_backup_2026-05-20.json');
    }

    /**
     * Seed attendance records for a user from a JSON file.
     */
    private function seedFromJson(User $user, string $filename): void
    {
        $jsonPath = base_path("ojt-temp-file/{$filename}");

        if (! file_exists($jsonPath)) {
            $this->command->error("JSON file not found at: {$jsonPath}");

            return;
        }

        $records = json_decode(file_get_contents($jsonPath), true);
        $count = 0;

        foreach ($records as $record) {
            if (isset($record['status']) && $record['status'] === 'absent') {
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
