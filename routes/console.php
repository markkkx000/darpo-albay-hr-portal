<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Spatie\Health\Commands\RunHealthChecksCommand;
use Spatie\Health\Commands\ScheduleCheckHeartbeatCommand;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('notifications:prune')->daily();
Schedule::command('leave:cleanup-attachments')->daily();
Schedule::command('document-requests:cleanup-attachments')->daily();
Schedule::command('activitylog:clean')->weekly();
Schedule::command('milestones:check-upcoming')->daily();
Schedule::command('support:clean-deleted-tickets')->daily();
Schedule::command('leave:sync-holidays')->yearlyOn(1, 1, '01:00');
Schedule::command('support-tickets:sync')->everyFiveMinutes();
Schedule::command('employees:prune')->monthly();
Schedule::command(RunHealthChecksCommand::class)->everyMinute();
Schedule::command(ScheduleCheckHeartbeatCommand::class)->everyMinute();
