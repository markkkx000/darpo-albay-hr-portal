<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\LeaveStatus;
use App\Modules\Leave\Models\LeaveType;
use App\Modules\Leave\Requests\StoreLeaveRequest;
use App\Modules\Leave\Requests\UpdateLeaveRequest;
use App\Modules\Leave\Services\LeaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function __construct(private LeaveService $leaveService) {}

    public function index(Request $request)
    {
        $search = $request->input('search');

        $leaves = LeaveRequest::with(['user', 'leaveType', 'leaveStatus', 'createdBy'])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->latest('start_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Modules/Leave/Index', [
            'leaves' => $leaves,
            'filters' => ['search' => $search],
            'allEmployees' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
        ]);
    }

    public function create()
    {
        $users = User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get();
        $types = LeaveType::where('is_active', true)->get();
        $statuses = LeaveStatus::where('is_active', true)->get();
        $holidays = Holiday::whereYear('date', now()->year)->get();

        return Inertia::render('Modules/Leave/Form', [
            'users' => $users,
            'leaveTypes' => $types,
            'leaveStatuses' => $statuses,
            'holidays' => $holidays,
        ]);
    }

    public function store(StoreLeaveRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            $data['attachment_path'] = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $this->leaveService->storeLeaveRequest($data, $request->user()->id);

        return redirect()->route('leave.index')->with('success', 'Leave request logged successfully.');
    }

    public function edit(LeaveRequest $leaveRequest)
    {
        $users = User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get();
        $types = LeaveType::where('is_active', true)->get();
        $statuses = LeaveStatus::where('is_active', true)->get();
        $holidays = Holiday::whereYear('date', now()->year)->get();

        return Inertia::render('Modules/Leave/Form', [
            'leaveRequest' => $leaveRequest,
            'users' => $users,
            'leaveTypes' => $types,
            'leaveStatuses' => $statuses,
            'holidays' => $holidays,
        ]);
    }

    public function update(UpdateLeaveRequest $request, LeaveRequest $leaveRequest)
    {
        $data = $request->validated();

        if ($request->hasFile('attachment')) {
            if ($leaveRequest->attachment_path) {
                Storage::disk('public')->delete($leaveRequest->attachment_path);
            }
            $data['attachment_path'] = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $this->leaveService->updateLeaveRequest($leaveRequest, $data);

        return redirect()->route('leave.index')->with('success', 'Leave request updated successfully.');
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $this->leaveService->deleteLeaveRequest($leaveRequest);

        return redirect()->route('leave.index')->with('success', 'Leave request deleted.');
    }

    public function calendar(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);
        $userId = $request->input('user_id');

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

        return Inertia::render('Modules/Leave/Calendar', [
            'leaves' => $query->get(),
            'leaveTypes' => LeaveType::all(),
            'users' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
            'currentYear' => $year,
            'currentMonth' => $month,
            'currentUserId' => $userId,
        ]);
    }

    public function settings(Request $request)
    {
        $year = $request->input('year', now()->year);

        return Inertia::render('Modules/Leave/Settings', [
            'holidays' => Holiday::whereYear('date', $year)->orderBy('date')->get(),
            'leaveTypes' => LeaveType::all(),
            'leaveStatuses' => LeaveStatus::all(),
            'currentYear' => $year,
        ]);
    }
}
