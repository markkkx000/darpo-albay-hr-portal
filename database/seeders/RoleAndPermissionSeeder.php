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
            'attendance.view_own',
            'attendance.manage',
            'attendance.delete',
            'leave.access_module',
            'leave.view_own',
            'leave.encode',
            'leave.manage_tardiness',
            'leave.manage_credits',
            'leave.manage_settings',
            'personnel.view',
            'personnel.create',
            'personnel.update',
            'personnel.delete',
            'personnel.restore',
            'announcements.manage',
            'announcements.view',
            'dtr.export',
            'travel_order.file',
            'travel_order.approve',
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
            'attendance.view_own',
            'attendance.manage',
            'attendance.delete',
            'leave.access_module',
            'leave.view_own',
            'leave.encode',
            'leave.manage_tardiness',
            'leave.manage_credits',
            'leave.manage_settings',
            'personnel.view',
            'personnel.create',
            'personnel.update',
            'personnel.restore',
            'announcements.manage',
            'announcements.view',
            'dtr.export',
            'travel_order.approve',
        ]);

        // HR Staff
        $hrStaff = Role::firstOrCreate(['name' => 'hr_staff']);
        $hrStaff->syncPermissions([
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'leave.access_module',
            'leave.view_own',
            'leave.encode',
            'leave.manage_tardiness',
            'leave.manage_credits',
            'personnel.view',
            'announcements.view',
            'announcements.manage',
            'travel_order.approve',
        ]);

        // Department Head
        $deptHead = Role::firstOrCreate(['name' => 'department_head']);
        $deptHead->syncPermissions([
            'attendance.clock',
            'attendance.view_own',
            'leave.view_own',
            'announcements.view',
            'announcements.manage',
            'travel_order.file',
        ]);

        // Employee
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'attendance.clock',
            'attendance.view_own',
            'leave.view_own',
            'announcements.view',
            'travel_order.file',
        ]);
    }
}
