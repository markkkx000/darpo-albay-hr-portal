<?php

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Personnel\Services\EmployeeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::create(['name' => 'employee']);
    Role::create(['name' => 'admin']);
    $this->notificationService = app(NotificationService::class);
});

test('can notify a user', function () {
    $user = User::factory()->create();

    $this->notificationService->notifyUser($user, [
        'type' => 'system',
        'title' => 'Test Notification',
        'body' => 'Test Body',
        'from' => 'System',
        'priority' => 'normal',
        'dismissible' => true,
    ]);

    expect($user->notifications)->toHaveCount(1)
        ->and($user->notifications->first()->data['title'])->toBe('Test Notification');
});

test('can mark a dismissible notification as read', function () {
    $user = User::factory()->create();
    $this->notificationService->notifyUser($user, [
        'type' => 'system',
        'title' => 'Dismissible',
        'dismissible' => true,
    ]);

    $notificationId = $user->notifications->first()->id;

    $this->actingAs($user)
        ->postJson("/notifications/{$notificationId}/read")
        ->assertSuccessful();

    expect($user->fresh()->notifications->first()->read_at)->not->toBeNull();
});

test('can mark a notification as unread', function () {
    $user = User::factory()->create();
    $this->notificationService->notifyUser($user, ['title' => 'Test']);
    $notificationId = $user->notifications->first()->id;
    $user->notifications->first()->markAsRead();

    expect($user->fresh()->notifications->first()->read_at)->not->toBeNull();

    $this->actingAs($user)
        ->postJson("/notifications/{$notificationId}/unread")
        ->assertSuccessful();

    expect($user->fresh()->notifications->first()->read_at)->toBeNull();
});

test('cannot mark a non-dismissible notification as read', function () {
    $user = User::factory()->create();
    $this->notificationService->notifyUser($user, [
        'type' => 'system',
        'title' => 'Non-dismissible',
        'dismissible' => false,
    ]);

    $notificationId = $user->notifications->first()->id;

    $this->actingAs($user)
        ->postJson("/notifications/{$notificationId}/read")
        ->assertForbidden();

    expect($user->fresh()->notifications->first()->read_at)->toBeNull();
});

test('mark all as read only affects dismissible notifications', function () {
    $user = User::factory()->create();
    $this->notificationService->notifyUser($user, ['title' => 'D1', 'dismissible' => true]);
    $this->notificationService->notifyUser($user, ['title' => 'ND1', 'dismissible' => false]);

    $this->actingAs($user)
        ->postJson('/notifications/read-all')
        ->assertSuccessful();

    $dismissible = $user->fresh()->notifications()->where('data->title', 'D1')->first();
    $nonDismissible = $user->fresh()->notifications()->where('data->title', 'ND1')->first();

    expect($dismissible->read_at)->not->toBeNull()
        ->and($nonDismissible->read_at)->toBeNull();
});

test('default password notification is created on employee creation', function () {
    $employeeService = app(EmployeeService::class);

    $user = $employeeService->createEmployee([
        'employee_number' => 'EMP-001',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'is_active' => true,
    ]);

    expect($user->notifications)->toHaveCount(1)
        ->and($user->notifications->first()->data['subtype'])->toBe('default_password');
});

test('default password notification is auto-deleted after password change', function () {
    $user = User::factory()->create();
    $this->notificationService->notifyUser($user, [
        'type' => 'system',
        'subtype' => 'default_password',
        'title' => 'Change Password',
        'dismissible' => false,
    ]);

    expect($user->notifications)->toHaveCount(1);

    $user->forceFill(['password' => 'new-password-123'])->save();

    expect($user->fresh()->notifications)->toHaveCount(0);
});

test('user cannot read another user\'s notification', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $this->notificationService->notifyUser($user1, ['title' => 'U1', 'dismissible' => true]);
    $notificationId = $user1->notifications->first()->id;

    $this->actingAs($user2)
        ->postJson("/notifications/{$notificationId}/read")
        ->assertNotFound();
});
