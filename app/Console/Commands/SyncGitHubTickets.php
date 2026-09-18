<?php

namespace App\Console\Commands;

use App\Modules\SupportTickets\Models\SupportTicket;
use App\Modules\SupportTickets\Services\GitHubSupportService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('support-tickets:sync')]
#[Description('Sync the status of open support tickets from GitHub')]
class SyncGitHubTickets extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(GitHubSupportService $github): int
    {
        $openTickets = SupportTicket::where('status', 'open')->get();

        if ($openTickets->isEmpty()) {
            $this->info('No open support tickets to sync.');

            return self::SUCCESS;
        }

        $this->info("Syncing {$openTickets->count()} open support tickets...");

        $syncedCount = 0;
        foreach ($openTickets as $ticket) {
            $issue = $github->getIssue($ticket->github_issue_id);
            if ($issue && isset($issue['state']) && $issue['state'] !== $ticket->status) {
                $ticket->update(['status' => $issue['state']]);
                $syncedCount++;
                $this->info("Ticket #{$ticket->id} status updated to {$issue['state']}.");
            }
        }

        $this->info("Sync completed. {$syncedCount} tickets updated.");

        return self::SUCCESS;
    }
}
