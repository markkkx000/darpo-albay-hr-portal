<?php

use App\Models\User;
use App\Notifications\MfaCodeNotification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->standardUser = User::factory()->create(['mfa_enabled' => false]);

    $this->hrUser = User::factory()->create(['mfa_enabled' => false]);
    $hrRole = Role::firstOrCreate(['name' => 'hr_admin']);
    $this->hrUser->assignRole($hrRole);

    $this->mfaUser = User::factory()->create(['mfa_enabled' => true]);
});

it('allows standard user without MFA to log in directly', function () {
    $response = $this->post('/login', [
        'login' => $this->standardUser->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($this->standardUser);
    $response->assertRedirect('/dashboard');
});

it('intercepts login and requires MFA for standard user with MFA enabled', function () {
    Notification::fake();

    $response = $this->post('/login', [
        'login' => $this->mfaUser->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('mfa.show'));

    $this->mfaUser->refresh();
    expect($this->mfaUser->mfa_code)->not->toBeNull();

    Notification::assertSentTo($this->mfaUser, MfaCodeNotification::class);
});

it('intercepts login and requires MFA for HR admin even if mfa_enabled is false', function () {
    Notification::fake();

    $response = $this->post('/login', [
        'login' => $this->hrUser->email,
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertRedirect(route('mfa.show'));

    Notification::assertSentTo($this->hrUser, MfaCodeNotification::class);
});

it('verifies MFA code successfully and logs user in', function () {
    $code = '123456';
    $this->mfaUser->update([
        'mfa_code' => Hash::make($code),
        'mfa_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->withSession(['mfa_pending_user_id' => $this->mfaUser->id])
        ->post('/mfa/verify', [
            'code' => $code,
        ]);

    $this->assertAuthenticatedAs($this->mfaUser);
    $response->assertRedirect('/dashboard');
});

it('rejects invalid MFA code', function () {
    $this->mfaUser->update([
        'mfa_code' => Hash::make('123456'),
        'mfa_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->withSession(['mfa_pending_user_id' => $this->mfaUser->id])
        ->post('/mfa/verify', [
            'code' => '654321',
        ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('code');
});

it('verifies MFA code successfully and sets trust_device cookie', function () {
    $code = '123456';
    $this->mfaUser->update([
        'mfa_code' => Hash::make($code),
        'mfa_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->withSession(['mfa_pending_user_id' => $this->mfaUser->id])
        ->post('/mfa/verify', [
            'code' => $code,
            'trust_device' => true,
        ]);

    $this->assertAuthenticatedAs($this->mfaUser);
    $response->assertRedirect('/dashboard');
    $response->assertCookie('mfa_trusted_device_'.$this->mfaUser->id, true);
});

it('bypasses MFA if trust_device cookie is present', function () {
    $response = $this->withCookie('mfa_trusted_device_'.$this->mfaUser->id, true)
        ->post('/login', [
            'login' => $this->mfaUser->email,
            'password' => 'password',
        ]);

    $this->assertAuthenticatedAs($this->mfaUser);
    $response->assertRedirect('/dashboard');
});
