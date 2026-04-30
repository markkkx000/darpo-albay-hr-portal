<?php

namespace Database\Seeders;

use App\Modules\Leave\Models\LeaveStatus;
use Illuminate\Database\Seeder;

class LeaveStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            'Approved',
            'For Signature',
            'No Filed Leave',
            'Cancelled',
        ];

        foreach ($statuses as $status) {
            LeaveStatus::firstOrCreate(['name' => $status]);
        }
    }
}
