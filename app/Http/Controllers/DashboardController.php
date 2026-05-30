<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\DocumentRequests\Models\DocumentRequest;
use App\Modules\Leave\Models\Holiday;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $userId = $user->id;

        // 1. Permission-driven Layout Checks
        $isSuperAdmin = $user->can('roles.manage');
        $isHR = $user->can('personnel.view') || $user->can('leave.manage');

        $adminData = null;
        $hrData = null;
        $employeeData = null;

        // 2. Fetch Admin Data (if has permission)
        if ($isSuperAdmin) {
            $totalUsers = User::count();

            // Active sessions (based on last_seen_at timestamp)
            $activeSessions = User::where('last_seen_at', '>=', now()->subMinutes(15))->count();

            // Dynamic System Health Check
            $dbHealth = true;
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                $dbHealth = false;
            }

            $cacheHealth = true;
            try {
                Cache::put('health_check', true, 5);
                $cacheHealth = Cache::get('health_check') === true;
            } catch (\Exception $e) {
                $cacheHealth = false;
            }

            $storageHealth = is_writable(storage_path());

            $healthScore = 0;
            if ($dbHealth) {
                $healthScore += 33;
            }
            if ($cacheHealth) {
                $healthScore += 33;
            }
            if ($storageHealth) {
                $healthScore += 34;
            }

            // Admin Recent Activities: Fetch from Spatie Activitylog
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

            $adminData = [
                'total_users' => $totalUsers,
                'active_sessions' => $activeSessions,
                'system_health' => $healthScore === 100 ? 'Healthy' : "{$healthScore}%",
                'recentActivity' => $recentActivity,
            ];
        }

        // 3. Fetch HR Data (if has permission or is super admin)
        if ($isSuperAdmin || $isHR) {
            $totalEmployees = User::count();

            // Count pending leaves (resolve via status or string name)
            $pendingLeaves = LeaveRequest::whereHas('leaveStatus', function ($query) {
                $query->where('name', 'ilike', '%pending%');
            })->count();

            // Count unique clocked-in users today
            $activeToday = Attendance::whereDate('date', now()->toDateString())
                ->distinct('user_id')
                ->count();

            // HR Recent Activities: Leaves filed & Clock-ins
            $recentLeaves = LeaveRequest::with('user', 'leaveType')
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($l) {
                    $name = $l->user ? "{$l->user->first_name} {$l->user->last_name}" : 'Unknown';
                    $type = $l->leaveType ? $l->leaveType->name : 'Leave';

                    return [
                        'id' => 'leave_'.$l->id,
                        'type' => 'leave_filed',
                        'title' => 'Leave Filed',
                        'description' => "{$name} filed a request for {$type}.",
                        'time' => $l->created_at ? $l->created_at->diffForHumans() : 'Just now',
                        'timestamp' => $l->created_at ? $l->created_at->timestamp : now()->timestamp,
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

            $recentActivity = $recentLeaves->concat($recentAttendance)
                ->sortByDesc(function ($item) {
                    return $item['timestamp'];
                })
                ->values()
                ->all();

            $hrData = [
                'total_employees' => $totalEmployees,
                'pending_leaves' => $pendingLeaves,
                'active_today' => $activeToday,
                'recentActivity' => $recentActivity,
            ];
        }

        // 4. Fetch Employee Data (For personal views of all users)
        // Clock in/out today status
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

        // Fetch VL, SL, FL leave balances having balance > 0
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

        // Action Items
        // 1. Pending Leaves
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

        // 2. Document Requests (Active / In-progress)
        $pendingMyDocs = DocumentRequest::where('user_id', $userId)
            ->whereNotIn('status', ['Completed', 'Rejected', 'Cancelled'])
            ->get()
            ->map(function ($d) {
                $isReleased = $d->status === 'Released';
                $docs = is_array($d->requests) ? implode(', ', $d->requests) : 'Document';

                // Determine description based on status
                if ($d->status === 'Pending') {
                    $desc = "Your request for {$docs} is pending HR review.";
                } elseif ($d->status === 'Released') {
                    $desc = "Your request for {$docs} is ready. Please acknowledge receipt.";
                } else {
                    // E.g., Received, Processing
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

        // Calendar: Events & Holidays
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

        // Latest Announcements
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

        $employeeData = [
            'today_status' => $todayStatus,
            'today_time' => $todayTime,
            'leave_balances' => $leaveBalances,
            'action_items' => $actionItems,
            'calendar_events' => $calendarEvents,
            'latest_announcements' => $latestAnnouncements,
        ];

        return Inertia::render('dashboard', [
            'adminData' => $adminData,
            'hrData' => $hrData,
            'employeeData' => $employeeData,
        ]);
    }
}
