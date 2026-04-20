<?php

namespace App\Modules\Personnel\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeService
{
    /**
     * Get active employees with filters and pagination.
     */
    public function getEmployees(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['department', 'position', 'employmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->when($filters['department_id'] ?? null, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($filters['employment_status_id'] ?? null, function ($query, $statusId) {
                $query->where('employment_status_id', $statusId);
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Get archived (soft-deleted) employees.
     */
    public function getArchivedEmployees(array $filters = []): LengthAwarePaginator
    {
        $query = User::onlyTrashed()
            ->with(['department', 'position', 'employmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_number', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('deleted_at');

        return $query->paginate(15)->withQueryString();
    }

    /**
     * Create a new employee.
     */
    public function createEmployee(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'employee_number' => $data['employee_number'],
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'] ?? null,
                'password' => Hash::make($data['password'] ?? 'password123'), // Default password or from data
                'is_active' => $data['is_active'] ?? true,
                'position_id' => $data['position_id'] ?? null,
                'department_id' => $data['department_id'] ?? null,
                'employment_status_id' => $data['employment_status_id'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'address' => $data['address'] ?? null,
            ]);

            $user->assignRole('employee');

            return $user;
        });
    }

    /**
     * Update an employee.
     */
    public function updateEmployee(User $user, array $data): User
    {
        $user->update($data);

        return $user;
    }

    /**
     * Soft delete an employee.
     */
    public function deleteEmployee(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Restore a soft-deleted employee.
     */
    public function restoreEmployee(int $id): bool
    {
        $user = User::onlyTrashed()->findOrFail($id);

        return $user->restore();
    }
}
