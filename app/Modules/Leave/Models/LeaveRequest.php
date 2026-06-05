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

/**
 * @property int $id
 * @property int $user_id
 * @property int $leave_type_id
 * @property int $leave_status_id
 * @property \Illuminate\Support\Carbon|null $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property float $days_requested
 * @property \Illuminate\Support\Carbon|null $date_received
 * @property \Illuminate\Support\Carbon|null $date_approved
 * @property string|null $leave_details
 * @property bool $commutation_requested
 * @property bool $is_filed
 * @property string|null $notes
 * @property array|null $attachment_urls
 * @property int|null $created_by
 * @property int|null $approved_by_id
 * @property array|null $specific_dates
 * @property float|null $salary
 * @property \Illuminate\Support\Carbon|null $date_filed
 * @property float|null $days_with_pay
 * @property float|null $days_without_pay
 * @property string|null $others_pay_remarks
 * @property string|null $approved_by_official
 * @property string|null $leave_detail_type
 * @property string|null $leave_detail_remarks
 * @property bool $has_attachments
 * @property array|null $supporting_documents
 * @property array|null $maternity_allocation_details
 * @property string $pay_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * 
 * @property-read \App\Models\User $user
 * @property-read \App\Modules\Leave\Models\LeaveType $leaveType
 * @property-read \App\Modules\Leave\Models\LeaveStatus $leaveStatus
 * @property-read \App\Models\User|null $createdBy
 * @property-read \App\Models\User|null $approvedBy
 */
#[Fillable(['user_id', 'leave_type_id', 'leave_status_id', 'start_date', 'end_date', 'days_requested', 'date_received', 'date_approved', 'leave_details', 'commutation_requested', 'is_filed', 'notes', 'attachment_urls', 'created_by', 'approved_by_id', 'specific_dates', 'salary', 'date_filed', 'days_with_pay', 'days_without_pay', 'others_pay_remarks', 'approved_by_official', 'leave_detail_type', 'leave_detail_remarks', 'has_attachments', 'supporting_documents', 'maternity_allocation_details'])]
class LeaveRequest extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => "Leave request has been {$eventName}");
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
