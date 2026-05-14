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
            ['name' => 'Vacation Leave', 'abbreviation' => 'VL', 'is_cumulative' => true, 'color_code' => '#3b82f6'],
            ['name' => 'Sick Leave', 'abbreviation' => 'SL', 'is_cumulative' => true, 'color_code' => '#ef4444'],
            ['name' => 'Forced/Mandatory Leave', 'abbreviation' => 'FL', 'is_cumulative' => true, 'color_code' => '#f59e0b'],
            ['name' => 'Wellness Leave', 'abbreviation' => 'WL', 'is_cumulative' => null, 'color_code' => '#10b981'],
            ['name' => 'Compensatory Time Off', 'abbreviation' => 'CTO', 'is_cumulative' => null, 'color_code' => '#6366f1'],
            ['name' => 'Disapproved VL', 'abbreviation' => 'DVL', 'is_cumulative' => false, 'color_code' => '#94a3b8'],
            ['name' => 'Disapproved FL', 'abbreviation' => 'DFL', 'is_cumulative' => false, 'color_code' => '#64748b'],
            ['name' => 'Maternity Leave', 'abbreviation' => 'ML', 'is_cumulative' => null, 'color_code' => '#ec4899'],
            ['name' => 'Paternity Leave', 'abbreviation' => 'PL', 'is_cumulative' => null, 'color_code' => '#06b6d4'],
            ['name' => 'Special Privilege Leave', 'abbreviation' => 'SPL', 'is_cumulative' => null, 'color_code' => '#8b5cf6'],
            ['name' => 'Solo Parent Leave', 'abbreviation' => 'SOLO', 'is_cumulative' => null, 'color_code' => '#6366f1'],
            ['name' => 'Study Leave', 'abbreviation' => 'STUDY', 'is_cumulative' => null, 'color_code' => '#0ea5e9'],
            ['name' => '10-Day VAWC Leave', 'abbreviation' => 'VAWC', 'is_cumulative' => null, 'color_code' => '#dc2626'],
            ['name' => 'Rehabilitation Privilege', 'abbreviation' => 'REHAB', 'is_cumulative' => null, 'color_code' => '#84cc16'],
            ['name' => 'Special Leave Benefits for Women', 'abbreviation' => 'SLBW', 'is_cumulative' => null, 'color_code' => '#d946ef'],
            ['name' => 'Special Emergency (Calamity) Leave', 'abbreviation' => 'SEL', 'is_cumulative' => null, 'color_code' => '#ea580c'],
            ['name' => 'Adoption Leave', 'abbreviation' => 'ADOPT', 'is_cumulative' => null, 'color_code' => '#14b8a6'],
        ];

        foreach ($types as $type) {
            LeaveType::updateOrCreate(
                ['name' => $type['name']],
                [
                    'color_code' => $type['color_code'],
                    'is_cumulative' => $type['is_cumulative'] ?? null,
                    'abbreviation' => $type['abbreviation'] ?? null,
                ]
            );
        }
    }
}
