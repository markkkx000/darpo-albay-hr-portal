<?php

namespace App\Modules\Personnel\Services;

use App\Core\Services\NotificationService;
use App\Models\User;
use App\Modules\Personnel\Models\Position;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EmployeeService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Get active employees with filters and pagination.
     */
    public function getEmployees(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()
            ->with(['division', 'unit', 'positions', 'employmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $keywords = explode(' ', $search);
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (empty($keyword)) {
                            continue;
                        }
                        $q->where(function ($inner) use ($keyword) {
                            $inner->where('first_name', 'ilike', "%{$keyword}%")
                                ->orWhere('last_name', 'ilike', "%{$keyword}%")
                                ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                        });
                    }
                });
            })
            ->when($filters['division_id'] ?? null, function ($query, $divisionId) {
                $query->where('division_id', $divisionId);
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
            ->with(['division', 'unit', 'positions', 'employmentStatus'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $keywords = explode(' ', $search);
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (empty($keyword)) {
                            continue;
                        }
                        $q->where(function ($inner) use ($keyword) {
                            $inner->where('first_name', 'ilike', "%{$keyword}%")
                                ->orWhere('last_name', 'ilike', "%{$keyword}%")
                                ->orWhere('employee_number', 'ilike', "%{$keyword}%");
                        });
                    }
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
                'division_id' => $data['division_id'] ?? null,
                'unit_id' => $data['unit_id'] ?? null,
                'employment_status_id' => $data['employment_status_id'] ?? null,
                'hire_date' => $data['hire_date'] ?? null,
                'contact_number' => $data['contact_number'] ?? null,
                'address' => $data['address'] ?? null,
                'sex' => $data['sex'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'years_in_service' => $data['years_in_service'] ?? null,
                'plantilla_number' => $data['plantilla_number'] ?? null,
                'gsis_bp_number' => $data['gsis_bp_number'] ?? null,
                'philhealth' => $data['philhealth'] ?? null,
                'hdmf_pagibig_no' => $data['hdmf_pagibig_no'] ?? null,
                'tin_number' => $data['tin_number'] ?? null,
                'prc_id_no' => $data['prc_id_no'] ?? null,
                'prc_expiration' => $data['prc_expiration'] ?? null,
                'orig_date_of_appointment' => $data['orig_date_of_appointment'] ?? null,
                'date_of_latest_appointment' => $data['date_of_latest_appointment'] ?? null,
                'date_of_assumption' => $data['date_of_assumption'] ?? null,
            ]);

            $user->assignRole('employee');

            if (isset($data['positions']) && is_array($data['positions'])) {
                $positionIdsToSync = [];
                foreach ($data['positions'] as $posData) {
                    if (!empty($posData['id']) && is_numeric($posData['id'])) {
                        $positionId = $posData['id'];
                    } elseif (!empty($posData['name'])) {
                        $newPosition = clone \App\Modules\Personnel\Models\Position::create([
                            'name' => $posData['name'],
                            'division_id' => $data['division_id'],
                            'is_active' => true,
                        ]);
                        $positionId = $newPosition->id;
                    } else {
                        continue;
                    }
                    $positionIdsToSync[$positionId] = ['is_primary' => $posData['is_primary'] ?? false];
                }
                $user->positions()->sync($positionIdsToSync);
            }

            $this->notificationService->notifyUser($user, [
                'type' => 'system',
                'subtype' => 'default_password',
                'title' => 'Please change your default password',
                'body' => 'Your account was created with a default password. Please change it immediately in your profile settings.',
                'from' => 'System',
                'priority' => 'high',
                'dismissible' => false,
                'url' => '/settings/security',
            ]);

            return $user;
        });
    }

    /**
     * Update an employee.
     */
    public function updateEmployee(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update($data);

            if (isset($data['positions']) && is_array($data['positions'])) {
                $positionIdsToSync = [];
                foreach ($data['positions'] as $posData) {
                    if (!empty($posData['id']) && is_numeric($posData['id'])) {
                        $positionId = $posData['id'];
                    } elseif (!empty($posData['name'])) {
                        $newPosition = clone \App\Modules\Personnel\Models\Position::create([
                            'name' => $posData['name'],
                            'division_id' => $data['division_id'] ?? $user->division_id,
                            'is_active' => true,
                        ]);
                        $positionId = $newPosition->id;
                    } else {
                        continue;
                    }
                    $positionIdsToSync[$positionId] = ['is_primary' => $posData['is_primary'] ?? false];
                }
                $user->positions()->sync($positionIdsToSync);
            }

            return $user;
        });
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
