<?php

namespace App\Modules\Leave\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['user_id', 'leave_type_id', 'leave_status_id', 'start_date', 'end_date', 'days_requested', 'date_received', 'date_approved', 'leave_details', 'commutation_requested', 'is_filed', 'notes', 'attachment_urls', 'created_by', 'approved_by_id', 'specific_dates', 'salary', 'date_filed', 'days_with_pay', 'days_without_pay', 'others_pay_remarks', 'approved_by_official', 'leave_detail_type', 'leave_detail_remarks', 'has_attachments', 'supporting_documents', 'maternity_allocation_details'])]
class LeaveRequest extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn(string $eventName) => "Leave request has been {$eventName}");
    }

    protected $appends = ['pay_status'];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'date_received' => 'date:Y-m-d',
        'date_approved' => 'date:Y-m-d',
        'days_requested' => 'decimal:2',
        'commutation_requested' => 'boolean',
        'is_filed' => 'boolean',
        'specific_dates' => 'array',
        'salary' => 'decimal:2',
        'date_filed' => 'date:Y-m-d',
        'has_attachments' => 'boolean',
        'supporting_documents' => 'array',
        'days_with_pay' => 'decimal:2',
        'days_without_pay' => 'decimal:2',
        'attachment_urls' => 'array',
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

    public function getPayStatusAttribute(): string
    {
        $withPay = (float) $this->days_with_pay;
        $withoutPay = (float) $this->days_without_pay;

        if ($withPay > 0 && $withoutPay == 0) {
            return 'with_pay';
        }

        if ($withPay == 0 && $withoutPay > 0) {
            return 'without_pay';
        }

        if ($withPay > 0 && $withoutPay > 0) {
            return 'partial';
        }

        return 'without_pay'; // Default or if both are 0
    }
}
