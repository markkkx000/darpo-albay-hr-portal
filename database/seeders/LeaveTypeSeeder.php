<?php

namespace Database\Seeders;

use App\Modules\Leave\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Vacation Leave', 'color_code' => '#3b82f6'],
            ['name' => 'Mandatory/Forced Leave', 'color_code' => '#f59e0b'],
            ['name' => 'Sick Leave', 'color_code' => '#ef4444'],
            ['name' => 'Maternity Leave', 'color_code' => '#ec4899'],
            ['name' => 'Paternity Leave', 'color_code' => '#06b6d4'],
            ['name' => 'Special Privilege Leave', 'color_code' => '#8b5cf6'],
            ['name' => 'Solo Parent Leave', 'color_code' => '#6366f1'],
            ['name' => 'Study Leave', 'color_code' => '#0ea5e9'],
            ['name' => '10-Day VAWC Leave', 'color_code' => '#dc2626'],
            ['name' => 'Rehabilitation Privilege', 'color_code' => '#84cc16'],
            ['name' => 'Special Leave Benefits for Women', 'color_code' => '#d946ef'],
            ['name' => 'Special Emergency (Calamity) Leave', 'color_code' => '#ea580c'],
            ['name' => 'Adoption Leave', 'color_code' => '#14b8a6'],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(
                ['name' => $type['name']],
                ['color_code' => $type['color_code']]
            );
        }
    }
}
