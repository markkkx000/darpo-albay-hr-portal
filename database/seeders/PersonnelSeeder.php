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
        // 1. Create standard departments
        $departments = [
            ['name' => 'Provincial Agrarian Reform Adjudication Division (PARAD)'],
            ['name' => 'Support To Operations Division (STOD)'],
            ['name' => 'Land Tenure Improvement Division (LTID)'],
            ['name' => 'Program Beneficiaries Development Division (PBDD)'],
            ['name' => 'Legal Division'],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(['name' => $dept['name']], ['is_active' => true]);
        }

        $allDepartments = Department::all();

        // 2. Create common positions for each department
        $positions = [
            'Regional Director',
            'Assistant Regional Director',
            'Division Chief',
            'Senior Agrarian Reform Program Officer',
            'Agrarian Reform Program Officer II',
            'Agrarian Reform Program Officer I',
            'Administrative Officer V',
            'Administrative Assistant III',
            'Legal Officer IV',
            'Planning Officer II',
        ];

        foreach ($allDepartments as $dept) {
            foreach (array_rand(array_flip($positions), 3) as $posName) {
                Position::updateOrCreate(
                    ['name' => $posName, 'department_id' => $dept->id],
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
