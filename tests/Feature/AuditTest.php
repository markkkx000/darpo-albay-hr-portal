<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class AuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_super_admin_can_view_system_audit()
    {
        // standard user (no roles.manage)
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('audit.index'))
            ->assertForbidden();

        // super admin
        $admin = User::factory()->create();
        Permission::firstOrCreate(['name' => 'system.audit']);
        $admin->givePermissionTo('system.audit');

        $this->actingAs($admin)
            ->get(route('audit.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Modules/Audit/Index'));
    }

    public function test_super_admin_can_export_audit_logs()
    {
        $admin = User::factory()->create();
        Permission::firstOrCreate(['name' => 'system.audit']);
        $admin->givePermissionTo('system.audit');

        // Create some dummy logs
        Activity::create([
            'log_name' => 'default',
            'description' => 'Test log entry',
            'event' => 'created',
            'causer_type' => User::class,
            'causer_id' => $admin->id,
            'properties' => ['ip' => '127.0.0.1'],
        ]);

        $response = $this->actingAs($admin)
            ->get(route('audit.export'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="system-audit-'.now()->format('Y-m-d').'.csv"');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Test log entry', $content);
        $this->assertStringContainsString('127.0.0.1', $content);
    }
}
