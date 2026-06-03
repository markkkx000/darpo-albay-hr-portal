<?php

namespace App\Core\Services;

use App\Models\User;
use App\Notifications\GenericDatabaseNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Notification;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NotificationService
{
    /**
     * Check if a user should receive a notification based on their preferences.
     */
    private function shouldNotify(User $user, array $data): bool
    {
        $prefs = $user->notification_preferences ?? [];

        $type = $data['type'] ?? '';
        $title = $data['title'] ?? '';

        if (strtolower($type) === 'announcement' || strtolower($type) === 'announcements' || str_contains(strtolower($title), 'announcement')) {
            return $prefs['announcements'] ?? true;
        }

        if (strtolower($type) === 'update' || str_contains(strtolower($title), 'document')) {
            return $prefs['updates'] ?? true;
        }

        if (strtolower($type) === 'system') {
            return $prefs['system'] ?? true;
        }

        return true;
    }

    /**
     * Send notification to a single user.
     */
    public function notifyUser(User $user, array $data): void
    {
        if ($this->shouldNotify($user, $data)) {
            $user->notify(new GenericDatabaseNotification($data));
        }
    }

    /**
     * Send notification to all active users in a division.
     */
    public function notifyDivision(int $divisionId, array $data): void
    {
        $users = User::where('division_id', $divisionId)->where('is_active', true)->get();
        $users = $users->filter(fn ($user) => $this->shouldNotify($user, $data));
        Notification::send($users, new GenericDatabaseNotification($data));
    }

    /**
     * Send notification to all active users in a position.
     */
    public function notifyPosition(int $positionId, array $data): void
    {
        $users = User::whereHas('positions', function ($query) use ($positionId) {
            $query->where('positions.id', $positionId);
        })->where('is_active', true)->get();
        $users = $users->filter(fn ($user) => $this->shouldNotify($user, $data));
        Notification::send($users, new GenericDatabaseNotification($data));
    }

    /**
     * Send notification to all active users.
     */
    public function notifyAll(array $data): void
    {
        $users = User::where('is_active', true)->get();
        $users = $users->filter(fn ($user) => $this->shouldNotify($user, $data));
        Notification::send($users, new GenericDatabaseNotification($data));
    }

    /**
     * Mark a single notification as read if it is dismissible.
     */
    public function markAsRead(string $notificationId, User $user): void
    {
        $notification = $user->notifications()->findOrFail($notificationId);

        if (! ($notification->data['dismissible'] ?? true)) {
            throw new HttpException(403, 'This notification cannot be manually dismissed.');
        }

        $notification->markAsRead();
    }

    /**
     * Mark a single notification as unread.
     */
    public function markAsUnread(string $notificationId, User $user): void
    {
        $notification = $user->notifications()->findOrFail($notificationId);
        $notification->markAsUnread();
    }

    /**
     * Mark all dismissible notifications as read for a user.
     */
    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications->each(function ($notification) {
            if ($notification->data['dismissible'] ?? true) {
                $notification->markAsRead();
            }
        });
    }

    /**
     * Dismiss notifications by their subtype.
     */
    public function dismissBySubtype(User $user, string $subtype): void
    {
        $user->notifications()
            ->where('data->subtype', $subtype)
            ->delete();
    }

    /**
     * Get unread notifications count for a user.
     */
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Get recent notifications for a user.
     */
    public function getRecentNotifications(User $user, int $limit = 20): Collection
    {
        return $user->notifications()
            ->reorder()
            ->orderByRaw("CASE WHEN data->>'subtype' = 'default_password' THEN 1 ELSE 0 END DESC")
            ->latest()
            ->limit($limit)
            ->get();
    }
}
