<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Leave\Models\TardinessRecord;
use App\Modules\Leave\Requests\UpdateTardinessRequest;
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
                $keywords = explode(' ', $search);
                foreach ($keywords as $keyword) {
                    if (empty($keyword)) {
                        continue;
                    }
                    $query->where(function ($q) use ($keyword) {
                        $q->where('first_name', 'ilike', "%{$keyword}%")
                            ->orWhere('last_name', 'ilike', "%{$keyword}%")
                            ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                    });
                }
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

    public function update(UpdateTardinessRequest $request, $userId)
    {

        TardinessRecord::updateOrCreate(
            [
                'user_id' => $userId,
                'year' => $request->year,
                'month' => $request->month,
            ],
            [
                'tardiness_count' => $request->tardiness_count,
                'undertime_count' => $request->undertime_count,
                'created_by' => $request->user()->id,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Tardiness record updated.']);
        }

        return redirect()->back()->with('success', 'Tardiness record updated.');
    }
}
