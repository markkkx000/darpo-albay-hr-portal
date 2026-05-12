<?php

namespace App\Modules\Leave\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'year', 'month', 'tardiness_count', 'tardiness_minutes', 'undertime_count', 'undertime_minutes', 'created_by'])]
class TardinessRecord extends Model
{
    use HasFactory;

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'tardiness_count' => 'integer',
        'tardiness_minutes' => 'integer',
        'undertime_count' => 'integer',
        'undertime_minutes' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
