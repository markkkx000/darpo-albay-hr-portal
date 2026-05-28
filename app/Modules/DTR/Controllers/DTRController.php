<?php

namespace App\Modules\DTR\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\DTR\Requests\DTRGenerateRequest;
use App\Modules\DTR\Services\DTRService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\Response;

class DTRController extends Controller
{
    public function __construct(public DTRService $dtrService) {}

    /**
     * Display the DTR export form.
     */
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('attendance.view');

        $user = $request->user();
        $isHrAdmin = $user && $user->can('dtr.manage');

        $users = $isHrAdmin
            ? User::where('is_active', true)
                ->select('id', 'first_name', 'last_name', 'employee_number')
                ->orderBy('first_name')
                ->get()
            : collect([$user])->map(function (?User $u) {
                return $u ? $u->only(['id', 'first_name', 'last_name', 'employee_number']) : [];
            })->filter();

        return Inertia::render('Modules/DTR/Index', [
            'users' => $users,
            'isHrAdmin' => $isHrAdmin,
        ]);
    }

    /**
     * Generate and download the DTR export.
     */
    public function export(DTRGenerateRequest $request): Response
    {
        $userId = (int) $request->input('user_id');
        $month = (int) $request->input('month');
        $year = (int) $request->input('year');
        $format = $request->input('format');
        $officialHours = $request->input('official_hours') ?: '08:00 AM - 05:00 PM';

        $targetUser = User::findOrFail($userId);
        $attendance = $this->dtrService->getAttendanceForExport($userId, $month, $year);

        if ($format === 'pdf') {
            return $this->dtrService->generatePdf($targetUser, $attendance, $month, $year, $officialHours);
        }

        return $this->dtrService->generateCsv($targetUser, $attendance, $month, $year, $officialHours);
    }
}
