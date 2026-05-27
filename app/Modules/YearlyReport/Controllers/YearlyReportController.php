<?php

namespace App\Modules\YearlyReport\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Modules\YearlyReport\Exports\YearlyReportExport;

class YearlyReportController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('personnel.view');

        $year = $request->query('year', Carbon::now()->year);
        $filter = $request->query('filter', 'all');

        $results = $this->calculateMilestones($year, $filter);

        return Inertia::render('Modules/YearlyReport/Index', [
            'results' => $results,
            'year' => (int) $year,
            'filter' => $filter,
        ]);
    }

    public function export(Request $request)
    {
        $this->authorize('personnel.view');
        
        $year = $request->query('year', Carbon::now()->year);
        $filter = $request->query('filter', 'all');

        $results = $this->calculateMilestones($year, $filter);
        
        return Excel::download(new YearlyReportExport($results, $year), "Yearly_Report_{$year}.xlsx");
    }

    private function calculateMilestones($year, $filter)
    {
        $employees = User::with(['division'])->where('is_active', true)->get();
        $results = [];

        foreach ($employees as $emp) {
            // Loyalty Milestones
            if ($filter === 'all' || $filter === 'loyalty') {
                $startDate = $emp->date_hired_government ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
                if ($startDate) {
                    $startYear = Carbon::parse($startDate)->year;
                    $m = $year - $startYear;
                    if ($m >= 10 && ($m === 10 || ($m - 10) % 5 === 0)) {
                        $date = Carbon::parse($startDate)->addYears($m)->format('Y-m-d');
                        $results[] = [
                            'emp_id' => $emp->id,
                            'name' => $emp->name,
                            'employee_number' => $emp->employee_number,
                            'division' => $emp->division ? $emp->division->name : '—',
                            'milestone' => $m,
                            'type' => 'loyalty',
                            'date' => $date,
                        ];
                    }
                }
            }

            // Salary Milestones
            if ($filter === 'all' || $filter === 'salary') {
                $baseDate = $emp->date_of_latest_appointment ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
                if ($baseDate) {
                    $baseYear = Carbon::parse($baseDate)->year;
                    $mSal = $year - $baseYear;
                    if ($mSal >= 3 && $mSal % 3 === 0) {
                        $date = Carbon::parse($baseDate)->addYears($mSal)->format('Y-m-d');
                        $results[] = [
                            'emp_id' => $emp->id,
                            'name' => $emp->name,
                            'employee_number' => $emp->employee_number,
                            'division' => $emp->division ? $emp->division->name : '—',
                            'milestone' => $mSal,
                            'type' => 'salary',
                            'date' => $date,
                        ];
                    }
                }
            }
        }

        // Sort by date
        usort($results, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        return $results;
    }
}
