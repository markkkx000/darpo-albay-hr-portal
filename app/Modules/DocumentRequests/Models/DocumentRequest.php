<?php

namespace App\Modules\DocumentRequests\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable([
    'user_id',
    'requested_by',
    'requests',
    'purpose',
    'specify_remittance',
    'specify_documents',
    'specify_other',
    'status',
    'received_by',
    'released_to',
    'released_at',
    'is_electronic',
    'files',
    'acknowledged_at',
    'acknowledged_ip',
])]
class DocumentRequest extends Model
{
    use SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => "Document request has been {$eventName}");
    }

    protected function casts(): array
    {
        return [
            'requests' => 'array',
            'files' => 'array',
            'is_electronic' => 'boolean',
            'released_at' => 'datetime',
            'acknowledged_at' => 'datetime',
        ];
    }

    protected $appends = ['file_urls'];

    public function getFileUrlsAttribute(): array
    {
        $urls = [];
        if (is_array($this->files)) {
            foreach ($this->files as $file) {
                // If the file string is already a URL, use it directly
                if (filter_var($file, FILTER_VALIDATE_URL)) {
                    $urls[] = $file;
                } else {
                    $urls[] = Storage::url($file);
                }
            }
        }

        return $urls;
    }

    /**
     * The user this document is for.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * The user who submitted the request (might be HR on behalf of an employee).
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * The HR personnel who received/processed the request.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
