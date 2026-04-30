<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Models\LeaveStatus;
use Illuminate\Http\Request;

class LeaveStatusController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:leave_statuses,name'],
            'is_active' => ['boolean'],
        ]);

        LeaveStatus::create($data);

        return redirect()->back()->with('success', 'Leave Status added successfully.');
    }

    public function update(Request $request, LeaveStatus $leaveStatus)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:leave_statuses,name,'.$leaveStatus->id],
            'is_active' => ['boolean'],
        ]);

        $leaveStatus->update($data);

        return redirect()->back()->with('success', 'Leave Status updated successfully.');
    }

    public function destroy(LeaveStatus $leaveStatus)
    {
        $leaveStatus->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Leave Status deactivated successfully.');
    }
}
