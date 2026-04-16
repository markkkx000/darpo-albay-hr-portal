<?php

namespace App\Modules\Attendance\Services;

use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use Carbon\Carbon;
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
        if ($this->getTodayAttendance($user)) {
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
}
