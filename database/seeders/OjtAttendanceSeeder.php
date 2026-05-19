<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OjtAttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('employee_number', 'OJT-4220386')->first();

        if (! $user) {
            $this->command->error('User not found!');

            return;
        }

        $records = [
            ['date' => '2026-03-05', 'in' => '08:04 AM', 'out' => '05:04 PM'],
            ['date' => '2026-03-06', 'in' => '07:56 AM', 'out' => '05:06 PM'],
            ['date' => '2026-03-09', 'in' => '08:00 AM', 'out' => '05:10 PM'],
            ['date' => '2026-03-10', 'in' => '08:05 AM', 'out' => '05:11 PM'],
            ['date' => '2026-03-12', 'in' => '07:14 AM', 'out' => '06:14 PM'],
            ['date' => '2026-03-16', 'in' => '07:02 AM', 'out' => '05:00 PM'],
            ['date' => '2026-03-18', 'in' => '08:10 AM', 'out' => '05:03 PM'],
            ['date' => '2026-03-19', 'in' => '08:37 AM', 'out' => '05:22 PM'],
            ['date' => '2026-03-24', 'in' => '07:16 AM', 'out' => '06:08 PM'],
            ['date' => '2026-03-25', 'in' => '01:00 PM', 'out' => '06:07 PM'],
            ['date' => '2026-03-30', 'in' => '07:00 AM', 'out' => '12:00 PM'],
            ['date' => '2026-03-31', 'in' => '01:00 PM', 'out' => '06:00 PM'],
            ['date' => '2026-04-06', 'in' => '06:57 AM', 'out' => '12:00 PM'],
            ['date' => '2026-04-14', 'in' => '07:25 AM', 'out' => '06:00 PM'],
            ['date' => '2026-04-15', 'in' => '07:25 AM', 'out' => '06:02 PM'],
            ['date' => '2026-04-16', 'in' => '07:54 AM', 'out' => '06:00 PM'],
            ['date' => '2026-04-20', 'in' => '07:50 AM', 'out' => '06:01 PM'],
            ['date' => '2026-04-21', 'in' => '08:10 AM', 'out' => '06:08 PM'],
            ['date' => '2026-04-27', 'in' => '08:00 AM', 'out' => '06:11 PM'],
            ['date' => '2026-04-29', 'in' => '08:30 AM', 'out' => '06:20 PM'],
            ['date' => '2026-04-30', 'in' => '08:30 AM', 'out' => '06:08 PM'],
            ['date' => '2026-05-04', 'in' => '10:25 AM', 'out' => '06:20 PM'],
            ['date' => '2026-05-06', 'in' => '07:25 AM', 'out' => '06:18 PM'],
            ['date' => '2026-05-07', 'in' => '07:06 AM', 'out' => '06:11 PM'],
            ['date' => '2026-05-12', 'in' => '08:00 AM', 'out' => '06:10 PM'],
            ['date' => '2026-05-13', 'in' => '07:14 AM', 'out' => '06:17 PM'],
            ['date' => '2026-05-14', 'in' => '08:30 AM', 'out' => '06:20 PM'],
            ['date' => '2026-05-19', 'in' => '07:50 AM', 'out' => '06:15 PM'],
        ];

        foreach ($records as $record) {
            $clockIn = Carbon::createFromFormat('Y-m-d h:i A', $record['date'].' '.$record['in']);
            $clockOut = Carbon::createFromFormat('Y-m-d h:i A', $record['date'].' '.$record['out']);

            Attendance::updateOrCreate(
                ['user_id' => $user->id, 'date' => $record['date']],
                [
                    'clock_in' => $clockIn,
                    'clock_out' => $clockOut,
                ]
            );
        }

        $this->command->info('Seeded '.count($records).' attendance records for '.$user->name);
    }
}
