<?php

namespace App\Http\Middleware;

use App\Core\Services\ModuleRegistry;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $registry = app(ModuleRegistry::class);

        if ($user = $request->user()) {
            // Only update database if last_seen_at is null or older than 5 minutes to avoid DB spam
            if (! $user->last_seen_at || $user->last_seen_at < now()->subMinutes(5)) {
                // saveQuietly prevents firing Model events (like updating the main updated_at column unnecessarily)
                $user->forceFill(['last_seen_at' => now()])->saveQuietly();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? $request->user()->only([
                    'id', 'employee_number', 'first_name', 'middle_name', 'last_name',
                    'email', 'profile_photo_url', 'avatar', 'name', 'is_active',
                ]) : null,
                'roles' => fn () => $request->user()?->roles->pluck('name')->toArray() ?? [],
                'permissions' => fn () => $request->user()?->getAllPermissions()->pluck('name')->toArray() ?? [],
                'navigation' => array_values(array_filter($registry->getNavigation(), function ($item) use ($request) {
                    if (empty($item['permission'])) {
                        return true;
                    }

                    if (is_array($item['permission'])) {
                        foreach ($item['permission'] as $p) {
                            if ($request->user()?->can($p)) {
                                return true;
                            }
                        }

                        return false;
                    }

                    return $request->user()?->can($item['permission']) ?? false;
                })),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appNotifications' => fn () => $request->user() ? [
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ] : null,
            'server_time' => now()->toIso8601String(),
        ];

    }
}
