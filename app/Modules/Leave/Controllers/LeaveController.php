<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Models\User;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\LeaveStatus;
use App\Modules\Leave\Models\LeaveType;
use App\Modules\Leave\Requests\StoreLeaveRequest;
use App\Modules\Leave\Requests\UpdateLeaveRequest;
use App\Modules\Leave\Services\LeaveService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function __construct(private LeaveService $leaveService) {}

    public function index(Request $request)
    {
        $canEncode = $request->user()->can('leave.manage');
        $viewMode = $request->input('view', $canEncode ? 'all' : 'mine');

        // Force 'mine' view if user cannot encode
        if (! $canEncode) {
            $viewMode = 'mine';
        }

        $filters = [
            'search' => $request->input('search'),
            'view' => $viewMode,
            'sort' => $request->input('sort', 'desc'),
            'leave_type_id' => $request->input('leave_type_id'),
            'status_id' => $request->input('status_id'),
            'approved_by_id' => $request->input('approved_by_id'),
            'archived' => $request->boolean('archived', false),
        ];

        $leaves = $this->leaveService->getPaginatedLeaves($filters, $request->user());

        return Inertia::render('Modules/Leave/Index', [
            'leaves' => LeaveRequestResource::collection($leaves),
            'filters' => $filters,
            'allEmployees' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
            'leaveTypes' => LeaveType::all(),
            'leaveStatuses' => LeaveStatus::all(),
        ]);
    }

    public function show(LeaveRequest $leaveRequest)
    {
        $user = request()->user();
        if (! $user->can('leave.manage') && $leaveRequest->user_id !== $user->id) {
            abort(403, 'Unauthorized to view this leave request.');
        }

        $leaveRequest->load(['user', 'leaveType', 'leaveStatus', 'createdBy', 'approvedBy']);

        return Inertia::render('Modules/Leave/Show', [
            'leaveRequest' => new LeaveRequestResource($leaveRequest),
        ]);
    }

    public function create()
    {
        $this->authorize('leave.manage');

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

        $this->leaveService->storeLeaveRequest($data, $request->user()->id);

        return redirect()->route('leave.index')->with('success', 'Leave request logged successfully.');
    }

    public function edit(LeaveRequest $leaveRequest)
    {
        $this->authorize('leave.manage');

        $users = User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get();
        $types = LeaveType::where('is_active', true)->get();
        $statuses = LeaveStatus::where('is_active', true)->get();
        $holidays = Holiday::whereYear('date', now()->year)->get();

        return Inertia::render('Modules/Leave/Form', [
            'leaveRequest' => new LeaveRequestResource($leaveRequest),
            'users' => $users,
            'leaveTypes' => $types,
            'leaveStatuses' => $statuses,
            'holidays' => $holidays,
        ]);
    }

    public function update(UpdateLeaveRequest $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('leave.manage');

        $data = $request->validated();

        $this->leaveService->updateLeaveRequest($leaveRequest, $data);

        return redirect()->route('leave.index')->with('success', 'Leave request updated successfully.');
    }

    public function destroy(LeaveRequest $leaveRequest)
    {
        $this->authorize('leave.manage');

        $this->leaveService->deleteLeaveRequest($leaveRequest);

        return redirect()->route('leave.index')->with('success', 'Leave request archived successfully.');
    }

    public function restore(int $id)
    {
        $this->authorize('leave.manage');

        $leaveRequest = LeaveRequest::withTrashed()->findOrFail($id);
        $this->leaveService->restoreLeaveRequest($leaveRequest);

        return redirect()->route('leave.index')->with('success', 'Leave request restored successfully.');
    }

    public function calendar(Request $request)
    {
        $this->authorize('leave.manage');

        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);
        $userId = $request->input('user_id') ? (int) $request->input('user_id') : null;

        return Inertia::render('Modules/Leave/Calendar', [
            'leaves' => $this->leaveService->getCalendarLeaves($year, $month, $userId),
            'leaveTypes' => LeaveType::all(),
            'users' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
            'holidays' => Holiday::whereYear('date', $year)->whereMonth('date', $month)->get(),
            'currentYear' => $year,
            'currentMonth' => $month,
            'currentUserId' => $userId,
        ]);
    }

    public function settings(Request $request)
    {
        $this->authorize('leave.settings.manage');

        $year = $request->input('year', now()->year);

        return Inertia::render('Modules/Leave/Settings', [
            'holidays' => Holiday::whereYear('date', $year)->orderBy('date')->get(),
            'leaveTypes' => LeaveType::all(),
            'leaveStatuses' => LeaveStatus::all(),
            'currentYear' => $year,
        ]);
    }

    /**
     * Upload an attachment and optimize if it is an image.
     */
    public function uploadAttachment(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpeg,png,webp', 'max:10240'],
        ]);

        try {
            $url = $this->leaveService->storeAttachment($request->file('file'));

            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Delete an uploaded attachment.
     */
    public function deleteAttachment(Request $request)
    {
        $request->validate([
            'url' => ['required', 'string'],
        ]);

        $url = $request->input('url');

        // Security check: ensure path belongs to leaves/attachments
        if (! str_contains($url, 'leaves/attachments/')) {
            return response()->json(['error' => 'Invalid attachment path.'], 403);
        }

        // Ownership check
        if (! Auth::user()->can('leave.manage')) {
            $leaveReq = LeaveRequest::whereJsonContains('attachments', $url)->first();
            if ($leaveReq && $leaveReq->user_id !== Auth::id()) {
                return response()->json(['error' => 'Unauthorized to delete this attachment.'], 403);
            }
        }

        $deleted = $this->leaveService->deleteAttachment($url);

        if ($deleted) {
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'File not found or already deleted.'], 404);
    }

    /**
     * Get the salary for a specific user.
     * Accessible only by HR (leave.manage).
     */
    public function getSalary(User $user)
    {
        $this->authorize('leave.manage');

        return response()->json([
            'salary' => $user->monthly_salary,
        ]);
    }
}
