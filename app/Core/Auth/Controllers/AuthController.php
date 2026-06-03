<?php

namespace App\Core\Auth\Controllers;

use App\Core\Auth\Models\LoginLog;
use App\Core\Auth\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\MfaCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the login view.
     */
    public function showLoginForm(): Response
    {
        return Inertia::render('auth/login');
    }

    /**
     * Handle an authentication attempt.
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        $loginField = $request->input('login');
        $authStrategy = filter_var($loginField, FILTER_VALIDATE_EMAIL) ? 'email' : 'employee_number';

        $user = User::where($authStrategy, $loginField)
            ->where('is_active', true)
            ->first();

        $status = $user && Hash::check($request->input('password'), $user->password);

        LoginLog::create([
            'login_field' => $loginField,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => $status ? 'success' : 'failed',
            'user_id' => $user ? $user->id : null,
        ]);

        if ($status) {
            if ($user->requiresMfa() && ! $request->hasCookie('mfa_trusted_device_'.$user->id)) {
                if (empty($user->email)) {
                    throw ValidationException::withMessages([
                        'login' => __('Your account requires Two-Factor Authentication, but no email address is registered. Please contact your system administrator to update your profile.'),
                    ]);
                }

                if ($user->mfa_code && $user->mfa_expires_at && $user->mfa_expires_at->isFuture()) {
                    // Reuse existing code
                } else {
                    $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    $user->update([
                        'mfa_code' => Hash::make($code),
                        'mfa_expires_at' => now()->addMinutes(10),
                    ]);

                    $user->notify(new MfaCodeNotification($code));
                }

                $request->session()->put('mfa_pending_user_id', $user->id);
                $request->session()->put('mfa_remember', $request->boolean('remember'));

                return redirect()->route('mfa.show');
            }

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            return redirect()->intended($this->getRedirectPath());
        }

        throw ValidationException::withMessages([
            'login' => __('auth.failed'),
        ]);
    }

    /**
     * Log the user out of the application.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Determine where to redirect the user after login based on their role.
     */
    protected function getRedirectPath(): string
    {
        return '/dashboard';
    }
}
