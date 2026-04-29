<?php

namespace App\Modules\Announcements\Services;

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AnnouncementService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Create a draft announcement.
     */
    public function create(array $data, User $author): Announcement
    {
        return Announcement::create([
            ...$data,
            'posted_by' => $author->id,
            'status' => 'draft',
        ]);
    }

    /**
     * Update a draft announcement.
     */
    public function update(Announcement $announcement, array $data): Announcement
    {
        if ($announcement->status !== 'draft') {
            throw new DomainException('Only draft announcements can be updated.');
        }

        $announcement->update($data);

        return $announcement;
    }

    /**
     * Publish a draft announcement.
     */
    public function publish(Announcement $announcement, User $actor): void
    {
        if ($announcement->status !== 'draft') {
            throw new DomainException('Only draft announcements can be published.');
        }

        // Department head restriction
        if ($actor->hasRole('department_head')) {
            if ($announcement->target_type !== 'department' || (int) $announcement->target_id !== (int) $actor->department_id) {
                throw new HttpException(403, 'Department heads can only publish announcements to their own department.');
            }
        }

        $announcement->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->dispatchNotifications($announcement);
    }

    /**
     * Delete an announcement.
     */
    public function delete(Announcement $announcement): void
    {
        $announcement->delete();
    }

    /**
     * Get published announcements for a specific user.
     */
    public function getPublishedForUser(User $user): LengthAwarePaginator
    {
        return Announcement::forUser($user)
            ->with('author')
            ->latest('published_at')
            ->paginate(15);
    }

    /**
     * Get all announcements for HR management view.
     */
    public function getAllForHR(): LengthAwarePaginator
    {
        return Announcement::with('author')
            ->latest()
            ->paginate(15);
    }

    /**
     * Dispatch notifications based on announcement targeting.
     */
    protected function dispatchNotifications(Announcement $announcement): void
    {
        $plainContent = strip_tags($announcement->content);

        $notificationData = [
            'title' => $announcement->title,
            'message' => 'A new announcement has been posted.',
            'body' => mb_substr($plainContent, 0, 500),
            'url' => route('announcements.show', $announcement->id, false),
            'type' => 'announcement',
            'subtype' => 'new_announcement',
            'priority' => $announcement->priority,
        ];

        match ($announcement->target_type) {
            'all' => $this->notificationService->notifyAll($notificationData),
            'department' => $this->notificationService->notifyDepartment((int) $announcement->target_id, $notificationData),
            'position' => $this->notificationService->notifyPosition((int) $announcement->target_id, $notificationData),
            'user' => $this->notificationService->notifyUser(User::findOrFail($announcement->target_id), $notificationData),
            default => null,
        };
    }
}
