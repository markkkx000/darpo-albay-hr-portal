<?php

namespace App\Modules\DocumentRequests\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $requested_by
 * @property array|null $requests
 * @property string|null $purpose
 * @property string|null $specify_remittance
 * @property string|null $specify_documents
 * @property string|null $specify_other
 * @property string $status
 * @property string|null $status_reason
 * @property int|null $received_by
 * @property string|null $released_to
 * @property Carbon|null $released_at
 * @property bool $is_electronic
 * @property array|null $files
 * @property array $file_urls
 * @property Carbon|null $acknowledged_at
 * @property string|null $acknowledged_ip
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read User|null $requester
 * @property-read User|null $receiver
 */
#[Fillable([
    'user_id',
    'requested_by',
    'requests',
    'purpose',
    'specify_remittance',
    'specify_documents',
    'specify_other',
    'status',
    'status_reason',
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
    use LogsActivity, SoftDeletes;

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
