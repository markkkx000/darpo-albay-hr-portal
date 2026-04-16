<?php

namespace App\Modules\Attendance\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Attendance\Requests\StoreAttendanceRecordRequest;
use App\Modules\Attendance\Requests\UpdateAttendanceRecordRequest;
use App\Modules\Attendance\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AttendanceManagementController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    public function index(Request $request)
    {
        Gate::authorize('attendance.manage');

        return Inertia::render('Modules/Attendance/ManageRecords', [
            'records' => $this->attendanceService->getAllAttendance($request->all()),
            'filters' => $request->only(['user_id', 'date']),
            'employees' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ]);
    }

    public function store(StoreAttendanceRecordRequest $request)
    {
        $this->attendanceService->storeManualRecord($request->validated());

        return back()->with('success', 'Attendance record created successfully.');
    }

    public function update(UpdateAttendanceRecordRequest $request, Attendance $attendance)
    {
        $this->attendanceService->updateRecord($attendance, $request->validated());

        return back()->with('success', 'Attendance record updated successfully.');
    }

    public function destroy(Attendance $attendance)
    {
        Gate::authorize('attendance.delete');

        $this->attendanceService->deleteRecord($attendance);

        return back()->with('success', 'Attendance record deleted successfully.');
    }
}
