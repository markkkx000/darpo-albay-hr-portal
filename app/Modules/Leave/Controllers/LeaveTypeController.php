<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Leave\Models\LeaveType;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:leave_types,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'color_code' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        LeaveType::create($data);

        return redirect()->back()->with('success', 'Leave Type added successfully.');
    }

    public function update(Request $request, LeaveType $leaveType)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:leave_types,name,'.$leaveType->id],
            'description' => ['nullable', 'string', 'max:255'],
            'color_code' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $leaveType->update($data);

        return redirect()->back()->with('success', 'Leave Type updated successfully.');
    }

    public function destroy(LeaveType $leaveType)
    {
        $leaveType->update(['is_active' => false]);

        return redirect()->back()->with('success', 'Leave Type deactivated successfully.');
    }
}
