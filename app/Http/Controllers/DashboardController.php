<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Modules\Announcements\Models\Announcement;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Leave\Models\LeaveCredit;
use App\Modules\Leave\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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

            // Active sessions (database driver check)
            $activeSessions = DB::table('sessions')
                ->whereNotNull('user_id')
                ->where('last_activity', '>=', now()->subMinutes(15)->getTimestamp())
                ->distinct('user_id')
                ->count();

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

            // Admin Recent Activities: User registrations and Announcement publications
            $recentUsers = User::latest()->take(3)->get()->map(function ($u) {
                return [
                    'id' => 'user_'.$u->id,
                    'type' => 'user_registered',
                    'title' => 'New User Registered',
                    'description' => "{$u->first_name} {$u->last_name} ({$u->employee_number}) joined the portal.",
                    'time' => $u->created_at ? $u->created_at->diffForHumans() : 'Just now',
                    'timestamp' => $u->created_at ? $u->created_at->timestamp : now()->timestamp,
                ];
            });

            $recentAnnouncements = Announcement::latest()->take(2)->get()->map(function ($a) {
                return [
                    'id' => 'ann_'.$a->id,
                    'type' => 'announcement_published',
                    'title' => 'Announcement Published',
                    'description' => "\"{$a->title}\" was created.",
                    'time' => $a->created_at ? $a->created_at->diffForHumans() : 'Just now',
                    'timestamp' => $a->created_at ? $a->created_at->timestamp : now()->timestamp,
                ];
            });

            $recentActivity = $recentUsers->concat($recentAnnouncements)
                ->sortByDesc(function ($item) {
                    return $item['timestamp'];
                })
                ->values()
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
                    $isClockOut = ! is_null($att->clock_out);
                    $activityTime = $isClockOut ? $att->updated_at : $att->created_at;

                    return [
                        'id' => 'att_'.$att->id.($isClockOut ? '_out' : '_in'),
                        'type' => 'attendance_clock',
                        'title' => 'Attendance Log',
                        'description' => "{$name} clocked ".($isClockOut ? 'out.' : 'in.'),
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
            if ($todayAttendance->clock_out) {
                $todayStatus = 'Completed';
                $todayTime = $todayAttendance->clock_out->timezone('Asia/Manila')->format('h:i A');
            } else {
                $todayStatus = 'Clocked In';
                $todayTime = $todayAttendance->clock_in->timezone('Asia/Manila')->format('h:i A');
            }
        }

        // Fetch VL and SL leave balances having balance > 0
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

        // Working days this month
        $workingDaysThisMonth = Attendance::where('user_id', $userId)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->count();

        // Employee Recent Activities: Personal clock-ins and leaves
        $myLeaves = LeaveRequest::with('leaveType')
            ->where('user_id', $userId)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($l) {
                $type = $l->leaveType ? $l->leaveType->name : 'Leave';

                return [
                    'id' => 'my_leave_'.$l->id,
                    'type' => 'my_leave',
                    'title' => 'Leave Request',
                    'description' => "Submitted a {$type} request.",
                    'time' => $l->created_at ? $l->created_at->diffForHumans() : 'Just now',
                    'timestamp' => $l->created_at ? $l->created_at->timestamp : now()->timestamp,
                ];
            });

        $myAttendance = Attendance::where('user_id', $userId)
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(function ($att) {
                $isClockOut = ! is_null($att->clock_out);
                $activityTime = $isClockOut ? $att->updated_at : $att->created_at;

                return [
                    'id' => 'my_att_'.$att->id.($isClockOut ? '_out' : '_in'),
                    'type' => 'my_attendance',
                    'title' => 'Attendance log',
                    'description' => 'Clocked '.($isClockOut ? 'out.' : 'in.'),
                    'time' => $activityTime ? $activityTime->diffForHumans() : 'Just now',
                    'timestamp' => $activityTime ? $activityTime->timestamp : now()->timestamp,
                ];
            });

        $recentActivity = $myLeaves->concat($myAttendance)
            ->sortByDesc(function ($item) {
                return $item['timestamp'];
            })
            ->values()
            ->all();

        $employeeData = [
            'today_status' => $todayStatus,
            'today_time' => $todayTime,
            'leave_balances' => $leaveBalances,
            'this_month_working_days' => $workingDaysThisMonth,
            'recentActivity' => $recentActivity,
        ];

        return Inertia::render('dashboard', [
            'adminData' => $adminData,
            'hrData' => $hrData,
            'employeeData' => $employeeData,
        ]);
    }
}
