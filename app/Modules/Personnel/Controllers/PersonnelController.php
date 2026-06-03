<?php

namespace App\Modules\Personnel\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Personnel\Models\AppointmentStatus;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use App\Modules\Personnel\Requests\EmployeeCreateRequest;
use App\Modules\Personnel\Requests\EmployeeRestoreRequest;
use App\Modules\Personnel\Requests\EmployeeUpdateRequest;
use App\Modules\Personnel\Services\EmployeeService;
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
            'employees' => $this->employeeService->getEmployees($request->only(['search', 'division_id', 'appointment_status_id'])),
            'filters' => $request->only(['search', 'division_id', 'appointment_status_id']),
            'divisions' => Division::where('is_active', true)->get(),
            'units' => Unit::where('is_active', true)->get(),
            'appointmentStatuses' => AppointmentStatus::where('is_active', true)->get(),
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
            'appointmentStatuses' => AppointmentStatus::where('is_active', true)->get(),
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
            'employee' => $user->load(['division', 'unit', 'positions', 'appointmentStatus']),
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
            'appointmentStatuses' => AppointmentStatus::where('is_active', true)->get(),
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
            'employees' => $this->employeeService->getArchivedEmployees($request->only(['search'])),
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
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $this->authorize('roles.manage');

        $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);

        $this->employeeService->resetPassword($user, $request->input('password'));

        return back()->with('success', 'Password reset successfully.');
    }

    /**
     * Disable MFA for a user (Super Admin only).
     */
    public function disableMfa(Request $request, User $user): RedirectResponse
    {
        if (! $request->user()->hasRole('super_admin')) {
            abort(403, 'Unauthorized action.');
        }

        $user->forceFill([
            'mfa_enabled' => false,
            'mfa_code' => null,
            'mfa_expires_at' => null,
        ])->save();

        return back()->with('success', 'Two-Factor Authentication has been disabled for this user.');
    }

    /**
     * Display the authenticated user's personnel record.
     */
    public function myRecord(Request $request): Response
    {
        return Inertia::render('Modules/Personnel/MyRecord', [
            'employee' => $request->user()->load(['division', 'unit', 'positions', 'appointmentStatus']),
        ]);
    }
}
