<?php

namespace App\Modules\Personnel\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\EmploymentStatus;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use App\Modules\Personnel\Requests\EmployeeCreateRequest;
use App\Modules\Personnel\Requests\EmployeeRestoreRequest;
use App\Modules\Personnel\Requests\EmployeeUpdateRequest;
use App\Modules\Personnel\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelController extends Controller
{
    public function __construct(
        protected EmployeeService $employeeService
    ) {}

    /**
     * Display the personnel directory.
     */
    public function index(Request $request): Response
    {
        $this->authorize('personnel.view');

        return Inertia::render('Modules/Personnel/Index', [
            'employees' => $this->employeeService->getEmployees($request->all()),
            'filters' => $request->only(['search', 'division_id', 'employment_status_id']),
            'divisions' => Division::where('is_active', true)->get(),
            'units' => Unit::where('is_active', true)->get(),
            'employmentStatuses' => EmploymentStatus::where('is_active', true)->get(),
        ]);
    }

    /**
     * Show the create employee form.
     */
    public function create(): Response
    {
        $this->authorize('personnel.manage');

        return Inertia::render('Modules/Personnel/Create', [
            'divisions' => Division::where('is_active', true)->get(),
            'units' => Unit::where('is_active', true)->get(),
            'positions' => Position::where('is_active', true)->get(),
            'employmentStatuses' => EmploymentStatus::where('is_active', true)->get(),
        ]);
    }

    /**
     * Store a new employee.
     */
    public function store(EmployeeCreateRequest $request): RedirectResponse
    {
        $employee = $this->employeeService->createEmployee($request->validated());

        return redirect()->route('personnel.index')
            ->with('success', "Employee record for {$employee->first_name} {$employee->last_name} created successfully.");
    }

    /**
     * Display an employee profile.
     */
    public function show(User $user): Response
    {
        $this->authorize('personnel.view');

        return Inertia::render('Modules/Personnel/Show', [
            'employee' => $user->load(['division', 'unit', 'positions', 'employmentStatus']),
        ]);
    }

    /**
     * Show the edit employee form.
     */
    public function edit(User $user): Response
    {
        $this->authorize('personnel.manage');

        return Inertia::render('Modules/Personnel/Edit', [
            'employee' => $user->load('positions'),
            'divisions' => Division::where('is_active', true)->get(),
            'units' => Unit::where('is_active', true)->get(),
            'positions' => Position::where('is_active', true)->get(),
            'employmentStatuses' => EmploymentStatus::where('is_active', true)->get(),
        ]);
    }

    /**
     * Update an employee.
     */
    public function update(EmployeeUpdateRequest $request, User $user): RedirectResponse
    {
        $this->authorize('personnel.manage');

        $this->employeeService->updateEmployee($user, $request->validated());

        return redirect()->route('personnel.show', $user)
            ->with('success', 'Employee record updated successfully.');
    }

    /**
     * Soft delete an employee.
     */
    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('personnel.manage');

        $this->employeeService->deleteEmployee($user);

        return redirect()->route('personnel.index')
            ->with('success', 'Employee record archived successfully.');
    }

    /**
     * Display archived (soft-deleted) employees.
     */
    public function archived(Request $request): Response
    {
        $this->authorize('personnel.view');

        return Inertia::render('Modules/Personnel/Archived', [
            'employees' => $this->employeeService->getArchivedEmployees($request->all()),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Restore an archived employee.
     */
    public function restore(EmployeeRestoreRequest $request, int $id): RedirectResponse
    {
        $this->employeeService->restoreEmployee($id);

        return redirect()->route('personnel.archived')
            ->with('success', 'Employee record restored successfully.');
    }

    /**
     * Reset an employee's password.
     */
    public function resetPassword(User $user): JsonResponse
    {
        $this->authorize('roles.manage');

        $newPassword = $this->employeeService->resetPassword($user);

        return response()->json([
            'message' => 'Password reset successfully.',
            'new_password' => $newPassword,
        ]);
    }
}
