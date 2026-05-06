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
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereHas('user', function ($query) use ($search) {
                $query->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%');
            });
        })->when($filters['status'] ?? null, function ($query, $status) {
            if ($status === 'working') {
                $query->whereNull('clock_out')
                    ->whereDate('date', Carbon::today());
            } elseif ($status === 'incomplete') {
                $query->whereNull('clock_out')
                    ->whereDate('date', '<', Carbon::today());
            } elseif ($status === 'completed') {
                $query->whereNotNull('clock_out');
            }
        })->when($filters['from_date'] ?? null, function ($query, $fromDate) {
            $query->whereDate('date', '>=', $fromDate);
        })->when($filters['to_date'] ?? null, function ($query, $toDate) {
            $query->whereDate('date', '<=', $toDate);
        })->when($filters['user_id'] ?? null, function ($query, $userId) {
            $query->where('user_id', $userId);
        });
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
