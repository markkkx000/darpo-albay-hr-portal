<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Models\LeaveStatus;
use App\Modules\Leave\Requests\StoreLeaveStatusRequest;
use App\Modules\Leave\Requests\UpdateLeaveStatusRequest;

class LeaveStatusController extends Controller
{
    public function store(StoreLeaveStatusRequest $request)
    {
        $this->authorize('leave.settings.manage');

        LeaveStatus::create($request->validated());

        return redirect()->back()->with('success', 'Leave Status added successfully.');
    }

    public function update(UpdateLeaveStatusRequest $request, LeaveStatus $leaveStatus)
    {
        $this->authorize('leave.settings.manage');

        $leaveStatus->update($request->validated());

        return redirect()->back()->with('success', 'Leave Status updated successfully.');
    }

    public function destroy(LeaveStatus $leaveStatus)
    {
        $this->authorize('leave.settings.manage');

        $leaveStatus->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Leave Status deactivated successfully.');
    }
}
