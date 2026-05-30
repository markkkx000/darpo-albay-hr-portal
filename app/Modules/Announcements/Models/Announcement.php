<?php

namespace App\Modules\Announcements\Models;

use App\Models\User;
use Database\Factories\AnnouncementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

#[Fillable(['title', 'content', 'posted_by', 'status', 'priority', 'published_at', 'target_type', 'target_id', 'is_event', 'event_date'])]
class Announcement extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->setDescriptionForEvent(fn (string $eventName) => "Announcement has been {$eventName}");
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): AnnouncementFactory
    {
        return AnnouncementFactory::new();
    }

    protected $casts = [
        'published_at' => 'datetime',
        'is_event' => 'boolean',
        'event_date' => 'date:Y-m-d',
    ];

    /**
     * Get the user who posted the announcement.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'posted_by');
    }

    /**
     * Scope for published announcements.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', 'published');
    }

    /**
     * Scope for draft announcements.
     */
    public function scopeDraft(Builder $query): void
    {
        $query->where('status', 'draft');
    }

    /**
     * Scope for announcements visible to a specific user.
     */
    public function scopeForUser(Builder $query, User $user): void
    {
        $query->published()->where(function ($q) use ($user) {
            $q->where('target_type', 'all')
                ->orWhere(function ($q) use ($user) {
                    $q->where('target_type', 'division')
                        ->where('target_id', $user->division_id);
                })
                ->orWhere(function ($q) use ($user) {
                    $q->where('target_type', 'position')
                        ->whereIn('target_id', $user->positions->pluck('id'));
                })
                ->orWhere(function ($q) use ($user) {
                    $q->where('target_type', 'user')
                        ->where('target_id', $user->id);
                });
        });
    }
}
