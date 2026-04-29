<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\Department;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use Illuminate\Database\Seeder;

class PersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1 & 2. Create departments and their specific positions
        $departmentsAndPositions = [
            'Office of the PARPO' => [
                'Provincial Agrarian Reform Program Officer II (PARPO II)',
                'PARPO I',
                'Provincial Agrarian Reform Adjudicator (PARAD)',
                'Provincial Chief Administrative Officer (PCAO)',
            ],
            'Land Tenure Improvement Division (LTID)' => [
                'Chief Agrarian Reform Program Officer (CARPO)',
                'ARPO II',
                'ARPO I',
                'Agrarian Reform Program Technologist (ARPT)',
                'Survey personnel',
            ],
            'Program Beneficiaries Development Division (PBDD)' => [
                'Chief ARPO (CARPO)',
                'ARPO II',
                'ARPO I',
                'ARPT',
            ],
            'Legal Division (LD)' => [
                'Chief (Attorney)',
                'Legal Officers',
                'ARPO',
            ],
            'Support To Operations Division (STOD)' => [
                'PCAO / Administrative Officer',
                'Admin staff',
                'Records Officer',
                'Cashier',
                'Driver',
            ],
        ];

        foreach ($departmentsAndPositions as $deptName => $positions) {
            $department = Department::updateOrCreate(['name' => $deptName], ['is_active' => true]);

            foreach ($positions as $posName) {
                Position::updateOrCreate(
                    ['name' => $posName, 'department_id' => $department->id],
                    ['is_active' => true]
                );
            }
        }

        // 3. Create employment statuses
        $statuses = ['Permanent', 'Co-terminous', 'Contractual', 'Casual'];
        foreach ($statuses as $name) {
            EmploymentStatus::updateOrCreate(['name' => $name], ['is_active' => true]);
        }

        $allStatuses = EmploymentStatus::all();
        $allPositions = Position::all();

        // 4. Create 20 random employees
        User::factory()->count(20)->create()->each(function ($user) use ($allPositions, $allStatuses) {
            $position = $allPositions->random();
            $user->update([
                'department_id' => $position->department_id,
                'position_id' => $position->id,
                'employment_status_id' => $allStatuses->random()->id,
            ]);

            // Assign employee role
            $user->assignRole('employee');
        });

        // Ensure at least one HR Admin exists for testing if not already seeded
        if (! User::role('hr_admin')->exists()) {
            $hrAdmin = User::factory()->create([
                'first_name' => 'HR',
                'last_name' => 'Admin',
                'email' => 'hr@darpo.gov.ph',
                'employee_number' => 'HR-001',
            ]);
            $hrAdmin->assignRole('hr_admin');
        }
    }
}
