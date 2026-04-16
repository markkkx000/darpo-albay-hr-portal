<?php

namespace App\Modules\Attendance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Attendance\Requests\ClockInRequest;
use App\Modules\Attendance\Requests\ClockOutRequest;
use App\Modules\Attendance\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Modules/Attendance/ClockInOut', [
            'attendance' => $this->attendanceService->getTodayAttendance($user),
            'history' => $this->attendanceService->getAttendanceHistory($user),
        ]);
    }

    public function clockIn(ClockInRequest $request): RedirectResponse
    {
        $this->attendanceService->clockIn($request->user());

        return back()->with('success', 'Successfully clocked in.');
    }

    public function clockOut(ClockOutRequest $request): RedirectResponse
    {
        $this->attendanceService->clockOut($request->user());

        return back()->with('success', 'Successfully clocked out.');
    }
}
