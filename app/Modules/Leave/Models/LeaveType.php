<?php

namespace App\Modules\Leave\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'description', 'color_code', 'is_cumulative', 'abbreviation', 'is_active'])]
class LeaveType extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'is_cumulative' => 'boolean',
    ];
}
