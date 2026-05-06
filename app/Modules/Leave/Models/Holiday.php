<?php

namespace App\Modules\Leave\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'date'])]
class Holiday extends Model
{
    use HasFactory;

    protected $casts = [
        'date' => 'date',
    ];
}
