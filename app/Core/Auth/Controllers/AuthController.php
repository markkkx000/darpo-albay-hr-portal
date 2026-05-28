<?php

namespace App\Core\Auth\Controllers;

use App\Core\Auth\Models\LoginLog;
use App\Core\Auth\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $credentials = [
            $authStrategy => $loginField,
            'password' => $request->input('password'),
            'is_active' => true, // Ensure account is active
        ];

        $status = Auth::attempt($credentials, $request->boolean('remember'));

        LoginLog::create([
            'login_field' => $loginField,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => $status ? 'success' : 'failed',
            'user_id' => $status ? Auth::id() : null,
        ]);

        if ($status) {
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
