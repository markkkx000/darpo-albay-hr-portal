<?php

namespace App\Modules\Personnel\Models;

use App\Models\User;
use Database\Factories\AppointmentStatusFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'is_active'])]
class AppointmentStatus extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return AppointmentStatusFactory::new();
    }

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
