<?php

namespace App\Modules\Attendance\Services;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function getTodayAttendance(User $user): ?Attendance
    {
        return Attendance::where('user_id', $user->id)
            ->whereDate('date', Carbon::today())
            ->first();
    }

    public function clockIn(User $user): Attendance
    {
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', Carbon::today())
            ->withTrashed()
            ->first();

        if ($attendance) {
            if ($attendance->trashed()) {
                $attendance->restore();
                $attendance->update([
                    'clock_in' => Carbon::now(),
                    'clock_out' => null,
                ]);

                return $attendance;
            }

            throw ValidationException::withMessages([
                'attendance' => 'You have already clocked in for today.',
            ]);
        }

        return Attendance::create([
            'user_id' => $user->id,
            'date' => Carbon::today()->toDateString(),
            'clock_in' => Carbon::now(),
        ]);
    }

    public function clockOut(User $user): Attendance
    {
        $attendance = $this->getTodayAttendance($user);

        if (! $attendance) {
            throw ValidationException::withMessages([
                'attendance' => 'You must clock in before you can clock out.',
            ]);
        }

        if ($attendance->clock_out) {
            throw ValidationException::withMessages([
                'attendance' => 'You have already clocked out for today.',
            ]);
        }

        $attendance->update([
            'clock_out' => Carbon::now(),
        ]);

        return $attendance;
    }

    /**
     * Get recent attendance history for a user.
     */
    public function getAttendanceHistory(User $user, int $limit = 7)
    {
        return Attendance::where('user_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get all attendance records with potential filtering.
     *
     * @param  array{search?: string, status?: string, user_id?: string, from_date?: string, to_date?: string}  $filters
     */
    public function getAllAttendance(array $filters = []): LengthAwarePaginator
    {
        return Attendance::with('user')
            ->filter($filters)
            ->orderBy('date', 'desc')
            ->orderBy('clock_in', 'desc')
            ->paginate(15)
            ->withQueryString();
    }

    /**
     * Manually store an attendance record.
     */
    public function storeManualRecord(array $data): Attendance
    {
        // Unique constraint user_id + date check (including trashed)
        if (Attendance::where('user_id', $data['user_id'])->whereDate('date', $data['date'])->withTrashed()->exists()) {
            throw ValidationException::withMessages([
                'user_id' => 'This employee already has an attendance record (active or archived) for this date.',
            ]);
        }

        return Attendance::create([
            'user_id' => $data['user_id'],
            'date' => $data['date'],
            'clock_in' => $data['clock_in'],
            'clock_out' => $data['clock_out'] ?? null,
        ]);
    }

    /**
     * Update an attendance record.
     */
    public function updateRecord(Attendance $attendance, array $data): Attendance
    {
        if (isset($data['date']) && $data['date'] !== $attendance->date) {
            $exists = Attendance::where('user_id', $attendance->user_id)
                ->whereDate('date', $data['date'])
                ->where('id', '!=', $attendance->id)
                ->withTrashed()
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'date' => 'This employee already has an attendance record (active or archived) for this date.',
                ]);
            }
        }

        $attendance->update([
            'date' => $data['date'] ?? $attendance->date,
            'clock_in' => $data['clock_in'],
            'clock_out' => $data['clock_out'] ?? null,
        ]);

        return $attendance;
    }

    /**
     * Delete an attendance record (soft delete).
     */
    public function deleteRecord(Attendance $attendance): bool
    {
        return $attendance->delete();
    }

    /**
     * Restore a soft-deleted attendance record.
     */
    public function restoreRecord(int $id): bool
    {
        $attendance = Attendance::onlyTrashed()->findOrFail($id);

        return $attendance->restore();
    }
}
