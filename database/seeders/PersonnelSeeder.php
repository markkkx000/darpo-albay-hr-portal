<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\Division;
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
        // 1 & 2. Create divisions and their specific positions
        $divisionsAndPositions = [
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

        foreach ($divisionsAndPositions as $divName => $positions) {
            $division = Division::updateOrCreate(['name' => $divName], ['is_active' => true]);

            foreach ($positions as $posName) {
                Position::updateOrCreate(
                    ['name' => $posName, 'division_id' => $division->id],
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

        // 4. Create random employees ONLY if we don't have many yet
        if (User::count() < 10) {
            User::factory()->count(20)->create()->each(function (User $user) use ($allPositions, $allStatuses) {
                $position = $allPositions->random();
                $user->update([
                    'division_id' => $position->division_id,
                    'position_id' => $position->id,
                    'employment_status_id' => $allStatuses->random()->id,
                ]);

                // Assign employee role
                $user->assignRole('employee');
            });
        }

        // Ensure at least one HR Admin exists for testing
        $hrAdmin = User::updateOrCreate(
            ['email' => 'hr@darpo.gov.ph'],
            [
                'first_name' => 'HR',
                'last_name' => 'Admin',
                'employee_number' => 'HR-001',
                'password' => bcrypt('password'), // or use factory default
                'is_active' => true,
            ]
        );
        $hrAdmin->assignRole('hr_admin');
    }
}
