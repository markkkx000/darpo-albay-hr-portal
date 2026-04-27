<?php

namespace App\Modules\Leave\Services;

use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveService
{
    /**
     * Store a new leave request
     */
    public function storeLeaveRequest(array $data, int $createdBy)
    {
        $this->validateOverlap($data);
        $this->validateHalfDay($data['start_date'], $data['end_date'], $data['days_requested']);

        $data['created_by'] = $createdBy;

        return DB::transaction(function () use ($data) {
            $leaveRequest = LeaveRequest::create($data);

            $this->handleCreditDeduction($leaveRequest);

            return $leaveRequest;
        });
    }

    /**
     * Update an existing leave request
     */
    public function updateLeaveRequest(LeaveRequest $leaveRequest, array $data)
    {
        $this->validateOverlap($data, $leaveRequest->id);
        $this->validateHalfDay($data['start_date'], $data['end_date'], $data['days_requested']);

        return DB::transaction(function () use ($leaveRequest, $data) {
            $this->handleCreditRestoration($leaveRequest);

            $leaveRequest->update($data);

            // Refresh to get new relations if any changed
            $leaveRequest->refresh();
            $this->handleCreditDeduction($leaveRequest);

            return $leaveRequest;
        });
    }

    /**
     * Delete a leave request
     */
    public function deleteLeaveRequest(LeaveRequest $leaveRequest)
    {
        return DB::transaction(function () use ($leaveRequest) {
            $this->handleCreditRestoration($leaveRequest);
            $leaveRequest->delete();
        });
    }

    /**
     * Validate overlapping leave requests
     */
    public function validateOverlap(array $data, $ignoreId = null)
    {
        $userId = $data['user_id'];

        $requestedDates = [];
        if (! empty($data['specific_dates'])) {
            $requestedDates = $data['specific_dates'];
        } else {
            $current = Carbon::parse($data['start_date']);
            $end = Carbon::parse($data['end_date']);
            while ($current <= $end) {
                $requestedDates[] = $current->format('Y-m-d');
                $current->addDay();
            }
        }

        if (empty($requestedDates)) {
            return;
        }

        $minDate = min($requestedDates);
        $maxDate = max($requestedDates);

        $existingLeaves = LeaveRequest::where('user_id', $userId)
            ->where(function ($q) use ($minDate, $maxDate) {
                $q->where('start_date', '<=', $maxDate)
                    ->where('end_date', '>=', $minDate);
            })
            ->whereHas('leaveStatus', function ($q) {
                $q->where('name', '!=', 'Cancelled');
            });

        if ($ignoreId) {
            $existingLeaves->where('id', '!=', $ignoreId);
        }

        $existingLeaves = $existingLeaves->get();

        foreach ($existingLeaves as $leave) {
            $existingDates = [];
            if (! empty($leave->specific_dates)) {
                $existingDates = $leave->specific_dates;
            } else {
                $current = Carbon::parse($leave->start_date);
                $end = Carbon::parse($leave->end_date);
                while ($current <= $end) {
                    $existingDates[] = $current->format('Y-m-d');
                    $current->addDay();
                }
            }

            $overlap = array_intersect($requestedDates, $existingDates);
            if (count($overlap) > 0) {
                $conflictDate = Carbon::parse(reset($overlap))->format('M d, Y');
                throw ValidationException::withMessages([
                    'dates' => "The employee already has an active leave request on {$conflictDate}.",
                ]);
            }
        }
    }

    /**
     * Validate half-day logic
     */
    public function validateHalfDay($startDate, $endDate, $daysRequested)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        $totalCalendarDays = $start->diffInDays($end) + 1;

        if ($daysRequested > $totalCalendarDays) {
            throw ValidationException::withMessages([
                'days_requested' => "Days requested ({$daysRequested}) cannot exceed the total calendar days ({$totalCalendarDays}) between the start and end dates.",
            ]);
        }
    }

    /**
     * Calculate working days automatically (excluding weekends and holidays)
     */
    public function calculateWorkingDays($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $days = 0;

        $holidays = Holiday::whereBetween('date', [$start->format('Y-m-d'), $end->format('Y-m-d')])
            ->pluck('date')
            ->map(fn ($date) => Carbon::parse($date)->format('Y-m-d'))
            ->toArray();

        $current = $start->copy();
        while ($current <= $end) {
            if (! $current->isWeekend() && ! in_array($current->format('Y-m-d'), $holidays)) {
                $days++;
            }
            $current->addDay();
        }

        return $days;
    }

    /**
     * Deduct credits if approved
     */
    protected function handleCreditDeduction(LeaveRequest $leaveRequest)
    {
        if ($leaveRequest->leaveStatus && $leaveRequest->leaveStatus->name === 'Approved') {
            $year = Carbon::parse($leaveRequest->start_date)->year;

            $credit = LeaveCredit::firstOrCreate(
                [
                    'user_id' => $leaveRequest->user_id,
                    'leave_type_id' => $leaveRequest->leave_type_id,
                    'year' => $year,
                ],
                [
                    'earned' => 0,
                    'used' => 0,
                    'balance' => 0,
                ]
            );

            $credit->used += $leaveRequest->days_requested;
            $credit->balance = $credit->earned - $credit->used;
            $credit->save();
        }
    }

    /**
     * Restore credits if updating/deleting an approved leave
     */
    protected function handleCreditRestoration(LeaveRequest $leaveRequest)
    {
        $originalStatus = $leaveRequest->leaveStatus;
        if ($originalStatus && $originalStatus->name === 'Approved') {
            $year = Carbon::parse($leaveRequest->getOriginal('start_date'))->year;
            $credit = LeaveCredit::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveRequest->getOriginal('leave_type_id'))
                ->where('year', $year)
                ->first();

            if ($credit) {
                $credit->used -= $leaveRequest->getOriginal('days_requested');
                $credit->balance = $credit->earned - $credit->used;
                $credit->save();
            }
        }
    }
}
