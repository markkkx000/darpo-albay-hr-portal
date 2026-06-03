<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id',
        'github_issue_id',
        'title',
        'type',
        'status',
    ];

    /**
     * Get the user that owns the support ticket.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
