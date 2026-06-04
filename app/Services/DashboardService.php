<?php

namespace App\Services;

use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\DocumentRequests\Models\DocumentRequest;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use App\Modules\Personnel\Services\MilestoneService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

class DashboardService
{
    public function __construct(
        protected MilestoneService $milestoneService
    ) {}

    public function getAdminMetrics(User $user): array
    {
        return Cache::remember('dashboard.admin_metrics', now()->addMinutes(5), function () {
            $totalUsers = User::count();
            $activeSessions = User::where('last_seen_at', '>=', now()->subMinutes(15))->count();
            $failedJobs = DB::table('failed_jobs')->count();

            $recentActivity = Activity::with('causer')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($activity) {
                    $causer = $activity->causer;
                    $name = $causer ? "{$causer->first_name} {$causer->last_name}" : 'System';

                    return [
                        'id' => 'act_'.$activity->id,
                        'type' => 'system_activity',
                        'title' => 'System Audit',
                        'description' => "{$name}: {$activity->description}",
                        'time' => $activity->created_at ? $activity->created_at->diffForHumans() : 'Just now',
                        'timestamp' => $activity->created_at ? $activity->created_at->timestamp : now()->timestamp,
                    ];
                })
                ->all();

            return [
                'total_users' => $totalUsers,
                'active_sessions' => $activeSessions,
                'failed_jobs' => $failedJobs,
                'recentActivity' => $recentActivity,
            ];
        });
    }

    public function getHrMetrics(User $user): array
    {
        return Cache::remember('dashboard.hr_metrics', now()->addMinutes(5), function () {
            $totalEmployees = User::count();

            $pendingLeaves = LeaveRequest::whereHas('leaveStatus', function ($query) {
                $query->where('name', 'ilike', '%pending%');
            })->count();

            $pendingDocsCount = DocumentRequest::where('status', 'Pending')->count();

            $activeToday = Attendance::whereDate('date', now()->toDateString())
                ->distinct('user_id')
                ->count();

            $hrPendingLeaves = LeaveRequest::with(['user', 'leaveType'])
                ->whereHas('leaveStatus', function ($query) {
                    $query->where('name', 'ilike', '%pending%');
                })
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($l) {
                    $name = $l->user ? "{$l->user->first_name} {$l->user->last_name}" : 'Unknown';
                    $type = $l->leaveType ? $l->leaveType->name : 'Leave';

                    return [
                        'id' => 'hr_leave_'.$l->id,
                        'type' => 'leave_pending',
                        'title' => 'Leave Approval Required',
                        'description' => "{$name} filed a request for {$type} pending approval.",
                        'timestamp' => $l->created_at ? $l->created_at->timestamp : now()->timestamp,
                        'url' => route('leave.show', $l->id),
                        'action_text' => 'Review Request',
                    ];
                });

            $hrPendingDocs = DocumentRequest::with('user')
                ->where('status', 'Pending')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($d) {
                    $name = $d->user ? "{$d->user->first_name} {$d->user->last_name}" : 'Unknown';
                    $docs = is_array($d->requests) ? implode(', ', $d->requests) : 'Document';

                    return [
                        'id' => 'hr_doc_'.$d->id,
                        'type' => 'doc_pending',
                        'title' => 'Document Request',
                        'description' => "{$name} requested: {$docs}.",
                        'timestamp' => $d->created_at ? $d->created_at->timestamp : now()->timestamp,
                        'url' => route('documentrequests.show', $d->id),
                        'action_text' => 'Process Request',
                    ];
                });

            $hrActionItems = $hrPendingLeaves->concat($hrPendingDocs)
                ->sortByDesc('timestamp')
                ->take(6)
                ->values()
                ->all();

            $recentLeaves = LeaveRequest::with(['user', 'leaveType'])
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($l) {
                    $name = $l->user ? "{$l->user->first_name} {$l->user->last_name}" : 'Unknown';
                    $type = $l->leaveType ? $l->leaveType->name : 'Leave';
                    $time = $l->date_filed ?? $l->created_at;

                    return [
                        'id' => 'leave_'.$l->id,
                        'type' => 'leave_filed',
                        'title' => 'Leave Filed',
                        'description' => "{$name} filed a request for {$type}.",
                        'time' => $time ? $time->diffForHumans() : 'Just now',
                        'timestamp' => $time ? $time->timestamp : now()->timestamp,
                    ];
                });

            $recentDocs = DocumentRequest::with('user')
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($d) {
                    $name = $d->user ? "{$d->user->first_name} {$d->user->last_name}" : 'Unknown';
                    $docs = is_array($d->requests) ? implode(', ', $d->requests) : 'Document';

                    return [
                        'id' => 'doc_log_'.$d->id,
                        'type' => 'doc_requested',
                        'title' => 'Document Requested',
                        'description' => "{$name} requested: {$docs}.",
                        'time' => $d->created_at ? $d->created_at->diffForHumans() : 'Just now',
                        'timestamp' => $d->created_at ? $d->created_at->timestamp : now()->timestamp,
                    ];
                });

            $recentAttendance = Attendance::with('user')
                ->latest('updated_at')
                ->take(3)
                ->get()
                ->map(function ($att) {
                    $name = $att->user ? "{$att->user->first_name} {$att->user->last_name}" : 'Unknown';
                    $clocks = [
                        'in (AM)' => $att->am_clock_in,
                        'out (AM)' => $att->am_clock_out,
                        'in (PM)' => $att->pm_clock_in,
                        'out (PM)' => $att->pm_clock_out,
                    ];
                    $latestClockTime = null;
                    $action = 'in (AM)';
                    foreach ($clocks as $key => $time) {
                        if ($time && (is_null($latestClockTime) || $time->gt($latestClockTime))) {
                            $latestClockTime = $time;
                            $action = $key;
                        }
                    }
                    $activityTime = $latestClockTime ?? $att->updated_at;

                    return [
                        'id' => 'att_'.$att->id.'_'.$action,
                        'type' => 'attendance_clock',
                        'title' => 'Attendance Log',
                        'description' => "{$name} clocked {$action}.",
                        'time' => $activityTime ? $activityTime->diffForHumans() : 'Just now',
                        'timestamp' => $activityTime ? $activityTime->timestamp : now()->timestamp,
                    ];
                });

            $recentActivity = $recentLeaves->concat($recentAttendance)->concat($recentDocs)
                ->sortByDesc(function ($item) {
                    return $item['timestamp'];
                })
                ->take(6)
                ->values()
                ->all();

            return [
                'total_employees' => $totalEmployees,
                'pending_leaves' => $pendingLeaves,
                'pending_docs' => $pendingDocsCount,
                'active_today' => $activeToday,
                'recentActivity' => $recentActivity,
                'action_items' => $hrActionItems,
                'upcoming_milestones' => $this->milestoneService->getUpcomingMilestones(30),
            ];
        });
    }

    public function getEmployeeData(User $user): array
    {
        $userId = $user->id;

        $todayAttendance = Attendance::where('user_id', $userId)
            ->whereDate('date', now()->toDateString())
            ->first();

        $todayStatus = 'Not Clocked In';
        $todayTime = '--:-- --';
        if ($todayAttendance) {
            if ($todayAttendance->pm_clock_out) {
                $todayStatus = 'Completed';
                $todayTime = $todayAttendance->pm_clock_out->timezone('Asia/Manila')->format('h:i A');
            } elseif ($todayAttendance->pm_clock_in) {
                $todayStatus = 'Clocked In (PM)';
                $todayTime = $todayAttendance->pm_clock_in->timezone('Asia/Manila')->format('h:i A');
            } elseif ($todayAttendance->am_clock_out) {
                $todayStatus = 'Clocked Out (AM)';
                $todayTime = $todayAttendance->am_clock_out->timezone('Asia/Manila')->format('h:i A');
            } elseif ($todayAttendance->am_clock_in) {
                $todayStatus = 'Clocked In (AM)';
                $todayTime = $todayAttendance->am_clock_in->timezone('Asia/Manila')->format('h:i A');
            }
        }

        $leaveBalances = LeaveCredit::with('leaveType')
            ->where('user_id', $userId)
            ->where('year', now()->year)
            ->where('balance', '>', 0)
            ->get()
            ->map(function ($lc) {
                return [
                    'type' => $lc->leaveType ? $lc->leaveType->name : 'Leave',
                    'balance' => (float) $lc->balance,
                ];
            })
            ->values()
            ->all();

        $pendingMyLeaves = LeaveRequest::with('leaveType')
            ->where('user_id', $userId)
            ->whereHas('leaveStatus', function ($query) {
                $query->where('name', 'ilike', '%pending%');
            })
            ->get()
            ->map(function ($l) {
                $type = $l->leaveType ? $l->leaveType->name : 'Leave';

                return [
                    'id' => 'leave_'.$l->id,
                    'type' => 'leave_pending',
                    'title' => 'Pending Leave',
                    'description' => "Your {$type} request has been encoded and is pending final approval.",
                    'timestamp' => $l->created_at ? $l->created_at->timestamp : now()->timestamp,
                    'url' => route('leave.show', $l->id),
                    'action_text' => 'View Request',
                ];
            });

        $pendingMyDocs = DocumentRequest::where('user_id', $userId)
            ->whereNotIn('status', ['Completed', 'Rejected', 'Cancelled'])
            ->get()
            ->map(function ($d) {
                $isReleased = $d->status === 'Released';
                $docs = is_array($d->requests) ? implode(', ', $d->requests) : 'Document';

                if ($d->status === 'Pending') {
                    $desc = "Your request for {$docs} is pending HR review.";
                } elseif ($d->status === 'Released') {
                    $desc = "Your request for {$docs} is ready. Please acknowledge receipt.";
                } else {
                    $desc = "Your request for {$docs} is currently being processed by HR.";
                }

                return [
                    'id' => 'doc_'.$d->id,
                    'type' => $isReleased ? 'doc_released' : 'doc_pending',
                    'title' => $isReleased ? 'Document Ready' : 'Document Requested',
                    'description' => $desc,
                    'timestamp' => $d->updated_at ? $d->updated_at->timestamp : ($d->created_at ? $d->created_at->timestamp : now()->timestamp),
                    'url' => route('documentrequests.show', $d->id),
                    'action_text' => $isReleased ? 'Acknowledge' : 'View Status',
                ];
            });

        $actionItems = $pendingMyLeaves->concat($pendingMyDocs)
            ->sortByDesc('timestamp')
            ->values()
            ->all();

        $upcomingHolidays = Holiday::where('date', '>=', now()->toDateString())
            ->orderBy('date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($h) {
                return [
                    'id' => 'holiday_'.$h->id,
                    'type' => 'holiday',
                    'title' => $h->name,
                    'date' => $h->date->format('M j, Y'),
                    'timestamp' => $h->date->timestamp,
                ];
            });

        $upcomingEvents = Announcement::forUser($user)
            ->where('is_event', true)
            ->where('event_date', '>=', now()->toDateString())
            ->orderBy('event_date', 'asc')
            ->take(5)
            ->get()
            ->map(function ($e) {
                return [
                    'id' => 'event_'.$e->id,
                    'type' => 'event',
                    'title' => $e->title,
                    'date' => $e->event_date->format('M j, Y'),
                    'timestamp' => $e->event_date->timestamp,
                ];
            });

        $calendarEvents = $upcomingHolidays->concat($upcomingEvents)
            ->sortBy('timestamp')
            ->take(5)
            ->values()
            ->all();

        $latestAnnouncements = Announcement::forUser($user)
            ->with('author')
            ->latest('published_at')
            ->take(5)
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'content' => strip_tags($a->content),
                    'author' => $a->author ? $a->author->first_name.' '.$a->author->last_name : 'HR',
                    'date' => $a->published_at ? $a->published_at->diffForHumans() : 'Recently',
                ];
            })
            ->values()
            ->all();

        return [
            'today_status' => $todayStatus,
            'today_time' => $todayTime,
            'leave_balances' => $leaveBalances,
            'action_items' => $actionItems,
            'calendar_events' => $calendarEvents,
            'latest_announcements' => $latestAnnouncements,
        ];
    }
}
