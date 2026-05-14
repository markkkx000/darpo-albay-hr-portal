<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use Illuminate\Database\Seeder;

class PersonnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1 & 2. Create divisions, units and their specific positions
        $divisions = [
            [
                'name' => 'Land Tenure Improvement Division (LTID)',
                'code' => 'LTID',
                'units' => [
                    'Database Management Unit',
                    'Claim Folder Processing Section',
                    'Survey Section',
                    'EP/CLOA Generation Section',
                ],
                'positions' => [
                    'Chief Agrarian Reform Program Officer',
                    'Agrarian Reform Program Technologist',
                    'Agrarian Reform Program Officer I',
                    'Agrarian Reform Program Officer II',
                    'Senior Agrarian Reform Program Officer',
                    'Senior Agrarian Reform Program Technologist/Chief',
                    'Engineer I',
                    'Engineer II',
                    'Cartographer I',
                    'Cartographer II',
                ],
            ],
            [
                'name' => 'Program Beneficiaries Development Division (PBDD)',
                'code' => 'PBDD',
                'units' => [
                    'Social Infrastructure Building (SIB)',
                    'Enterprise Development and Economic Support (EDES)',
                    'Climate Resilient Farm Producttivity Support (CRFPS)',
                    'Supervision and Management for Delivery of Support Services (SMEDSS)',
                ],
                'positions' => [
                    'Chief Agrarian Reform Program Officer',
                    'Agrarian Reform Program Officer I',
                    'Agrarian Reform Program Officer II',
                    'Social Infrastructure Building (SIB) Head',
                    'Enterprise Development and Economic Support (EDES) Head',
                    'Senior Agrarian Reform Program Officer',
                    'Climate Resilient Farm Productivity Support (CRFPS) Head',
                    'Supervision and Management for Delivery of Support Services (SMEDSS) Head',
                ],
            ],
            [
                'name' => 'Support To Operations Division (STOD)',
                'code' => 'STOD',
                'units' => [
                    'Budget',
                    'Accounting',
                    'Cashier',
                    'Human Resource Management',
                    'Records',
                    'Supply/General Services & Property',
                ],
                'positions' => [
                    'Provincial Chief Administrative Officer',
                    'Agrarian Reform Program Officer I',
                    'Budget Staff',
                    'Agrarian Reform Program Technologist',
                    'Assistant Budget Staff',
                    'Accountant II',
                    'Accounting Staff',
                    'Administrative Officer III (Cashier II)',
                    'Cashier Staff',
                    'Collecting Officer',
                    'Assistant Statistician',
                    'Administrative Officer IV (HRMO II)',
                    'HR Staff',
                    'ICT Designate',
                    'Administrative Officer III (Records Officer)',
                    'Administrative Officer IV (Supply Officer)',
                    'Contract of Service Driver',
                    'Administrative Aide IV',
                    'Driver',
                ],
            ],
            [
                'name' => 'Legal Division (LD)',
                'code' => 'LD',
                'units' => [],
                'positions' => [
                    'Chief',
                    'Attorney V',
                    'Agrarian Reform Program Officer II',
                    'Senior Agrarian Reform Program Officer',
                    'Provincial Quick Response Officer',
                    'Agrarian Reform Program Technologist',
                    'Agrarian Reform Program Officer I',
                    'Contract of Service Support Staff',
                ],
            ],
            [
                'name' => 'Provincial Agrarian Reform Adjudicator (PARAD)',
                'code' => 'PARAD',
                'units' => [],
                'positions' => [
                    'Provincial Adjudicator',
                    'Clerk of the Adjudicator',
                    'Legal Assistant II',
                    'Agrarian Reform Program Technologist',
                    'Canvasser',
                    'Administrative Aide VI',
                    'Acting Stenographic Reporter',
                    'Sherrif III',
                ],
            ],
            [
                'name' => 'Office of the PARPO I (PARPO I)',
                'code' => 'PARPO I',
                'units' => [],
                'positions' => [
                    'Provincial Agrarian Reform Program Officer I',
                    'Agrarian Reform Program Technologist',
                    'Provincial Information Officer',
                ],
            ],
            [
                'name' => 'Office of the PARPO II (PARPO II)',
                'code' => 'PARPO II',
                'units' => [],
                'positions' => [
                    'OIC- Provincial Agrarian Reform Program Officer II',
                    'Agrarian Reform Program Technologist',
                    'Planning Officer II',
                ],
            ],
        ];

        foreach ($divisions as $divData) {
            $division = Division::updateOrCreate(
                ['name' => $divData['name']],
                ['code' => $divData['code'], 'is_active' => true]
            );

            foreach ($divData['units'] as $unitName) {
                Unit::updateOrCreate(
                    ['name' => $unitName, 'division_id' => $division->id],
                    ['is_active' => true]
                );
            }

            foreach ($divData['positions'] as $posName) {
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
                    'employment_status_id' => $allStatuses->random()->id,
                ]);
                $user->positions()->sync([$position->id => ['is_primary' => true]]);

                // Assign employee role
                $user->assignRole('employee');
            });
        }

        // Ensure at least one HR Admin exists for testing
        $hrAdmin = User::updateOrCreate(
            ['employee_number' => 'hradmin'],
            [
                'first_name' => 'HR',
                'middle_name' => 'Management',
                'last_name' => 'Admin',
                'email' => 'hr@darpo.gov.ph',
                'password' => bcrypt('password'), // or use factory default
                'is_active' => true,
            ]
        );
        $hrAdmin->assignRole('hr_admin');
    }
}
