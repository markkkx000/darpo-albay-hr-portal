<?php

namespace App\Modules\Personnel\Models;

use App\Models\User;
use Database\Factories\EmploymentStatusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmploymentStatus extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return EmploymentStatusFactory::new();
    }

    protected $fillable = ['name', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
