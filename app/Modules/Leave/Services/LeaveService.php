<?php

namespace App\Modules\Leave\Services;

use App\Models\User;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class LeaveService
{
    /**
     * Get paginated leave requests with filters
     */
    public function getPaginatedLeaves(array $filters, ?User $user = null): LengthAwarePaginator
    {
        $viewMode = $filters['view'] ?? 'mine';
        $search = $filters['search'] ?? null;
        $sort = $filters['sort'] ?? 'desc';
        $leaveTypeId = $filters['leave_type_id'] ?? null;
        $statusId = $filters['status_id'] ?? null;
        $approvedById = $filters['approved_by_id'] ?? null;

        $query = LeaveRequest::with(['user', 'leaveType', 'leaveStatus', 'createdBy', 'approvedBy']);

        if ($viewMode === 'mine' && $user) {
            $query->where('user_id', $user->id);
        }

        $query->when($search, function ($q) use ($search) {
            $keywords = explode(' ', $search);
            $q->whereHas('user', function ($uq) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (empty($keyword)) {
                        continue;
                    }
                    $uq->where(function ($inner) use ($keyword) {
                        $inner->where('first_name', 'ilike', "%{$keyword}%")
                            ->orWhere('last_name', 'ilike', "%{$keyword}%")
                            ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                    });
                }
            });
        });

        $query->when($leaveTypeId, function ($q) use ($leaveTypeId) {
            $q->where('leave_type_id', $leaveTypeId);
        });

        $query->when($statusId, function ($q) use ($statusId) {
            $q->where('leave_status_id', $statusId);
        });

        $query->when($approvedById, function ($q) use ($approvedById) {
            $q->where('approved_by_id', $approvedById);
        });

        if ($sort === 'asc') {
            $query->oldest('start_date');
        } else {
            $query->latest('start_date');
        }

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Get leaves for calendar view
     */
    public function getCalendarLeaves(int $year, int $month, ?int $userId = null): Collection
    {
        $query = LeaveRequest::with(['user', 'leaveType'])
            ->where(function ($q) use ($year, $month) {
                $q->where(function ($q1) use ($year, $month) {
                    $q1->whereYear('start_date', $year)->whereMonth('start_date', $month);
                })->orWhere(function ($q2) use ($year, $month) {
                    $q2->whereYear('end_date', $year)->whereMonth('end_date', $month);
                });
            });

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->get();
    }

    /**
     * Store a new leave request
     */
    public function storeLeaveRequest(array $data, int $createdBy): LeaveRequest
    {
        $this->validateOverlap($data);
        $this->validateHalfDay($data['start_date'], $data['end_date'], $data['days_requested']);

        $data['created_by'] = $createdBy;

        return DB::transaction(function () use ($data) {
            $leaveRequest = LeaveRequest::create($data);

            $this->handleCreditDeduction($leaveRequest);

            return $leaveRequest;
        });
    }

    /**
     * Update an existing leave request
     */
    public function updateLeaveRequest(LeaveRequest $leaveRequest, array $data): LeaveRequest
    {
        $this->validateOverlap($data, $leaveRequest->id);
        $this->validateHalfDay($data['start_date'], $data['end_date'], $data['days_requested']);

        return DB::transaction(function () use ($leaveRequest, $data) {
            $this->handleCreditRestoration($leaveRequest);

            $leaveRequest->update($data);

            // Refresh to get new relations if any changed
            $leaveRequest->refresh();
            $this->handleCreditDeduction($leaveRequest);

            return $leaveRequest;
        });
    }

    /**
     * Delete a leave request
     */
    public function deleteLeaveRequest(LeaveRequest $leaveRequest): void
    {
        DB::transaction(function () use ($leaveRequest) {
            $this->handleCreditRestoration($leaveRequest);
            $leaveRequest->delete();
        });
    }

    /**
     * Validate overlapping leave requests
     */
    public function validateOverlap(array $data, ?int $ignoreId = null): void
    {
        $userId = $data['user_id'];

        $requestedDates = [];
        if (! empty($data['specific_dates'])) {
            $requestedDates = $data['specific_dates'];
        } else {
            $current = Carbon::parse($data['start_date']);
            $end = Carbon::parse($data['end_date']);
            while ($current <= $end) {
                $requestedDates[] = $current->format('Y-m-d');
                $current->addDay();
            }
        }

        if (empty($requestedDates)) {
            return;
        }

        $minDate = min($requestedDates);
        $maxDate = max($requestedDates);

        $existingLeaves = LeaveRequest::where('user_id', $userId)
            ->where(function ($q) use ($minDate, $maxDate) {
                $q->where('start_date', '<=', $maxDate)
                    ->where('end_date', '>=', $minDate);
            })
            ->whereHas('leaveStatus', function ($q) {
                $q->where('name', '!=', 'Cancelled');
            });

        if ($ignoreId) {
            $existingLeaves->where('id', '!=', $ignoreId);
        }

        $existingLeaves = $existingLeaves->get();

        foreach ($existingLeaves as $leave) {
            $existingDates = [];
            if (! empty($leave->specific_dates)) {
                $existingDates = $leave->specific_dates;
            } else {
                $current = Carbon::parse($leave->start_date);
                $end = Carbon::parse($leave->end_date);
                while ($current <= $end) {
                    $existingDates[] = $current->format('Y-m-d');
                    $current->addDay();
                }
            }

            $overlap = array_intersect($requestedDates, $existingDates);
            if (count($overlap) > 0) {
                $conflictDate = Carbon::parse(reset($overlap))->format('M d, Y');
                throw ValidationException::withMessages([
                    'dates' => "The employee already has an active leave request on {$conflictDate}.",
                ]);
            }
        }
    }

    /**
     * Validate half-day logic
     */
    public function validateHalfDay(string $startDate, string $endDate, float|int $daysRequested): void
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $totalCalendarDays = $start->diffInDays($end) + 1;

        if ($daysRequested > $totalCalendarDays) {
            throw ValidationException::withMessages([
                'days_requested' => "Days requested ({$daysRequested}) cannot exceed the total calendar days ({$totalCalendarDays}) between the start and end dates.",
            ]);
        }
    }

    /**
     * Calculate working days automatically (excluding weekends and holidays)
     */
    public function calculateWorkingDays(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $days = 0;

        $holidays = Holiday::whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->pluck('date')
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
            ->toArray();

        $current = $start->copy();
        while ($current <= $end) {
            if (! $current->isWeekend() && ! in_array($current->format('Y-m-d'), $holidays)) {
                $days++;
            }
            $current->addDay();
        }

        return $days;
    }

    /**
     * Deduct credits if approved
     */
    protected function handleCreditDeduction(LeaveRequest $leaveRequest): void
    {

        if ($leaveRequest->leaveStatus && $leaveRequest->leaveStatus->name === 'Approved') {
            $year = Carbon::parse($leaveRequest->start_date)->year;

            $credit = LeaveCredit::firstOrCreate(
                [
                    'user_id' => $leaveRequest->user_id,
                    'leave_type_id' => $leaveRequest->leave_type_id,
                    'year' => $year,
                ],
                [
                    'earned' => 0,
                    'used' => 0,
                    'balance' => 0,
                ]
            );

            $credit->used += $leaveRequest->days_with_pay;
            $credit->balance = $credit->earned - $credit->used;
            $credit->save();
        }
    }

    /**
     * Restore credits if updating/deleting an approved leave
     */
    protected function handleCreditRestoration(LeaveRequest $leaveRequest): void
    {

        $originalStatus = $leaveRequest->leaveStatus;
        if ($originalStatus && $originalStatus->name === 'Approved') {
            $year = Carbon::parse($leaveRequest->getOriginal('start_date'))->year;
            /** @var LeaveCredit|null $credit */
            $credit = LeaveCredit::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveRequest->getOriginal('leave_type_id'))
                ->where('year', $year)
                ->first();

            if ($credit) {
                $credit->used -= $leaveRequest->getOriginal('days_with_pay');
                $credit->balance = $credit->earned - $credit->used;
                $credit->save();
            }
        }
    }

    /**
     * Store and optimize a leave request attachment.
     */
    public function storeAttachment(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();
        $year = now()->format('Y');
        $month = now()->format('m');
        $uniqid = uniqid('attachment_');

        // Check if PDF
        if ($mime === 'application/pdf' || $extension === 'pdf') {
            $filename = "{$uniqid}.pdf";
            $path = "leaves/attachments/{$year}/{$month}/{$filename}";
            Storage::putFileAs("leaves/attachments/{$year}/{$month}", $file, $filename);

            return Storage::url($path);
        }

        // Handle Image
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

        // Resize maintaining aspect ratio (max 1200px)
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);
        $maxSize = 1200;

        if ($origWidth > $maxSize || $origHeight > $maxSize) {
            if ($origWidth > $origHeight) {
                $newWidth = $maxSize;
                $newHeight = (int) round(($origHeight / $origWidth) * $maxSize);
            } else {
                $newHeight = $maxSize;
                $newWidth = (int) round(($origWidth / $origHeight) * $maxSize);
            }

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
            if ($mime === 'image/png' || $extension === 'png') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                $transparent = imagecolorallocatealpha($resizedImage, 0, 0, 0, 127);
                imagefill($resizedImage, 0, 0, $transparent);
            } else {
                $white = imagecolorallocate($resizedImage, 255, 255, 255);
                imagefill($resizedImage, 0, 0, $white);
            }

            imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
            imagedestroy($image);
            $image = $resizedImage;
        }

        $filename = "{$uniqid}.webp";
        $path = "leaves/attachments/{$year}/{$month}/{$filename}";

        ob_start();
        imagewebp($image, null, 80);
        $imageContent = ob_get_clean();
        imagedestroy($image);

        Storage::put($path, $imageContent);

        return Storage::url($path);
    }

    /**
     * Delete a leave request attachment.
     */
    public function deleteAttachment(string $url): bool
    {
        $path = $this->extractRelativePath($url);

        if (! $path || ! str_starts_with($path, 'leaves/attachments/')) {
            return false;
        }

        try {
            if (Storage::exists($path)) {
                return Storage::delete($path);
            }
        } catch (\Exception $e) {
            // S3 throws exception if file is not found, ignore
        }

        return false;
    }

    /**
     * Extract relative S3 path from full URL.
     */
    protected function extractRelativePath(string $url): ?string
    {
        $s3Url = config('filesystems.disks.s3.url');

        if ($s3Url && str_starts_with($url, $s3Url)) {
            return ltrim(substr($url, strlen($s3Url)), '/');
        }

        // Fallback: parse URL and search for "leaves/attachments/"
        $pathIndex = strpos($url, 'leaves/attachments/');
        if ($pathIndex !== false) {
            return substr($url, $pathIndex);
        }

        return null;
    }
}
