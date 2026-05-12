<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    public function up(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $map = [
            'attendance.view_own' => 'attendance.view',
            'attendance.manage' => 'attendance.logs.view',
            'attendance.delete' => 'attendance.logs.manage',
            'leave.view_own' => 'leave.view',
            'leave.encode' => 'leave.manage',
            'leave.manage_credits' => 'leave.credits.manage',
            'leave.manage_tardiness' => 'leave.tardiness.manage',
            'leave.manage_settings' => 'leave.settings.manage',
            'personnel.create' => 'personnel.manage',
            'travel_order.file' => 'travel_order.create',
            'travel_order.approve' => 'travel_order.manage',
            'dtr.export' => 'dtr.manage',
        ];

        foreach ($map as $old => $new) {
            DB::table('permissions')->where('name', $old)->update(['name' => $new]);
        }

        // Delete redundant ones
        $toDelete = [
            'leave.access_module',
            'personnel.update',
            'personnel.delete',
            'personnel.restore',
        ];

        DB::table('permissions')->whereIn('name', $toDelete)->delete();

        // Add new permissions
        DB::table('permissions')->insertOrIgnore([
            'name' => 'leave.credits.view',
            'guard_name' => 'web',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $map = [
            'attendance.view' => 'attendance.view_own',
            'attendance.logs.view' => 'attendance.manage',
            'attendance.logs.manage' => 'attendance.delete',
            'leave.view' => 'leave.view_own',
            'leave.manage' => 'leave.encode',
            'leave.credits.manage' => 'leave.manage_credits',
            'leave.tardiness.manage' => 'leave.manage_tardiness',
            'leave.settings.manage' => 'leave.manage_settings',
            'personnel.manage' => 'personnel.create',
            'travel_order.create' => 'travel_order.file',
            'travel_order.manage' => 'travel_order.approve',
            'dtr.manage' => 'dtr.export',
        ];

        foreach ($map as $new => $old) {
            DB::table('permissions')->where('name', $new)->update(['name' => $old]);
        }

        $toRestore = [
            'leave.access_module',
            'personnel.update',
            'personnel.delete',
            'personnel.restore',
        ];

        foreach ($toRestore as $perm) {
            DB::table('permissions')->insertOrIgnore([
                'name' => $perm,
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('permissions')->where('name', 'leave.credits.view')->delete();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
