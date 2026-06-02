<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Notifications\GenericDatabaseNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckUpcomingMilestones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'milestones:check-upcoming';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for upcoming loyalty and salary milestones (30 days in advance) and send notifications';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for upcoming milestones...');

        $year = Carbon::now()->year;
        $targetDate = Carbon::today()->addDays(30)->format('Y-m-d');
        
        $employees = User::where('is_active', true)->get();

        $adminsToNotify = User::role(['super_admin', 'hr_admin', 'hr_staff'])->get();
        if ($adminsToNotify->isEmpty()) {
            $this->warn('No admins found to notify.');
            return;
        }

        $notificationCount = 0;

        foreach ($employees as $emp) {
            // Loyalty Milestones
            $startDate = $emp->date_hired_government ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
            if ($startDate) {
                $startYear = Carbon::parse($startDate)->year;
                $m = $year - $startYear;
                if ($m >= 10 && ($m === 10 || ($m - 10) % 5 === 0)) {
                    $milestoneDate = Carbon::parse($startDate)->addYears($m)->format('Y-m-d');
                    
                    if ($milestoneDate === $targetDate) {
                        $this->notifyAdmins(
                            $adminsToNotify,
                            'Loyalty Award',
                            'Update',
                            "{$emp->name} has reached {$m}-year Loyalty Award",
                            $emp->id
                        );
                        $notificationCount++;
                        $this->info("Loyalty award notification queued for {$emp->name} ({$m} years).");
                    }
                }
            }

            // Salary Milestones
            $baseDate = $emp->date_of_latest_appointment ?? $emp->orig_date_of_appointment ?? $emp->hire_date;
            if ($baseDate) {
                $baseYear = Carbon::parse($baseDate)->year;
                $mSal = $year - $baseYear;
                if ($mSal >= 3 && $mSal % 3 === 0) {
                    $milestoneDate = Carbon::parse($baseDate)->addYears($mSal)->format('Y-m-d');
                    
                    if ($milestoneDate === $targetDate) {
                        $this->notifyAdmins(
                            $adminsToNotify,
                            'Salary Update',
                            'Update',
                            "{$emp->name} is due for a {$mSal}-year salary update",
                            $emp->id
                        );
                        $notificationCount++;
                        $this->info("Salary update notification queued for {$emp->name} ({$mSal} years).");
                    }
                }
            }
        }

        $this->info("Completed milestone checks. Total notifications queued: {$notificationCount}");
    }

    /**
     * Send notification to a list of admin users.
     */
    private function notifyAdmins($admins, $title, $type, $message, $employeeId = null)
    {
        $notificationData = [
            'title' => $title,
            'type' => $type,
            'message' => $message,
        ];
        
        if ($employeeId) {
            $notificationData['employee_id'] = $employeeId;
        }

        foreach ($admins as $admin) {
            $admin->notify(new GenericDatabaseNotification($notificationData));
        }
    }
}
