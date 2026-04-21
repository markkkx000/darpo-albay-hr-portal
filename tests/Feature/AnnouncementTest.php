<?php

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use App\Modules\Personnel\Models\Department;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    // Create base data for foreign keys
    $this->department = Department::create(['name' => 'IT', 'code' => 'IT']);
    $this->position = Position::create(['name' => 'Developer', 'department_id' => $this->department->id]);
    $this->employmentStatus = EmploymentStatus::create(['name' => 'Regular']);

    $this->hrAdmin = User::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->employmentStatus->id,
    ]);
    $this->hrAdmin->assignRole('hr_admin');

    $this->employee = User::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->employmentStatus->id,
    ]);
    $this->employee->assignRole('employee');

    $this->deptHead = User::factory()->create([
        'department_id' => $this->department->id,
        'position_id' => $this->position->id,
        'employment_status_id' => $this->employmentStatus->id,
    ]);
    $this->deptHead->assignRole('department_head');
});

test('hr admin can create a draft announcement', function () {
    $response = $this->actingAs($this->hrAdmin)
        ->post('/announcements', [
            'title' => 'Test Announcement',
            'content' => '<p>Test Content</p>',
            'priority' => 'normal',
            'target_type' => 'all',
        ]);

    $response->assertRedirect(route('announcements.manage'));
    $this->assertDatabaseHas('announcements', [
        'title' => 'Test Announcement',
        'status' => 'draft',
        'posted_by' => $this->hrAdmin->id,
    ]);
});

test('employee cannot create a draft announcement', function () {
    $response = $this->actingAs($this->employee)
        ->post('/announcements', [
            'title' => 'Test Announcement',
            'content' => '<p>Test Content</p>',
            'priority' => 'normal',
            'target_type' => 'all',
        ]);

    $response->assertForbidden();
});

test('can update a draft announcement', function () {
    $announcement = Announcement::factory()->create([
        'posted_by' => $this->hrAdmin->id,
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->hrAdmin)
        ->put("/announcements/{$announcement->id}", [
            'title' => 'Updated Title',
            'content' => '<p>Updated Content</p>',
            'priority' => 'high',
            'target_type' => 'all',
        ]);

    $response->assertRedirect(route('announcements.manage'));
    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'title' => 'Updated Title',
        'priority' => 'high',
    ]);
});

test('cannot update a published announcement', function () {
    $announcement = Announcement::factory()->create([
        'posted_by' => $this->hrAdmin->id,
        'status' => 'published',
    ]);

    $response = $this->actingAs($this->hrAdmin)
        ->put("/announcements/{$announcement->id}", [
            'title' => 'Updated Title',
            'content' => '<p>Updated Content</p>',
            'priority' => 'high',
            'target_type' => 'all',
        ]);

    $response->assertForbidden();
});

test('can publish a draft announcement and dispatch notifications', function () {
    $mock = $this->mock(NotificationService::class);
    $mock->shouldReceive('notifyAll')->once();

    $announcement = Announcement::factory()->create([
        'posted_by' => $this->hrAdmin->id,
        'status' => 'draft',
        'target_type' => 'all',
    ]);

    $response = $this->actingAs($this->hrAdmin)
        ->post("/announcements/{$announcement->id}/publish");

    $response->assertRedirect();
    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'status' => 'published',
    ]);
    expect($announcement->fresh()->published_at)->not->toBeNull();
});

test('department head can only publish to their own department', function () {
    $notificationMock = $this->mock(NotificationService::class);

    $announcement = Announcement::factory()->create([
        'posted_by' => $this->deptHead->id,
        'status' => 'draft',
        'target_type' => 'all',
    ]);

    // Try to publish targeting 'all' (should fail)
    $response = $this->actingAs($this->deptHead)
        ->post("/announcements/{$announcement->id}/publish");

    $response->assertStatus(403);

    // Update to correct department and try again
    $announcement->update([
        'target_type' => 'department',
        'target_id' => $this->deptHead->department_id,
    ]);

    $notificationMock->shouldReceive('notifyDepartment')->once();

    $response = $this->actingAs($this->deptHead)
        ->post("/announcements/{$announcement->id}/publish");

    $response->assertRedirect();
    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'status' => 'published',
    ]);
});

test('employee can view published announcements targeted to them', function () {
    $announcement = Announcement::factory()->create([
        'status' => 'published',
        'target_type' => 'all',
    ]);

    $response = $this->actingAs($this->employee)
        ->get("/announcements/{$announcement->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page->component('Modules/Announcements/Show'));
});

test('employee cannot view drafts', function () {
    $announcement = Announcement::factory()->create([
        'status' => 'draft',
    ]);

    $response = $this->actingAs($this->employee)
        ->get("/announcements/{$announcement->id}");

    $response->assertForbidden();
});

test('soft delete removes announcement from view', function () {
    $announcement = Announcement::factory()->create([
        'status' => 'published',
    ]);

    $response = $this->actingAs($this->hrAdmin)
        ->delete("/announcements/{$announcement->id}");

    $response->assertRedirect();
    $this->assertSoftDeleted('announcements', ['id' => $announcement->id]);

    // Employee should no longer see it
    $response = $this->actingAs($this->employee)
        ->get("/announcements/{$announcement->id}");

    $response->assertNotFound();
});
