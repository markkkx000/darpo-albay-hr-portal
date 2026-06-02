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

        $now = Carbon::now();
        $isPm = $now->hour >= 12;

        if ($attendance) {
            if ($attendance->trashed()) {
                $attendance->restore();
                $attendance->update([
                    'am_clock_in' => $isPm ? null : $now,
                    'am_clock_out' => null,
                    'pm_clock_in' => $isPm ? $now : null,
                    'pm_clock_out' => null,
                ]);

                return $attendance;
            }

            if (! $isPm) {
                if (is_null($attendance->am_clock_in)) {
                    $attendance->update(['am_clock_in' => $now]);

                    return $attendance;
                }
                throw ValidationException::withMessages([
                    'attendance' => 'You are already clocked in for the morning session.',
                ]);
            } else {
                if (is_null($attendance->pm_clock_in)) {
                    $attendance->update(['pm_clock_in' => $now]);

                    return $attendance;
                }
                throw ValidationException::withMessages([
                    'attendance' => 'You have already clocked in for the afternoon session.',
                ]);
            }
        }

        return Attendance::create([
            'user_id' => $user->id,
            'date' => Carbon::today()->toDateString(),
            'am_clock_in' => $isPm ? null : $now,
            'pm_clock_in' => $isPm ? $now : null,
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

        if (! is_null($attendance->pm_clock_in) && is_null($attendance->pm_clock_out)) {
            $attendance->update(['pm_clock_out' => Carbon::now()]);

            return $attendance;
        }

        if (! is_null($attendance->am_clock_in) && is_null($attendance->am_clock_out)) {
            $attendance->update(['am_clock_out' => Carbon::now()]);

            return $attendance;
        }

        if (! is_null($attendance->am_clock_out) && is_null($attendance->pm_clock_in)) {
            throw ValidationException::withMessages([
                'attendance' => 'You cannot clock out for the afternoon until you clock in.',
            ]);
        }

        if (
            (! is_null($attendance->am_clock_out) && ! is_null($attendance->pm_clock_out)) ||
            (is_null($attendance->am_clock_in) && is_null($attendance->am_clock_out) && ! is_null($attendance->pm_clock_out))
        ) {
            throw ValidationException::withMessages([
                'attendance' => 'You have already clocked out for today.',
            ]);
        }

        throw ValidationException::withMessages([
            'attendance' => 'You must clock in before you can clock out.',
        ]);
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
     * Get attendance records for a specific month and year for a user.
     */
    public function getMonthlyHistory(User $user, int $month, int $year)
    {
        return Attendance::where('user_id', $user->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Get all attendance records with potential filtering.
     *
     * @param  array{search?: string, status?: string, user_id?: string, from_date?: string, to_date?: string}  $filters
     */
    public function getAllAttendance(array $filters = [], ?User $user = null): LengthAwarePaginator
    {
        $query = Attendance::with('user')->filter($filters);

        if ($user && ! $user->hasRole(['super_admin', 'hr_admin'])) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('division_id', $user->division_id);
            });
        }

        return $query
            ->orderBy('date', 'desc')
            ->orderBy('am_clock_in', 'desc')
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
            'am_clock_in' => $data['am_clock_in'] ?? null,
            'am_clock_out' => $data['am_clock_out'] ?? null,
            'pm_clock_in' => $data['pm_clock_in'] ?? null,
            'pm_clock_out' => $data['pm_clock_out'] ?? null,
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
            'am_clock_in' => $data['am_clock_in'] ?? null,
            'am_clock_out' => $data['am_clock_out'] ?? null,
            'pm_clock_in' => $data['pm_clock_in'] ?? null,
            'pm_clock_out' => $data['pm_clock_out'] ?? null,
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
