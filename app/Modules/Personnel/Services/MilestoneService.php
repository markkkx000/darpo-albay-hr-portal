<?php

namespace App\Modules\Personnel\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class MilestoneService
{
    /**
     * Calculate all milestones (loyalty and salary) for a given year.
     *
     * @param  string  $filter  'all', 'loyalty', or 'salary'
     * @param  \Illuminate\Database\Eloquent\Collection|null  $employees  Optional custom collection of employees
     */
    public function getMilestonesForYear(int $year, string $filter = 'all', $employees = null): array
    {
        if (! $employees) {
            $employees = User::with(['division'])->where('is_active', true)->get();
        }

        $results = [];

        foreach ($employees as $emp) {
            // Loyalty Milestones
            if ($filter === 'all' || $filter === 'loyalty') {
                $startDate = $emp->date_hired_government ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
                if ($startDate) {
                    $startYear = Carbon::parse($startDate)->year;
                    $m = $year - $startYear;

                    // 10 years initially, then every 5 years
                    if ($m >= 10 && ($m === 10 || ($m - 10) % 5 === 0)) {
                        $date = Carbon::parse($startDate)->addYears($m)->format('Y-m-d');
                        $results[] = [
                            'emp_id' => $emp->id,
                            'name' => $emp->name,
                            'employee_number' => $emp->employee_number,
                            'division' => $emp->division ? $emp->division->name : '—',
                            'milestone' => $m,
                            'type' => 'loyalty',
                            'date' => $date,
                            'user' => $emp,
                        ];
                    }
                }
            }

            // Salary Milestones
            if ($filter === 'all' || $filter === 'salary') {
                $baseDate = $emp->date_of_latest_appointment ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
                if ($baseDate) {
                    $baseYear = Carbon::parse($baseDate)->year;
                    $mSal = $year - $baseYear;

                    // Every 3 years, up to Step 8
                    if ($mSal >= 3 && $mSal % 3 === 0 && (int) $emp->salary_step < 8) {
                        $date = Carbon::parse($baseDate)->addYears($mSal)->format('Y-m-d');
                        $results[] = [
                            'emp_id' => $emp->id,
                            'name' => $emp->name,
                            'employee_number' => $emp->employee_number,
                            'division' => $emp->division ? $emp->division->name : '—',
                            'milestone' => $mSal,
                            'type' => 'salary',
                            'date' => $date,
                            'user' => $emp,
                        ];
                    }
                }
            }
        }

        // Sort by date ascending
        usort($results, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        return $results;
    }

    /**
     * Get upcoming milestones within a specified number of days from today.
     */
    public function getUpcomingMilestones(int $days = 30): array
    {
        $year = Carbon::now()->year;
        $today = Carbon::today();
        $targetDate = $today->copy()->addDays($days);

        $allMilestonesThisYear = $this->getMilestonesForYear($year);

        $upcoming = array_filter($allMilestonesThisYear, function ($milestone) use ($today, $targetDate) {
            $milestoneDate = Carbon::parse($milestone['date']);

            // Must be strictly in the future (up to $days days from now)
            // If it's today, we don't consider it "upcoming" for the dashboard (or maybe we do?)
            // Usually upcoming means >= today and <= targetDate
            return $milestoneDate->betweenIncluded($today, $targetDate);
        });

        return array_values($upcoming);
    }
}
