<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'attendance.clock',
            'attendance.view',
            'attendance.logs.view',
            'attendance.logs.manage',
            'leave.view',
            'leave.manage',
            'leave.tardiness.manage',
            'leave.credits.view',
            'leave.credits.manage',
            'leave.settings.manage',
            'personnel.view',
            'personnel.manage',
            'announcements.manage',
            'announcements.view',
            'dtr.manage',
            'travel_order.create',
            'travel_order.manage',
            'roles.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and assign permissions

        // Super Admin
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->syncPermissions(Permission::all());

        // HR Admin
        $hrAdmin = Role::firstOrCreate(['name' => 'hr_admin']);
        $hrAdmin->syncPermissions([
            'attendance.clock',
            'attendance.view',
            'attendance.logs.view',
            'attendance.logs.manage',
            'leave.view',
            'leave.manage',
            'leave.tardiness.manage',
            'leave.credits.view',
            'leave.credits.manage',
            'leave.settings.manage',
            'personnel.view',
            'personnel.manage',
            'announcements.manage',
            'announcements.view',
            'dtr.manage',
            'travel_order.manage',
        ]);

        // HR Staff
        $hrStaff = Role::firstOrCreate(['name' => 'hr_staff']);
        $hrStaff->syncPermissions([
            'attendance.clock',
            'attendance.view',
            'attendance.logs.view',
            'leave.view',
            'leave.manage',
            'leave.tardiness.manage',
            'leave.credits.view',
            'leave.credits.manage',
            'personnel.view',
            'announcements.view',
            'announcements.manage',
            'travel_order.manage',
        ]);

        // Division Head
        $divisionHead = Role::firstOrCreate(['name' => 'division_head']);
        $divisionHead->syncPermissions([
            'attendance.clock',
            'attendance.view',
            'leave.view',
            'leave.credits.view',
            'announcements.view',
            'announcements.manage',
            'travel_order.create',
        ]);

        // Employee
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'attendance.clock',
            'attendance.view',
            'leave.view',
            'leave.credits.view',
            'announcements.view',
            'travel_order.create',
        ]);
    }
}
