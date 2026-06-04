<?php

namespace App\Modules\YearlyReport\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Personnel\Services\MilestoneService;
use App\Modules\YearlyReport\Exports\YearlyReportExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class YearlyReportController extends Controller
{
    public function index(Request $request, MilestoneService $milestoneService): Response
    {
        $this->authorize('personnel.view');

        $year = $request->query('year', Carbon::now()->year);
        $filter = $request->query('filter', 'all');

        $results = $milestoneService->getMilestonesForYear((int) $year, $filter);

        $perPage = 10;
        $page = $request->query('page', 1);
        $offset = ($page - 1) * $perPage;
        $items = array_values(array_slice($results, $offset, $perPage));

        $paginator = new LengthAwarePaginator(
            $items,
            count($results),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        return Inertia::render('Modules/YearlyReport/Index', [
            'results' => $paginator,
            'year' => (int) $year,
            'filter' => $filter,
        ]);
    }

    public function export(Request $request, MilestoneService $milestoneService)
    {
        $this->authorize('personnel.view');

        $year = $request->query('year', Carbon::now()->year);
        $filter = $request->query('filter', 'all');

        $results = $milestoneService->getMilestonesForYear((int) $year, $filter);

        return Excel::download(new YearlyReportExport($results, $year), "Yearly_Report_{$year}.xlsx");
    }
}
