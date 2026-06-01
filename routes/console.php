<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('notifications:prune')->daily();
Schedule::command('leave:cleanup-attachments')->daily();
Schedule::command('document-requests:cleanup-attachments')->daily();
Schedule::command('activitylog:clean')->daily();
Schedule::command('support:clean-deleted-tickets')->daily();
Schedule::command('leave:sync-holidays')->yearlyOn(1, 1, '01:00');
