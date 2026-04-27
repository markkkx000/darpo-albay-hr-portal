<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Leave\Models\TardinessRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TardinessController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->input('year', now()->year);
        $search = $request->input('search');

        $users = User::with(['tardinessRecords' => function ($query) use ($year) {
            $query->where('year', $year);
        }])
        ->when($search, function ($query) use ($search) {
            $query->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%")
                ->orWhere('employee_number', 'like', "%{$search}%");
        })
        ->orderBy('last_name')
        ->paginate(15)
        ->withQueryString();

        return Inertia::render('Modules/Leave/Tardiness', [
            'users' => $users,
            'currentYear' => $year,
            'filters' => ['search' => $search],
            'allEmployees' => User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get(),
        ]);
    }

    public function update(Request $request, $userId)
    {
        $request->validate([
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
            'tardiness_count' => ['required', 'integer', 'min:0'],
            'tardiness_minutes' => ['required', 'integer', 'min:0'],
            'undertime_count' => ['required', 'integer', 'min:0'],
            'undertime_minutes' => ['required', 'integer', 'min:0'],
        ]);

        TardinessRecord::updateOrCreate(
            [
                'user_id' => $userId,
                'year' => $request->year,
                'month' => $request->month,
            ],
            [
                'tardiness_count' => $request->tardiness_count,
                'tardiness_minutes' => $request->tardiness_minutes,
                'undertime_count' => $request->undertime_count,
                'undertime_minutes' => $request->undertime_minutes,
                'created_by' => $request->user()->id,
            ]
        );

        return redirect()->back()->with('success', 'Tardiness record updated.');
    }
}
