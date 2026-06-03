<?php

namespace App\Console\Commands;

use App\Modules\Leave\Models\LeaveRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanLeaveAttachments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leave:cleanup-attachments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up unreferenced leave request attachments in Supabase S3 bucket';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Starting orphan leave request attachments cleanup...');

        // Fetch all attachment URLs stored in the database (including soft deleted)
        $referencedUrls = LeaveRequest::withTrashed()
            ->whereNotNull('attachment_urls')
            ->pluck('attachment_urls')
            ->flatten()
            ->filter()
            ->unique()
            ->toArray();

        // Convert full URLs to relative S3 paths
        $s3Url = config('filesystems.disks.s3.url');
        $referencedPaths = array_map(function ($url) use ($s3Url) {
            if ($s3Url && str_starts_with($url, $s3Url)) {
                return ltrim(substr($url, strlen($s3Url)), '/');
            }
            $pathIndex = strpos($url, 'leaves/attachments/');
            if ($pathIndex !== false) {
                return substr($url, $pathIndex);
            }

            return null;
        }, $referencedUrls);

        $referencedPaths = array_filter($referencedPaths);
        $referencedPathsSet = array_flip($referencedPaths); // For O(1) lookups

        // Scan the S3 bucket's "leaves/attachments/" directory recursively
        if (! Storage::exists('leaves/attachments')) {
            $this->info('No leaves/attachments directory exists in storage.');

            return;
        }

        $allFiles = Storage::allFiles('leaves/attachments');
        $prunedCount = 0;

        foreach ($allFiles as $file) {
            // Check if file is in database
            if (isset($referencedPathsSet[$file])) {
                continue;
            }

            // Avoid race conditions with files currently being uploaded: only delete files older than 24 hours.
            $lastModified = Storage::lastModified($file);
            if (now()->timestamp - $lastModified < 86400) {
                continue;
            }

            Storage::delete($file);
            $prunedCount++;
            $this->line("Pruned orphan file: {$file}");
        }

        $this->info("Completed. Pruned {$prunedCount} orphan leave request attachment(s).");
    }
}
