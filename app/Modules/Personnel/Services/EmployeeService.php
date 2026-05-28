<?php

namespace App\Modules\Personnel\Services;

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Personnel\Models\Position;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class EmployeeService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Get active employees with filters and pagination.
     */
    public function getEmployees(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['division', 'unit', 'positions', 'appointmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $keywords = explode(' ', $search);
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (empty($keyword)) {
                            continue;
                        }
                        $q->where(function ($inner) use ($keyword) {
                            $inner->where('first_name', 'ilike', "%{$keyword}%")
                                ->orWhere('middle_name', 'ilike', "%{$keyword}%")
                                ->orWhere('last_name', 'ilike', "%{$keyword}%")
                                ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                        });
                    }
                });
            })
            ->when($filters['division_id'] ?? null, function ($query, $divisionId) {
                $query->where('division_id', $divisionId);
            })
            ->when($filters['appointment_status_id'] ?? null, function ($query, $statusId) {
                $query->where('appointment_status_id', $statusId);
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->orderBy('middle_name');

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Get archived (soft-deleted) employees.
     */
    public function getArchivedEmployees(array $filters = []): LengthAwarePaginator
    {
        $query = User::onlyTrashed()
            ->with(['division', 'unit', 'positions', 'appointmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $keywords = explode(' ', $search);
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (empty($keyword)) {
                            continue;
                        }
                        $q->where(function ($inner) use ($keyword) {
                            $inner->where('first_name', 'ilike', "%{$keyword}%")
                                ->orWhere('middle_name', 'ilike', "%{$keyword}%")
                                ->orWhere('last_name', 'ilike', "%{$keyword}%")
                                ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                        });
                    }
                });
            })
            ->orderByDesc('deleted_at');

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Create a new employee.
     */
    public function createEmployee(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $avatarPath = null;
            if (isset($data['profile_picture']) && $data['profile_picture'] instanceof UploadedFile) {
                $avatarPath = $this->storeProfilePicture($data['profile_picture']);
            }

            $user = User::create([
                'employee_number' => $data['employee_number'],
                'first_name' => $data['first_name'],
                'middle_name' => $data['middle_name'] ?? null,
                'last_name' => $data['last_name'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password']), // Password is now provided from the form
                'is_active' => $data['is_active'] ?? true,
                'division_id' => $data['division_id'] ?? null,
                'unit_id' => $data['unit_id'] ?? null,
                'appointment_status_id' => $data['appointment_status_id'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'address' => $data['address'] ?? null,
                'sex' => $data['sex'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'years_in_service' => $data['years_in_service'] ?? null,
                'plantilla_number' => $data['plantilla_number'] ?? null,
                'gsis_bp_number' => $data['gsis_bp_number'] ?? null,
                'philhealth' => $data['philhealth'] ?? null,
                'hdmf_pagibig_no' => $data['hdmf_pagibig_no'] ?? null,
                'tin_number' => $data['tin_number'] ?? null,
                'prc_id_no' => $data['prc_id_no'] ?? null,
                'prc_expiration' => $data['prc_expiration'] ?? null,
                'orig_date_of_appointment' => $data['orig_date_of_appointment'] ?? null,
                'date_of_latest_appointment' => $data['date_of_latest_appointment'] ?? null,
                'date_of_assumption' => $data['date_of_assumption'] ?? null,
                'date_of_separation' => $data['date_of_separation'] ?? null,
                'date_hired_government' => $data['date_hired_government'] ?? null,
                'present_address' => $data['present_address'] ?? null,
                'civil_status' => $data['civil_status'] ?? null,
                'eligibility' => $data['eligibility'] ?? null,
                'fund_code' => $data['fund_code'] ?? null,
                'func_activity_code' => $data['func_activity_code'] ?? null,
                'item_number' => $data['item_number'] ?? null,
                'office_per_appointment' => $data['office_per_appointment'] ?? null,
                'plantilla_position' => $data['plantilla_position'] ?? null,
                'lbp_account_number' => $data['lbp_account_number'] ?? null,
                'profile_picture' => $avatarPath,
                'salary_grade' => $data['salary_grade'] ?? null,
                'salary_step' => $data['salary_step'] ?? null,
                'monthly_salary' => $data['monthly_salary'] ?? null,
            ]);

            $user->assignRole('employee');

            if (isset($data['positions']) && is_array($data['positions'])) {
                $positionIdsToSync = [];
                foreach ($data['positions'] as $posData) {
                    if (! empty($posData['id']) && is_numeric($posData['id'])) {
                        $positionId = $posData['id'];
                    } elseif (! empty($posData['name'])) {
                        $newPosition = Position::create([
                            'name' => $posData['name'],
                            'division_id' => $data['division_id'],
                            'is_active' => true,
                        ]);
                        $positionId = $newPosition->id;
                    } else {
                        continue;
                    }
                    $positionIdsToSync[$positionId] = ['is_primary' => $posData['is_primary'] ?? false];
                }
                $user->positions()->sync($positionIdsToSync);
            }

            $this->sendDefaultPasswordNotification($user);

            return $user;
        });
    }

    /**
     * Update an employee.
     */
    public function updateEmployee(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            if (isset($data['profile_picture'])) {
                if ($data['profile_picture'] instanceof UploadedFile) {
                    $this->deleteProfilePicture($user->profile_picture);
                    $data['profile_picture'] = $this->storeProfilePicture($data['profile_picture']);
                } else {
                    unset($data['profile_picture']);
                }
            }

            if (empty($data['password'])) {
                unset($data['password']);
            } else {
                $data['password'] = Hash::make($data['password']);
            }

            $user->update($data);

            if (isset($data['positions']) && is_array($data['positions'])) {
                $positionIdsToSync = [];
                foreach ($data['positions'] as $posData) {
                    if (! empty($posData['id']) && is_numeric($posData['id'])) {
                        $positionId = $posData['id'];
                    } elseif (! empty($posData['name'])) {
                        $newPosition = Position::create([
                            'name' => $posData['name'],
                            'division_id' => $data['division_id'] ?? $user->division_id,
                            'is_active' => true,
                        ]);
                        $positionId = $newPosition->id;
                    } else {
                        continue;
                    }
                    $positionIdsToSync[$positionId] = ['is_primary' => $posData['is_primary'] ?? false];
                }
                $user->positions()->sync($positionIdsToSync);
            }

            return $user;
        });
    }

    /**
     * Reset an employee's password to a random string.
     */
    public function resetPassword(User $user, string $newPassword): void
    {
        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        $this->sendDefaultPasswordNotification($user);
    }

    /**
     * Send the default password nudge notification.
     */
    protected function sendDefaultPasswordNotification(User $user): void
    {
        $this->notificationService->notifyUser($user, [
            'type' => 'system',
            'subtype' => 'default_password',
            'title' => 'Please change your default password',
            'body' => 'Your account was created or reset with a temporary password. Please change it immediately in your profile settings.',
            'from' => 'System',
            'priority' => 'high',
            'dismissible' => false,
            'url' => '/settings/security',
        ]);
    }

    /**
     * Soft delete an employee.
     */
    public function deleteEmployee(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Restore a soft-deleted employee.
     */
    public function restoreEmployee(int $id): bool
    {
        $user = User::onlyTrashed()->findOrFail($id);

        return $user->restore();
    }

    /**
     * Store and optimize the profile picture.
     */
    public function storeProfilePicture(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        // 1. Load image resource
        $image = null;
        if ($mime === 'image/jpeg' || $extension === 'jpg' || $extension === 'jpeg') {
            $image = @imagecreatefromjpeg($file->getRealPath());
            // Read EXIF orientation for JPEG
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

        // 2. Resize maintaining aspect ratio (max 300px)
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);
        $maxSize = 300;

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
        $filename = uniqid('avatar_').'.webp';
        $path = 'avatars/'.$filename;

        ob_start();
        imagewebp($image, null, 80);
        $imageContent = ob_get_clean();
        imagedestroy($image);

        Storage::put($path, $imageContent);

        return $path;
    }

    public function logPromotion(User $user, array $data): void
    {
        DB::transaction(function () use ($user, $data) {
            $user->promotionHistories()->create([
                'position_name' => $data['position_name'],
                'promotion_date' => $data['promotion_date'],
            ]);

            if (empty($user->date_of_latest_appointment) || $data['promotion_date'] >= $user->date_of_latest_appointment) {
                $user->update([
                    'date_of_latest_appointment' => $data['promotion_date']
                ]);
            }
        });
    }

    /**
     * Delete the profile picture from storage if it exists.
     */
    public function deleteProfilePicture(?string $path): void
    {
        if (! $path) {
            return;
        }

        $relativePath = $path;
        if (str_starts_with($relativePath, '/storage/')) {
            $relativePath = substr($relativePath, 9);
        } elseif (str_starts_with($relativePath, 'storage/')) {
            $relativePath = substr($relativePath, 8);
        }

        try {
            if (Storage::exists($relativePath)) {
                Storage::delete($relativePath);
            }
        } catch (\Exception $e) {
            // S3/R2 throws a 403 Forbidden instead of returning false if a file doesn't exist
            // and the token lacks ListBucket permissions. We can safely ignore this.
        }
    }
}
