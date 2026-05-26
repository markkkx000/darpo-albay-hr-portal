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
        'date' => 'date:Y-m-d',
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
                $query->where(function (Builder $q) {
                    $q->whereNotNull('am_clock_in')->whereNull('am_clock_out')
                        ->orWhere(function (Builder $inner) {
                            $inner->whereNotNull('pm_clock_in')->whereNull('pm_clock_out');
                        });
                })->whereDate('date', Carbon::today());
            } elseif ($status === 'incomplete') {
                $query->where(function (Builder $q) {
                    // Past days: missing AM OUT (when AM IN exists)
                    $q->whereNotNull('am_clock_in')
                        ->whereNull('am_clock_out')
                        ->whereDate('date', '<', Carbon::today());
                })->orWhere(function (Builder $q) {
                    // Past days: missing PM OUT (when PM IN exists)
                    $q->whereNotNull('pm_clock_in')
                        ->whereNull('pm_clock_out')
                        ->whereDate('date', '<', Carbon::today());
                })->orWhere(function (Builder $q) {
                    // Any day: missing AM IN (when AM OUT exists)
                    $q->whereNull('am_clock_in')->whereNotNull('am_clock_out');
                })->orWhere(function (Builder $q) {
                    // Any day: missing PM IN (when PM OUT exists)
                    $q->whereNull('pm_clock_in')->whereNotNull('pm_clock_out');
                })->orWhere(function (Builder $q) {
                    // Jumped session (AM IN and PM IN exist, but AM OUT is missing)
                    $q->whereNotNull('am_clock_in')
                        ->whereNull('am_clock_out')
                        ->whereNotNull('pm_clock_in');
                });
            } elseif ($status === 'half_day') {
                $query->where(function (Builder $q) {
                    // AM only
                    $q->whereNotNull('am_clock_in')
                        ->whereNotNull('am_clock_out')
                        ->whereNull('pm_clock_in')
                        ->whereNull('pm_clock_out');
                })->orWhere(function (Builder $q) {
                    // PM only
                    $q->whereNull('am_clock_in')
                        ->whereNull('am_clock_out')
                        ->whereNotNull('pm_clock_in')
                        ->whereNotNull('pm_clock_out');
                });
            } elseif ($status === 'completed') {
                $query->whereNotNull('am_clock_in')
                    ->whereNotNull('am_clock_out')
                    ->whereNotNull('pm_clock_in')
                    ->whereNotNull('pm_clock_out');
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
