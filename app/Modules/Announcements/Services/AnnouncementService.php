<?php

namespace App\Modules\Announcements\Services;

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use DomainException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $data['content'] = clean($data['content']);

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

        if (isset($data['content'])) {
            $data['content'] = clean($data['content']);
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

        // Division head restriction
        if ($actor->hasRole('division_head')) {
            if ($announcement->target_type !== 'division' || (int) $announcement->target_id !== (int) $actor->division_id) {
                throw new HttpException(403, 'Division heads can only publish announcements to their own division.');
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
    public function getAllForHR(User $user): LengthAwarePaginator
    {
        return Announcement::with('author')
            ->when($user->hasRole('division_head'), function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('posted_by', $user->id)
                        ->orWhere(function ($q2) use ($user) {
                            $q2->where('target_type', 'division')
                                ->where('target_id', $user->division_id);
                        });
                });
            })
            ->latest()
            ->paginate(15);
    }

    /**
     * Dispatch notifications based on announcement targeting.
     */
    protected function dispatchNotifications(Announcement $announcement): void
    {
        $plainExcerpt = mb_substr(strip_tags($announcement->content), 0, 200);

        $notificationData = [
            'title' => $announcement->title,
            'message' => $plainExcerpt ?: 'A new announcement has been posted.',
            'body' => $announcement->content,
            'url' => route('announcements.show', $announcement->id, false),
            'type' => 'announcement',
            'subtype' => 'new_announcement',
            'priority' => $announcement->priority,
        ];

        match ($announcement->target_type) {
            'all' => $this->notificationService->notifyAll($notificationData),
            'division' => $this->notificationService->notifyDivision((int) $announcement->target_id, $notificationData),
            'position' => $this->notificationService->notifyPosition((int) $announcement->target_id, $notificationData),
            'user' => $this->notificationService->notifyUser(User::findOrFail($announcement->target_id), $notificationData),
            default => null,
        };
    }

    /**
     * Store and optimize an announcement asset.
     */
    public function storeAsset(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        // 1. Load image resource
        $image = null;
        if ($mime === 'image/jpeg' || $extension === 'jpg' || $extension === 'jpeg') {
            $image = @imagecreatefromjpeg($file->getRealPath());
            if ($image && function_exists('exif_read_data')) {
                try {
                    $exif = @exif_read_data($file->getRealPath());
                    if ($exif && isset($exif['Orientation'])) {
                        switch ($exif['Orientation']) {
                            case 3:
                                $image = imagerotate($image, 180, 0);
                                break;
                            case 6:
                                $image = imagerotate($image, -90, 0);
                                break;
                            case 8:
                                $image = imagerotate($image, 90, 0);
                                break;
                        }
                    }
                } catch (\Exception $e) {
                    // Ignore EXIF errors
                }
            }
        } elseif ($mime === 'image/png' || $extension === 'png') {
            $image = @imagecreatefrompng($file->getRealPath());
            if ($image) {
                imagealphablending($image, false);
                imagesavealpha($image, true);
            }
        } elseif ($mime === 'image/webp' || $extension === 'webp') {
            $image = @imagecreatefromwebp($file->getRealPath());
        }

        if (! $image) {
            throw new \InvalidArgumentException('Unsupported or invalid image format.');
        }

        // 2. Resize maintaining aspect ratio (max 1200px width)
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);
        $maxWidth = 1200;

        if ($origWidth > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round(($origHeight / $origWidth) * $maxWidth);

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
            if ($mime === 'image/png' || $extension === 'png') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
            } else {
                $transparent = imagecolorallocatealpha($resizedImage, 0, 0, 0, 127);
                imagefill($resizedImage, 0, 0, $transparent);
                imagesavealpha($resizedImage, true);
            }

            imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($image);
            $image = $resizedImage;
        }

        // 3. Save as WebP
        $filename = uniqid('asset_').'.webp';
        $year = date('Y');
        $month = date('m');
        $path = "announcements/assets/{$year}/{$month}/{$filename}";

        ob_start();
        imagewebp($image, null, 80);
        $imageContent = ob_get_clean();
        imagedestroy($image);

        Storage::put($path, $imageContent);

        return $path;
    }
}
