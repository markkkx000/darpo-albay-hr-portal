<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Leave\Models\LeaveType;
use App\Modules\Leave\Requests\UpdateLeaveCreditRequest;
use App\Modules\Leave\Services\LeaveCreditService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveCreditController extends Controller
{
    public function __construct(
        protected LeaveCreditService $creditService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $year = $request->input('year', now()->year);
        $search = $request->input('search');

        $canManage = $user->can('leave.credits.manage');

        if ($canManage) {
            $users = $this->creditService->getAllCredits($year, $search);
            $personalCredits = null;
        } else {
            $users = null;
            $personalCredits = $this->creditService->getCreditsForUser($user, $year);
        }

        return Inertia::render('Modules/Leave/Credits', [
            'users' => $users, // HR view data
            'personalCredits' => $personalCredits, // Employee view data
            'leaveTypes' => LeaveType::where('is_active', true)->get(),
            'currentYear' => $year,
            'filters' => ['search' => $search],
            'canManageCredits' => $canManage,
            'allEmployees' => $canManage ? User::select('id', 'first_name', 'last_name', 'employee_number')->orderBy('last_name')->get() : [],
        ]);
    }

    public function show(Request $request, User $user)
    {
        $currentUser = $request->user();

        // Allow if user can manage credits OR is viewing their own credits
        if (! $currentUser->can('leave.credits.manage') && ! $currentUser->can('leave.manage') && $currentUser->id !== $user->id) {
            abort(403, 'Unauthorized access to leave credits.');
        }

        $year = $request->input('year', now()->year);

        return response()->json([
            'credits' => $this->creditService->getCreditsForUser($user, $year),
        ]);
    }

    public function update(UpdateLeaveCreditRequest $request)
    {
        $this->creditService->updateCredit($request->validated());

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Leave credits updated successfully.']);
        }

        return redirect()->back()->with('success', 'Leave credits updated successfully.');
    }
}
