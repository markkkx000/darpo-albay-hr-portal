<?php

namespace App\Core\Auth\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MfaCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class MfaController extends Controller
{
    /**
     * Show the MFA verification form.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('mfa_pending_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/mfa-verify');
    }

    /**
     * Verify the MFA code.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
            'trust_device' => ['nullable', 'boolean'],
        ]);

        $userId = $request->session()->get('mfa_pending_user_id');

        if (! $userId) {
            return redirect()->route('login')->withErrors(['login' => 'Session expired. Please log in again.']);
        }

        $user = User::find($userId);

        if (! $user) {
            return redirect()->route('login');
        }

        // Check if code matches and is not expired
        if (
            $user->mfa_code &&
            Hash::check($request->input('code'), $user->mfa_code) &&
            $user->mfa_expires_at &&
            now()->lessThanOrEqualTo($user->mfa_expires_at)
        ) {
            // Success
            $user->update([
                'mfa_code' => null,
                'mfa_expires_at' => null,
            ]);

            Auth::login($user, $request->session()->get('mfa_remember', false));

            $request->session()->forget('mfa_pending_user_id');
            $request->session()->forget('mfa_remember');

            $request->session()->regenerate();

            $response = redirect()->intended('/dashboard');

            if ($request->boolean('trust_device')) {
                // 90 days = 129600 minutes
                $response->withCookie(cookie('mfa_trusted_device_'.$user->id, true, 129600));
            }

            return $response;
        }

        return back()->withErrors(['code' => 'The provided code is invalid or has expired.']);
    }

    /**
     * Resend the MFA code.
     */
    public function resend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('mfa_pending_user_id');

        if (! $userId) {
            return redirect()->route('login')->withErrors(['login' => 'Session expired. Please log in again.']);
        }

        $user = User::find($userId);

        if (! $user) {
            return redirect()->route('login');
        }

        $key = 'mfa-resend:'.$user->id;

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $seconds = RateLimiter::availableIn($key);

            return back()->withErrors(['code' => "Please wait {$seconds} seconds before requesting a new code."]);
        }

        RateLimiter::hit($key, 60);

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->forceFill([
            'mfa_code' => Hash::make($code),
            'mfa_expires_at' => now()->addMinutes(10),
        ])->save();

        $user->notify(new MfaCodeNotification($code, 'login'));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('A new verification code has been sent.')]);

        return back();
    }
}
