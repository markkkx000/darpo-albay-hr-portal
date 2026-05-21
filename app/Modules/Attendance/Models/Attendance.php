<?php

namespace App\Modules\Attendance\Models;

use App\Models\User;
use Carbon\Carbon;
use Database\Factories\AttendanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'date', 'am_clock_in', 'am_clock_out', 'pm_clock_in', 'pm_clock_out'])]
class Attendance extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'am_clock_in' => 'datetime',
        'am_clock_out' => 'datetime',
        'pm_clock_in' => 'datetime',
        'pm_clock_out' => 'datetime',
    ];

    public function scopeFilter(Builder $query, array $filters): void
    {
        if ($search = $filters['search'] ?? null) {
            $keywords = explode(' ', $search);
            $query->whereHas('user', function (Builder $q) use ($keywords) {
                foreach ($keywords as $keyword) {
                    if (empty($keyword)) {
                        continue;
                    }
                    $q->where(function ($inner) use ($keyword) {
                        $inner->where('first_name', 'ilike', '%'.$keyword.'%')
                            ->orWhere('last_name', 'ilike', '%'.$keyword.'%')
                            ->orWhere('employee_number', 'ilike', '%'.$keyword.'%');
                    });
                }
            });
        }

        if ($status = $filters['status'] ?? null) {
            if ($status === 'working') {
                $query->whereNull('pm_clock_out')
                    ->whereDate('date', Carbon::today());
            } elseif ($status === 'incomplete') {
                // Truly broken: output without corresponding input, or
                // am_in + pm_in present but am_out is missing (jumped sessions).
                // Also includes past-day records where am_in was logged but am_out was never recorded.
                // Valid half-day patterns (AM-only or PM-only complete) are excluded.
                $query->where(function (Builder $q) {
                    // am_out without am_in
                    $q->whereNull('am_clock_in')->whereNotNull('am_clock_out');
                })->orWhere(function (Builder $q) {
                    // pm_out without pm_in
                    $q->whereNull('pm_clock_in')->whereNotNull('pm_clock_out');
                })->orWhere(function (Builder $q) {
                    // Jumped from am_in straight to pm_in, skipping am_out
                    $q->whereNotNull('am_clock_in')
                        ->whereNull('am_clock_out')
                        ->whereNotNull('pm_clock_in');
                })->orWhere(function (Builder $q) {
                    // Past-day record where am_in was logged but am_out was never recorded
                    // (employee forgot to clock out) — only applies to past days, not today
                    $q->whereNotNull('am_clock_in')
                        ->whereNull('am_clock_out')
                        ->whereNull('pm_clock_in')
                        ->whereDate('date', '<', Carbon::today());
                });
            } elseif ($status === 'completed') {
                $query->whereNotNull('pm_clock_out');
            } elseif ($status === 'archived') {
                $query->onlyTrashed();
            }
        }

        if ($fromDate = $filters['from_date'] ?? null) {
            $query->whereDate('date', '>=', $fromDate);
        }

        if ($toDate = $filters['to_date'] ?? null) {
            $query->whereDate('date', '<=', $toDate);
        }

        if ($userId = $filters['user_id'] ?? null) {
            $query->where('user_id', $userId);
        }
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected static function newFactory()
    {
        return AttendanceFactory::new();
    }
}
