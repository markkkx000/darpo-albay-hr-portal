<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\Department;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);
        $this->call(PersonnelSeeder::class);
        $this->call(LeaveTypeSeeder::class);
        $this->call(LeaveStatusSeeder::class);
        $this->call(HolidaySeeder::class);

        $stod = Department::where('name', 'Support To Operations Division (STOD)')->first();
        $permanent = EmploymentStatus::where('name', 'Permanent')->first();
        $adminPosition = Position::where('name', 'PCAO / Administrative Officer')->where('department_id', $stod->id)->first();
        $staffPosition = Position::where('name', 'Admin staff')->where('department_id', $stod->id)->first();

        // Create a Super Admin (no employee number, uses email login)
        $superAdmin = User::updateOrCreate(
            ['email' => 'admin@darpo-albay.gov.ph'],
            [
                'employee_number' => null,
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create an HR Admin
        $hrAdmin = User::updateOrCreate(
            ['email' => 'maria.santos@darpo-albay.gov.ph'],
            [
                'employee_number' => 'HR-0001',
                'first_name' => 'Maria',
                'last_name' => 'Santos',
                'password' => bcrypt('password'),
                'department_id' => $stod->id,
                'position_id' => $adminPosition?->id,
                'employment_status_id' => $permanent?->id,
                'hire_date' => '2015-06-16',
                'is_active' => true,
            ]
        );
        $hrAdmin->assignRole('hr_admin');

        // Create an HR Staff
        $hrStaff = User::updateOrCreate(
            ['email' => 'juan.delacruz@darpo-albay.gov.ph'],
            [
                'employee_number' => 'HR-0002',
                'first_name' => 'Juan',
                'last_name' => 'Dela Cruz',
                'password' => bcrypt('password'),
                'department_id' => $stod->id,
                'position_id' => $staffPosition?->id,
                'employment_status_id' => $permanent?->id,
                'hire_date' => '2018-03-20',
                'is_active' => true,
            ]
        );
        $hrStaff->assignRole('hr_staff');

        // Create a regular Employee (no email, uses employee number login)
        $employee = User::updateOrCreate(
            ['employee_number' => 'EMP-0001'],
            [
                'first_name' => 'Ana',
                'last_name' => 'Reyes',
                'email' => null,
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $employee->assignRole('employee');

        // Create 30 additional random employees ONLY if we are low on users
        if (User::count() < 30) {
            $departments = Department::all();
            $employmentStatuses = EmploymentStatus::all();

            User::factory()->count(30)->create()->each(function ($u) use ($departments, $employmentStatuses) {
                $dept = $departments->random();
                $pos = Position::where('department_id', $dept->id)->first();

                $u->update([
                    'department_id' => $dept->id,
                    'position_id' => $pos?->id,
                    'employment_status_id' => $employmentStatuses->random()->id,
                ]);

                $u->assignRole('employee');
            });
        }
    }
}
