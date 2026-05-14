<?php

namespace App\Modules\Leave\Services;

use App\Models\User;
use App\Modules\Leave\Models\LeaveCredit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class LeaveCreditService
{
    /**
     * Get paginated users with their leave credits for a specific year (HR View).
     */
    public function getAllCredits(int $year, ?string $search = null): LengthAwarePaginator
    {
        return User::with(['leaveCredits' => function ($query) use ($year) {
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
    }

    /**
     * Get leave credits for a single user for a specific year (Employee View).
     */
    public function getCreditsForUser(User $user, int $year): Collection
    {
        return LeaveCredit::with('leaveType')
            ->where('user_id', $user->id)
            ->where('year', $year)
            ->get();
    }

    /**
     * Update or create a leave credit record.
     * Earned is calculated as balance (Available) + used.
     */
    public function updateCredit(array $data): LeaveCredit
    {
        return LeaveCredit::updateOrCreate(
            [
                'user_id' => $data['user_id'],
                'leave_type_id' => $data['leave_type_id'],
                'year' => $data['year'],
            ],
            [
                'used' => $data['used'],
                'balance' => $data['balance'],
                'earned' => $data['balance'] + $data['used'],
            ]
        );
    }
}
