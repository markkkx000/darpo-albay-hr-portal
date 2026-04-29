<?php

namespace App\Modules\Leave\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeaveRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'leave_type_id',
        'leave_status_id',
        'start_date',
        'end_date',
        'days_requested',
        'date_received',
        'date_approved',
        'leave_details',
        'commutation_requested',
        'is_filed',
        'notes',
        'attachment_path',
        'created_by',
        'approved_by_id',
        'specific_dates',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'date_received' => 'date',
        'date_approved' => 'date',
        'days_requested' => 'decimal:2',
        'commutation_requested' => 'boolean',
        'is_filed' => 'boolean',
        'specific_dates' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function leaveStatus(): BelongsTo
    {
        return $this->belongsTo(LeaveStatus::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }
}
