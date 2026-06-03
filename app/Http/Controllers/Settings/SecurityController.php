<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Notifications\MfaCodeNotification;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $isForced = $user->hasAnyRole(['super_admin', 'hr_admin', 'hr_staff']);

        $loginHistory = DB::table('activity_log')
            ->where('log_name', 'auth')
            ->where('description', 'User logged in')
            ->where('causer_id', $user->id)
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(function ($activity) {
                $props = json_decode($activity->properties, true);
                $agent = $props['user_agent'] ?? 'Unknown Browser';

                $browser = 'Unknown Browser';
                if (stripos($agent, 'Firefox') !== false) {
                    $browser = 'Firefox';
                } elseif (stripos($agent, 'Edg') !== false) {
                    $browser = 'Edge';
                } elseif (stripos($agent, 'Chrome') !== false) {
                    $browser = 'Chrome';
                } elseif (stripos($agent, 'Safari') !== false) {
                    $browser = 'Safari';
                }

                $os = 'Unknown OS';
                if (stripos($agent, 'Windows') !== false) {
                    $os = 'Windows';
                } elseif (stripos($agent, 'iPhone') !== false || stripos($agent, 'iPad') !== false) {
                    $os = 'iOS';
                } elseif (stripos($agent, 'Mac') !== false) {
                    $os = 'macOS';
                } elseif (stripos($agent, 'Android') !== false) {
                    $os = 'Android';
                } elseif (stripos($agent, 'Linux') !== false) {
                    $os = 'Linux';
                }

                return [
                    'ip' => $props['ip'] ?? 'Unknown IP',
                    'browser' => $browser,
                    'os' => $os,
                    'time' => Carbon::parse($activity->created_at)->diffForHumans(),
                ];
            });

        return Inertia::render('settings/security', [
            'mfaEnabled' => $user->mfa_enabled,
            'isMfaForced' => $isForced,
            'loginHistory' => $loginHistory,
        ]);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->forceFill([
            'password' => $request->password,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password updated.')]);

        return back();
    }

    /**
     * Generate OTP to setup or disable MFA.
     */
    public function setupMfa(Request $request): RedirectResponse
    {
        $user = $request->user();

        $action = $request->input('action', 'enable');
        if ($action === 'disable' && $user->hasAnyRole(['super_admin', 'hr_admin', 'hr_staff'])) {
            return back()->withErrors(['mfa' => 'MFA is mandatory for your role and cannot be disabled.']);
        }

        if (empty($user->email)) {
            return back()->withErrors(['mfa' => 'You do not have a registered email address. Please contact HR to update your record before enabling Two-Factor Authentication.']);
        }

        if ($user->mfa_code && $user->mfa_expires_at && $user->mfa_expires_at->isFuture()) {
            Inertia::flash('toast', ['type' => 'info', 'message' => __('Please check your email for the previously sent verification code.')]);

            return back();
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->forceFill([
            'mfa_code' => Hash::make($code),
            'mfa_expires_at' => now()->addMinutes(10),
        ])->save();

        $user->notify(new MfaCodeNotification($code, $action));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Verification code sent to your email.')]);

        return back();
    }

    /**
     * Verify OTP and enable MFA.
     */
    public function enableMfa(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string|size:6']);
        $user = $request->user();

        if (! $user->mfa_code || ! $user->mfa_expires_at || $user->mfa_expires_at->isPast() || ! Hash::check($request->code, $user->mfa_code)) {
            throw ValidationException::withMessages([
                'code' => __('The verification code is invalid or has expired.'),
            ]);
        }

        $user->forceFill([
            'mfa_enabled' => true,
            'mfa_code' => null,
            'mfa_expires_at' => null,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Two-Factor Authentication has been enabled.')]);

        return back();
    }

    /**
     * Verify OTP and disable MFA.
     */
    public function disableMfa(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|string|size:6']);
        $user = $request->user();

        if ($user->hasAnyRole(['super_admin', 'hr_admin', 'hr_staff'])) {
            return back()->withErrors(['mfa' => 'MFA is mandatory for your role and cannot be disabled.']);
        }

        if (! $user->mfa_code || ! $user->mfa_expires_at || $user->mfa_expires_at->isPast() || ! Hash::check($request->code, $user->mfa_code)) {
            throw ValidationException::withMessages([
                'code' => __('The verification code is invalid or has expired.'),
            ]);
        }

        $user->forceFill([
            'mfa_enabled' => false,
            'mfa_code' => null,
            'mfa_expires_at' => null,
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Two-Factor Authentication has been disabled.')]);

        return back();
    }

    /**
     * Resend OTP for MFA setup.
     */
    public function resendMfa(Request $request): RedirectResponse
    {
        $user = $request->user();

        $action = $request->input('action', 'enable');
        if ($action === 'disable' && $user->hasAnyRole(['super_admin', 'hr_admin', 'hr_staff'])) {
            return back()->withErrors(['mfa' => 'MFA is mandatory for your role and cannot be disabled.']);
        }

        if (empty($user->email)) {
            return back()->withErrors(['mfa' => 'You do not have a registered email address.']);
        }

        $key = 'mfa-setup-resend:'.$user->id;

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);

            return back()->withErrors(['mfa' => "Please wait {$seconds} seconds before requesting a new code."]);
        }

        RateLimiter::hit($key, 60);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->forceFill([
            'mfa_code' => Hash::make($code),
            'mfa_expires_at' => now()->addMinutes(10),
        ])->save();

        $user->notify(new MfaCodeNotification($code, $action));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('A new verification code has been sent.')]);

        return back();
    }
}
