<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\AppointmentStatus;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            LeaveTypeSeeder::class,
            LeaveStatusSeeder::class,
            OrganizationStructureSeeder::class,
        ]);

        // Seed Appointment Statuses
        $statuses = [
            'Permanent',
            'Contract of Service (COS)',
            'Job Order',
            'Resigned',
            'Retired',
            'AWOL',
            'Terminated',
        ];

        foreach ($statuses as $name) {
            AppointmentStatus::updateOrCreate(['name' => $name], ['is_active' => true]);
        }

        $permanent = AppointmentStatus::where('name', 'Permanent')->first();

        // Create a Super Admin
        $superAdmin = User::updateOrCreate(
            ['employee_number' => 'superadmin'],
            [
                'first_name' => 'Super',
                'middle_name' => 'Central',
                'last_name' => 'Admin',
                'email' => 'superadmin@example.com',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $superAdmin->assignRole('super_admin');

        // Create an HR Admin
        $hrAdmin = User::updateOrCreate(
            ['employee_number' => 'hradmin'],
            [
                'first_name' => 'HR',
                'middle_name' => 'Management',
                'last_name' => 'Admin',
                'email' => 'hradmin@example.com',
                'password' => bcrypt('password'),
                'appointment_status_id' => $permanent?->id,
                'hire_date' => '2015-06-16',
                'is_active' => true,
            ]
        );
        $hrAdmin->assignRole('hr_admin');
    }
}
