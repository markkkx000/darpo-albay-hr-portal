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

#[Fillable(['user_id', 'date', 'clock_in', 'clock_out'])]
class Attendance extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
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
                $query->whereNull('clock_out')
                    ->whereDate('date', Carbon::today());
            } elseif ($status === 'incomplete') {
                $query->whereNull('clock_out')
                    ->whereDate('date', '<', Carbon::today());
            } elseif ($status === 'completed') {
                $query->whereNotNull('clock_out');
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
