<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\Personnel\Services\MilestoneService;
use App\Notifications\GenericDatabaseNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;

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
    public function handle(MilestoneService $milestoneService)
    {
        $this->info('Checking for upcoming milestones...');

        $targetDate = Carbon::today()->addDays(30)->format('Y-m-d');

        $adminsToNotify = User::role(['super_admin', 'hr_admin', 'hr_staff'])->get();
        if ($adminsToNotify->isEmpty()) {
            $this->warn('No admins found to notify.');

            return;
        }

        $notificationCount = 0;

        // Get all milestones for this year
        $year = Carbon::now()->year;
        $milestones = $milestoneService->getMilestonesForYear($year);

        foreach ($milestones as $milestone) {
            // We only notify if the milestone date is exactly 30 days from today
            if ($milestone['date'] === $targetDate) {
                $empId = $milestone['emp_id'];
                $empName = $milestone['name'];

                if ($milestone['type'] === 'loyalty') {
                    $m = $milestone['milestone'];
                    $this->notifyAdmins(
                        $adminsToNotify,
                        'Loyalty Award',
                        'Update',
                        "{$empName} has reached {$m}-year Loyalty Award",
                        $empId
                    );
                    $notificationCount++;
                    $this->info("Loyalty award notification queued for {$empName} ({$m} years).");
                } elseif ($milestone['type'] === 'salary') {
                    $mSal = $milestone['milestone'];
                    $this->notifyAdmins(
                        $adminsToNotify,
                        'Salary Update',
                        'Update',
                        "{$empName} is due for a {$mSal}-year salary update",
                        $empId
                    );
                    $notificationCount++;
                    $this->info("Salary update notification queued for {$empName} ({$mSal} years).");
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
