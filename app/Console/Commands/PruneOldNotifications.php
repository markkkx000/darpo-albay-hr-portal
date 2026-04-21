<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PruneOldNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:prune';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete notifications older than 1 year';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $count = DB::table('notifications')
            ->where('created_at', '<', now()->subYear())
            ->delete();

        $this->info("Deleted {$count} old notifications.");
    }
}
