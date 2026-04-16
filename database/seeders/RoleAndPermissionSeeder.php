<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create Permissions
        $permissions = [
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'leave.file',
            'leave.view_own',
            'leave.approve',
            'leave.manage',
            'personnel.view',
            'personnel.manage',
            'announcements.publish',
            'announcements.view',
            'dtr.export',
            'leave_credits.override',
            'travel_order.file',
            'travel_order.approve',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Roles and assign permissions

        // Super Admin
        $superAdmin = Role::create(['name' => 'super_admin']);
        // Super Admin gets all permissions via a gate (usually done in AuthServiceProvider)
        // but we can also assign all for consistency
        $superAdmin->givePermissionTo(Permission::all());

        // HR Admin
        $hrAdmin = Role::create(['name' => 'hr_admin']);
        $hrAdmin->givePermissionTo([
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'leave.approve',
            'leave.manage',
            'personnel.view',
            'personnel.manage',
            'announcements.publish',
            'announcements.view',
            'dtr.export',
            'leave_credits.override',
            'travel_order.approve',
        ]);

        // HR Staff
        $hrStaff = Role::create(['name' => 'hr_staff']);
        $hrStaff->givePermissionTo([
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'leave.approve',
            'personnel.view',
            'announcements.view',
            'travel_order.approve',
        ]);

        // Employee
        $employee = Role::create(['name' => 'employee']);
        $employee->givePermissionTo([
            'attendance.clock',
            'attendance.view_own',
            'leave.file',
            'leave.view_own',
            'announcements.view',
            'travel_order.file',
        ]);
    }
}
