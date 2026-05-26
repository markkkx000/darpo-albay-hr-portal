<?php

namespace App\Modules\Personnel\Models;

use Database\Factories\DivisionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['name', 'code', 'is_active'])]
class Division extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => "Division has been {$eventName}");
    }

    protected static function newFactory()
    {
        return DivisionFactory::new();
    }

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function positions(): HasMany
    {
        return $this->hasMany(Position::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
