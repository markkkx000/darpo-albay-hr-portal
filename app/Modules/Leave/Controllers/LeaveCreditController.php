<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveCreditController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->input('year', now()->year);
        $search = $request->input('search');

        $users = User::with(['leaveCredits' => function ($query) use ($year) {
            $query->where('year', $year);
        }])
            ->when($search, function ($query) use ($search) {
                $keywords = explode(' ', $search);
                foreach ($keywords as $keyword) {
                    if (empty($keyword)) {
                        continue;
                    }
                    $query->where(function ($q) use ($keyword) {
                        $q->where('first_name', 'like', "%{$keyword}%")
                            ->orWhere('last_name', 'like', "%{$keyword}%")
                            ->orWhere('employee_number', 'like', "%{$keyword}%");
                    });
                }
            })
            ->orderBy('last_name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Modules/Leave/Credits', [
            'users' => $users,
            'leaveTypes' => LeaveType::where('is_active', true)->get(),
            'currentYear' => $year,
            'filters' => ['search' => $search],
            'allEmployees' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'year' => ['required', 'integer'],
            'earned' => ['required', 'numeric', 'min:0'],
            'used' => ['required', 'numeric', 'min:0'],
        ]);

        $credit = LeaveCredit::updateOrCreate(
            [
                'user_id' => $request->user_id,
                'leave_type_id' => $request->leave_type_id,
                'year' => $request->year,
            ],
            [
                'earned' => $request->earned,
                'used' => $request->used,
                'balance' => $request->earned - $request->used,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Leave credits updated.']);
        }

        return redirect()->back()->with('success', 'Leave credits updated.');
    }
}
