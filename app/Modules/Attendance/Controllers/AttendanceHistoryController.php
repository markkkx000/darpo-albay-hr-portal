<?php

namespace App\Modules\Attendance\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Attendance\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceHistoryController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $month = (int) $request->query('month', Carbon::now()->month);
        $year = (int) $request->query('year', Carbon::now()->year);

        // Clamp values to valid ranges
        $month = max(1, min(12, $month));
        $year = max(2000, min((int) Carbon::now()->year, $year));

        return Inertia::render('Modules/Attendance/HistoryIndex', [
            'records' => $this->attendanceService->getMonthlyHistory($user, $month, $year),
            'month' => $month,
            'year' => $year,
        ]);
    }
}
