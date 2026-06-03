<?php

namespace App\Console\Commands;

use App\Modules\DocumentRequests\Models\DocumentRequest;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanDocumentAttachments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'document-requests:cleanup-attachments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up unreferenced document request attachments in Supabase S3 bucket';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Starting orphan document request attachments cleanup...');

        // Fetch all attachment paths stored in the database, including soft-deleted ones
        $referencedPaths = DocumentRequest::withTrashed()
            ->whereNotNull('files')
            ->pluck('files')
            ->flatten()
            ->filter()
            ->unique()
            ->toArray();

        // Convert full URLs to relative paths just in case they were stored as URLs
        $s3Url = config('filesystems.disks.s3.url');
        $normalizedPaths = array_map(function ($url) use ($s3Url) {
            if ($s3Url && str_starts_with($url, $s3Url)) {
                return ltrim(substr($url, strlen($s3Url)), '/');
            }
            $pathIndex = strpos($url, 'document_requests/attachments/');
            if ($pathIndex !== false) {
                return substr($url, $pathIndex);
            }

            return null;
        }, $referencedPaths);

        $normalizedPaths = array_filter($normalizedPaths);
        $referencedPathsSet = array_flip($normalizedPaths); // For O(1) lookups

        // Scan the S3 bucket's "document_requests/attachments/" directory recursively
        if (! Storage::exists('document_requests/attachments')) {
            $this->info('No document_requests/attachments directory exists in storage.');

            return;
        }

        $allFiles = Storage::allFiles('document_requests/attachments');
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

        $this->info("Completed. Pruned {$prunedCount} orphan document request attachment(s).");
    }
}
