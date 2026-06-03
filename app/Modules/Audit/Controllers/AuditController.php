<?php

namespace App\Modules\Audit\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::with('causer')->latest();

        // Search by description or causer name
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'ilike', "%{$search}%")
                    ->orWhereHasMorph('causer', [User::class], function ($q2) use ($search) {
                        $q2->where('first_name', 'ilike', "%{$search}%")
                            ->orWhere('last_name', 'ilike', "%{$search}%");
                    });
            });
        }

        // Filter by specific user (causer)
        if ($userId = $request->input('user_id')) {
            $query->where('causer_type', User::class)
                ->where('causer_id', $userId);
        }

        // Filter by Event Type (created, updated, deleted, etc. or auth)
        if ($event = $request->input('event')) {
            $query->where(function ($q) use ($event) {
                $q->where('event', $event)
                    ->orWhere(function ($q2) use ($event) {
                        $q2->whereNull('event')->where('log_name', $event);
                    });
            });
        }

        // Filter by Date Range
        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $logs = $query->paginate(20)->withQueryString()->through(function ($activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event ?: $activity->log_name,
                'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                'subject_id' => $activity->subject_id,
                'causer' => $activity->causer ? "{$activity->causer->first_name} {$activity->causer->last_name}" : 'System',
                'properties' => array_merge(
                    $activity->properties ? $activity->properties->toArray() : [],
                    $activity->attribute_changes ? $activity->attribute_changes->toArray() : []
                ),
                'created_at' => $activity->created_at->format('M j, Y h:i A'),
                'created_at_human' => $activity->created_at->diffForHumans(),
            ];
        });

        // Get unique events for the filter dropdown
        $events = Activity::selectRaw('COALESCE(event, log_name) as event_type')->distinct()->pluck('event_type')->filter()->values();

        // Get users who have caused an action
        $userIds = Activity::where('causer_type', User::class)->whereNotNull('causer_id')->select('causer_id')->distinct()->pluck('causer_id');
        $users = User::whereIn('id', $userIds)->select('id', 'first_name', 'last_name')->orderBy('first_name')->get()->map(function ($u) {
            return ['id' => $u->id, 'name' => "{$u->first_name} {$u->last_name}"];
        });

        return Inertia::render('Modules/Audit/Index', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'user_id', 'event', 'start_date', 'end_date']),
            'events' => $events,
            'users' => $users,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $query = Activity::with('causer')->latest();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'ilike', "%{$search}%")
                    ->orWhereHasMorph('causer', [User::class], function ($q2) use ($search) {
                        $q2->where('first_name', 'ilike', "%{$search}%")
                            ->orWhere('last_name', 'ilike', "%{$search}%");
                    });
            });
        }

        if ($userId = $request->input('user_id')) {
            $query->where('causer_type', User::class)
                ->where('causer_id', $userId);
        }

        if ($event = $request->input('event')) {
            $query->where(function ($q) use ($event) {
                $q->where('event', $event)
                    ->orWhere(function ($q2) use ($event) {
                        $q2->whereNull('event')->where('log_name', $event);
                    });
            });
        }

        if ($startDate = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="system-audit-'.now()->format('Y-m-d').'.csv"',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // Header row
            fputcsv($handle, [
                'ID',
                'Timestamp',
                'Causer',
                'Event',
                'Description',
                'Subject Type',
                'Subject ID',
                'Old Values',
                'New Values',
                'IP Address',
            ]);

            $sanitize = function ($value) {
                if (is_string($value) && preg_match('/^[=\-+@\t\r\n]/', $value)) {
                    return "'".$value;
                }

                return $value;
            };

            // Chunk to avoid memory issues
            $query->chunk(500, function ($activities) use ($handle, $sanitize) {
                foreach ($activities as $activity) {
                    $properties = $activity->properties ? $activity->properties->toArray() : [];
                    $attribute_changes = $activity->attribute_changes ? $activity->attribute_changes->toArray() : [];
                    $old = isset($attribute_changes['old']) ? json_encode($attribute_changes['old']) : '';
                    $attributes = isset($attribute_changes['attributes']) ? json_encode($attribute_changes['attributes']) : '';
                    $ip = $properties['ip'] ?? '';

                    fputcsv($handle, [
                        $activity->id,
                        $activity->created_at->toDateTimeString(),
                        $sanitize($activity->causer ? "{$activity->causer->first_name} {$activity->causer->last_name}" : 'System'),
                        $sanitize($activity->event ?: $activity->log_name),
                        $sanitize($activity->description),
                        $sanitize($activity->subject_type),
                        $activity->subject_id,
                        $sanitize($old),
                        $sanitize($attributes),
                        $sanitize($ip),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
