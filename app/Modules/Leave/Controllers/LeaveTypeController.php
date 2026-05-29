<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Models\LeaveType;
use App\Modules\Leave\Requests\StoreLeaveTypeRequest;
use App\Modules\Leave\Requests\UpdateLeaveTypeRequest;

class LeaveTypeController extends Controller
{
    public function store(StoreLeaveTypeRequest $request)
    {
        $this->authorize('leave.settings.manage');

        LeaveType::create($request->validated());

        return redirect()->back()->with('success', 'Leave Type added successfully.');
    }

    public function update(UpdateLeaveTypeRequest $request, LeaveType $leaveType)
    {
        $this->authorize('leave.settings.manage');

        $leaveType->update($request->validated());

        return redirect()->back()->with('success', 'Leave Type updated successfully.');
    }

    public function destroy(LeaveType $leaveType)
    {
        $this->authorize('leave.settings.manage');

        $leaveType->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Leave Type deactivated successfully.');
    }
}
