<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('employees:prune')]
#[Description('Permanently delete archived employee records older than 5 years')]
class PruneArchivedEmployeesCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $cutoffDate = now()->subYears(5);

        $count = User::onlyTrashed()
            ->where('deleted_at', '<=', $cutoffDate)
            ->count();

        if ($count === 0) {
            $this->info('No archived employees older than 5 years found.');

            return;
        }

        User::onlyTrashed()
            ->where('deleted_at', '<=', $cutoffDate)
            ->forceDelete();

        $this->info("Successfully pruned {$count} archived employee(s).");
    }
}
