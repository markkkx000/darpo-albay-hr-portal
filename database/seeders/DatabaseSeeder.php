<?php

namespace Database\Seeders;

use App\Models\User;
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
        ]);
        $hrAdmin->assignRole('hr_admin');

        // Create an HR Staff
        $hrStaff = User::factory()->create([
            'employee_number' => 'HR-0002',
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.delacruz@darpo-albay.gov.ph',
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
