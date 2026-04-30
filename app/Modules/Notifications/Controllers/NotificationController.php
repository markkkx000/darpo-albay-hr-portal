<?php

namespace App\Modules\Notifications\Controllers;

use App\Core\Services\NotificationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Display a paginated list of notifications.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Modules/Notifications/Index', [
            'notifications' => $request->user()->notifications()->latest()->paginate(20),
        ]);
    }

    /**
     * Get the 20 most recent notifications as JSON.
     */
    public function recent(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getRecentNotifications($request->user());

        return response()->json([
            'data' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function read(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $this->notificationService->markAsRead($id, $request->user());

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notification marked as read.']);
        }

        return back();
    }

    /**
     * Mark a single notification as unread.
     */
    public function unread(Request $request, string $id): JsonResponse|RedirectResponse
    {
        $this->notificationService->markAsUnread($id, $request->user());

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notification marked as unread.']);
        }

        return back();
    }

    /**
     * Mark all dismissible notifications as read.
     */
    public function readAll(Request $request): JsonResponse|RedirectResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        if ($request->wantsJson()) {
            return response()->json(['message' => 'All dismissible notifications marked as read.']);
        }

        return back();
    }
}
