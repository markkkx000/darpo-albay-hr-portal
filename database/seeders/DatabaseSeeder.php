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
        $adminPosition = Position::where('name', 'Administrative Officer V')->where('department_id', $stod->id)->first();
        $staffPosition = Position::where('name', 'Administrative Assistant III')->where('department_id', $stod->id)->first();

        // Create a Super Admin (no employee number, uses email login)
        $superAdmin = User::factory()->create([
            'employee_number' => null,
            'first_name' => 'Super',
            'last_name' => 'Admin',
            'email' => 'admin@darpo-albay.gov.ph',
        ]);
        $superAdmin->assignRole('super_admin');

        // Create an HR Admin
        $hrAdmin = User::factory()->create([
            'employee_number' => 'HR-0001',
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'email' => 'maria.santos@darpo-albay.gov.ph',
            'department_id' => $stod->id,
            'position_id' => $adminPosition?->id,
            'employment_status_id' => $permanent?->id,
            'hire_date' => '2015-06-16',
        ]);
        $hrAdmin->assignRole('hr_admin');

        // Create an HR Staff
        $hrStaff = User::factory()->create([
            'employee_number' => 'HR-0002',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.delacruz@darpo-albay.gov.ph',
            'department_id' => $stod->id,
            'position_id' => $staffPosition?->id,
            'employment_status_id' => $permanent?->id,
            'hire_date' => '2018-03-20',
        ]);
        $hrStaff->assignRole('hr_staff');

        // Create a regular Employee (no email, uses employee number login)
        $employee = User::factory()->create([
            'employee_number' => 'EMP-0001',
            'first_name' => 'Ana',
            'last_name' => 'Reyes',
            'email' => null,
        ]);
        $employee->assignRole('employee');
    }
}
