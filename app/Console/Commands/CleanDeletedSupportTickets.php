<?php

namespace App\Console\Commands;

use App\Core\Services\GitHubSupportService;
use App\Models\SupportTicket;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('support:clean-deleted-tickets')]
#[Description('Deletes local support tickets that no longer exist on GitHub')]
class CleanDeletedSupportTickets extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(GitHubSupportService $github)
    {
        $tickets = SupportTicket::all();
        $deletedCount = 0;

        foreach ($tickets as $ticket) {
            $exists = $github->issueExists($ticket->github_issue_id);

            // If we specifically got a 404 (false), it's deleted. Null means API error.
            if ($exists === false) {
                $ticket->delete();
                $deletedCount++;
                $this->info("Deleted orphaned ticket ID {$ticket->id} (GitHub Issue #{$ticket->github_issue_id})");
            }
        }

        $this->info("Cleanup complete. Deleted {$deletedCount} orphaned tickets.");
    }
}
