<?php

namespace Database\Seeders;

use App\Modules\Leave\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Rename old name if exists
        LeaveType::where('name', 'Mandatory/Forced Leave')->update(['name' => 'Forced/Mandatory Leave']);

        $types = [
            ['name' => 'Vacation Leave', 'is_cumulative' => true, 'color_code' => '#3b82f6'],
            ['name' => 'Sick Leave', 'is_cumulative' => true, 'color_code' => '#ef4444'],
            ['name' => 'Forced/Mandatory Leave', 'is_cumulative' => true, 'color_code' => '#f59e0b'],
            ['name' => 'Wellness Leave', 'is_cumulative' => null, 'color_code' => '#10b981'],
            ['name' => 'Compensatory Time Off', 'is_cumulative' => null, 'color_code' => '#6366f1'],
            ['name' => 'Disapproved VL', 'is_cumulative' => false, 'color_code' => '#94a3b8'],
            ['name' => 'Disapproved FL', 'is_cumulative' => false, 'color_code' => '#64748b'],
            ['name' => 'Maternity Leave', 'is_cumulative' => null, 'color_code' => '#ec4899'],
            ['name' => 'Paternity Leave', 'is_cumulative' => null, 'color_code' => '#06b6d4'],
            ['name' => 'Special Privilege Leave', 'is_cumulative' => null, 'color_code' => '#8b5cf6'],
            ['name' => 'Solo Parent Leave', 'is_cumulative' => null, 'color_code' => '#6366f1'],
            ['name' => 'Study Leave', 'is_cumulative' => null, 'color_code' => '#0ea5e9'],
            ['name' => '10-Day VAWC Leave', 'is_cumulative' => null, 'color_code' => '#dc2626'],
            ['name' => 'Rehabilitation Privilege', 'is_cumulative' => null, 'color_code' => '#84cc16'],
            ['name' => 'Special Leave Benefits for Women', 'is_cumulative' => null, 'color_code' => '#d946ef'],
            ['name' => 'Special Emergency (Calamity) Leave', 'is_cumulative' => null, 'color_code' => '#ea580c'],
            ['name' => 'Adoption Leave', 'is_cumulative' => null, 'color_code' => '#14b8a6'],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(
                ['name' => $type['name']],
                [
                    'color_code' => $type['color_code'],
                    'is_cumulative' => $type['is_cumulative'] ?? null,
                ]
            );
        }
    }
}
