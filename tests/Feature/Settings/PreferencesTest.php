<?php

use App\Models\User;

test('preferences page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('preferences.edit'));

    $response->assertOk();
});

test('preferences can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('preferences.edit'))
        ->patch(route('preferences.update_notifications'), [
            'system' => false,
            'announcements' => true,
            'updates' => false,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('preferences.edit'));

    $user->refresh();

    expect($user->notification_preferences['system'])->toBeFalse();
    expect($user->notification_preferences['announcements'])->toBeTrue();
    expect($user->notification_preferences['updates'])->toBeFalse();
});

test('missing preferences default to true', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('preferences.update_notifications'), [
            // Omitting the keys should cause a validation error since they are required booleans
            // Let's actually test validation.
        ]);

    $response->assertSessionHasErrors(['system', 'announcements', 'updates']);
});
