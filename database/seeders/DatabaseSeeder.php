<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\Personnel\Models\AppointmentStatus;
use App\Modules\Personnel\Models\Division;
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

        $stod = Division::where('name', 'Support To Operations Division (STOD)')->first();
        $permanent = AppointmentStatus::where('name', 'Permanent')->first();
        $adminPosition = Position::where('name', 'Provincial Chief Administrative Officer')->where('division_id', $stod->id)->first();
        $staffPosition = Position::where('name', 'HR Staff')->where('division_id', $stod->id)->first();

        // Create a Super Admin
        $superAdmin = User::updateOrCreate(
            ['employee_number' => 'superadmin'],
            [
                'first_name' => 'Super',
                'middle_name' => 'Central',
                'last_name' => 'Admin',
                'email' => 'admin@darpo-albay.gov.ph',
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
                'email' => 'maria.santos@darpo-albay.gov.ph',
                'password' => bcrypt('password'),
                'division_id' => $stod->id,
                'appointment_status_id' => $permanent?->id,
                'hire_date' => '2015-06-16',
                'is_active' => true,
            ]
        );
        $hrAdmin->assignRole('hr_admin');
        if ($adminPosition) {
            $hrAdmin->positions()->sync([$adminPosition->id => ['is_primary' => true]]);
        }

        // Create an HR Staff
        $hrStaff = User::updateOrCreate(
            ['employee_number' => 'hrstaff'],
            [
                'first_name' => 'HR',
                'middle_name' => 'Support',
                'last_name' => 'Staff',
                'email' => 'juan.delacruz@darpo-albay.gov.ph',
                'password' => bcrypt('password'),
                'division_id' => $stod->id,
                'appointment_status_id' => $permanent?->id,
                'hire_date' => '2018-03-20',
                'is_active' => true,
            ]
        );
        $hrStaff->assignRole('hr_staff');
        if ($staffPosition) {
            $hrStaff->positions()->sync([$staffPosition->id => ['is_primary' => true]]);
        }

        // Create a regular Employee
        $employee = User::updateOrCreate(
            ['employee_number' => 'E-0123456789'],
            [
                'first_name' => 'John',
                'middle_name' => 'Quincy',
                'last_name' => 'Doe',
                'email' => null,
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );
        $employee->assignRole('employee');

        // Create 30 additional random employees ONLY if we are low on users
        if (User::count() < 30) {
            $divisions = Division::all();
            $appointmentStatuses = AppointmentStatus::all();

            User::factory()->count(30)->create()->each(function (User $u) use ($divisions, $appointmentStatuses) {
                $div = $divisions->random();
                $pos = Position::where('division_id', $div->id)->first();

                $u->update([
                    'division_id' => $div->id,
                    'appointment_status_id' => $appointmentStatuses->random()->id,
                ]);

                if ($pos) {
                    $u->positions()->sync([$pos->id => ['is_primary' => true]]);
                }

                $u->assignRole('employee');
            });
        }
    }
}
