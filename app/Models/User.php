<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Leave\Models\TardinessRecord;
use App\Modules\Personnel\Models\AppointmentStatus;
use App\Modules\Personnel\Models\Division;
use App\Modules\Personnel\Models\Position;
use App\Modules\Personnel\Models\Unit;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['employee_number', 'first_name', 'middle_name', 'last_name', 'email', 'password', 'is_active', 'division_id', 'unit_id', 'appointment_status_id', 'hire_date', 'contact_number', 'address', 'sex', 'date_of_birth', 'years_in_service', 'plantilla_number', 'gsis_bp_number', 'philhealth', 'hdmf_pagibig_no', 'tin_number', 'prc_id_no', 'prc_expiration', 'orig_date_of_appointment', 'date_of_latest_appointment', 'date_of_assumption', 'date_of_separation', 'date_hired_government', 'present_address', 'civil_status', 'fund_code', 'func_activity_code', 'item_number', 'office_per_appointment', 'plantilla_position', 'lbp_account_number', 'profile_picture', 'salary_grade', 'salary_step', 'monthly_salary'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $appends = ['name', 'age', 'avatar'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'hire_date' => 'date',
            'date_of_birth' => 'date',
            'prc_expiration' => 'date',
            'orig_date_of_appointment' => 'date',
            'date_of_latest_appointment' => 'date',
            'date_of_assumption' => 'date',
            'date_of_separation' => 'date',
            'date_hired_government' => 'date',
            'salary_grade' => 'integer',
            'salary_step' => 'integer',
            'monthly_salary' => 'decimal:2',
        ];
    }

    /**
     * Get the user's full name.
     */
    public function getNameAttribute(): string
    {
        return collect([$this->first_name, $this->middle_name, $this->last_name])
            ->filter()
            ->implode(' ');
    }

    public function getAgeAttribute(): ?int
    {
        if (! $this->date_of_birth) {
            return null;
        }

        return Carbon::parse($this->date_of_birth)->age;
    }

    public function getAvatarAttribute(): string
    {
        if (! $this->profile_picture) {
            return asset('img/pfp_placeholder.png');
        }

        if (str_starts_with($this->profile_picture, 'http')) {
            return $this->profile_picture;
        }

        $path = $this->profile_picture;
        if (str_starts_with($path, '/storage/')) {
            $path = substr($path, 9);
        } elseif (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }

        return Storage::url($path);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function positions(): BelongsToMany
    {
        return $this->belongsToMany(Position::class)->withPivot('is_primary')->withTimestamps();
    }

    public function appointmentStatus(): BelongsTo
    {
        return $this->belongsTo(AppointmentStatus::class);
    }

    public function leaveCredits(): HasMany
    {
        return $this->hasMany(LeaveCredit::class);
    }

    public function tardinessRecords(): HasMany
    {
        return $this->hasMany(TardinessRecord::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
