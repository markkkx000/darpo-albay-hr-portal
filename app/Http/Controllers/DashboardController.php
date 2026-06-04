<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Permission-driven Layout Checks
        $isSuperAdmin = $user->can('roles.manage');
        $isHR = $user->can('personnel.view') || $user->can('leave.manage');

        return Inertia::render('dashboard', [
            'adminData' => $isSuperAdmin ? $this->dashboardService->getAdminMetrics($user) : null,
            'hrData' => ($isSuperAdmin || $isHR) ? $this->dashboardService->getHrMetrics($user) : null,
            'employeeData' => $this->dashboardService->getEmployeeData($user),
        ]);
    }
}
