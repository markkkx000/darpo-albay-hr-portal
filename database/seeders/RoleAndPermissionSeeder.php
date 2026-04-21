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
            'attendance.delete',
            'leave.file',
            'leave.view_own',
            'leave.approve',
            'leave.manage',
            'personnel.view',
            'personnel.create',
            'personnel.update',
            'personnel.delete',
            'personnel.restore',
            'announcements.manage',
            'announcements.view',
            'dtr.export',
            'leave_credits.override',
            'travel_order.file',
            'travel_order.approve',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles and assign permissions

        // Super Admin
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        // Super Admin gets all permissions via a gate (usually done in AuthServiceProvider)
        // but we can also assign all for consistency
        $superAdmin->syncPermissions(Permission::all());

        // HR Admin
        $hrAdmin = Role::firstOrCreate(['name' => 'hr_admin']);
        $hrAdmin->syncPermissions([
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'attendance.delete',
            'leave.approve',
            'leave.manage',
            'personnel.view',
            'personnel.create',
            'personnel.update',
            'personnel.restore',
            'announcements.manage',
            'announcements.view',
            'dtr.export',
            'leave_credits.override',
            'travel_order.approve',
        ]);

        // HR Staff
        $hrStaff = Role::firstOrCreate(['name' => 'hr_staff']);
        $hrStaff->syncPermissions([
            'attendance.clock',
            'attendance.view_own',
            'attendance.manage',
            'leave.approve',
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
            'leave.file',
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
            'leave.file',
            'leave.view_own',
            'announcements.view',
            'travel_order.file',
        ]);
    }
}
