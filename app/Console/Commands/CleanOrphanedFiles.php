<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Modules\DocumentRequests\Models\DocumentRequest;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('maintenance:clean-orphans {--dry-run : Only list the files that would be deleted}')]
#[Description('Cleans up unreferenced avatars and document request attachments from storage')]
class CleanOrphanedFiles extends Command
{
    public function handle()
    {
        if (! app()->environment('production') && ! $this->option('dry-run')) {
            $this->error('DANGER: You are not in the production environment.');
            $this->error('Since local and production share the same S3 bucket, running this locally will permanently delete production files that are missing from your local database.');
            $this->error('This command can only be executed in production (or locally via --dry-run).');

            return 1;
        }

        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->info('Running in DRY-RUN mode. No files will be deleted.');
        }

        $this->info('Scanning for orphaned avatars...');
        $this->cleanAvatars($isDryRun);

        $this->info('');
        $this->info('Scanning for orphaned document request attachments...');
        $this->cleanDocumentAttachments($isDryRun);

        $this->info('');
        $this->info('Cleanup complete.');
    }

    private function cleanAvatars(bool $isDryRun): void
    {
        $disk = Storage::disk();
        // Get all files from the avatars directory. This includes subdirectories if any exist.
        $allAvatars = collect($disk->allFiles('avatars'))->filter(function ($file) {
            // Ignore hidden/system files if any
            return ! str_starts_with(basename($file), '.');
        })->toArray();

        $dbAvatars = User::withTrashed()
            ->whereNotNull('profile_picture')
            ->pluck('profile_picture')
            ->toArray();

        $orphans = array_diff($allAvatars, $dbAvatars);

        if (empty($orphans)) {
            $this->info('No orphaned avatars found.');

            return;
        }

        $this->warn(count($orphans).' orphaned avatar(s) found.');

        foreach ($orphans as $orphan) {
            $this->line("Found orphan: {$orphan}");
            if (! $isDryRun) {
                $disk->delete($orphan);
                $this->info("Deleted: {$orphan}");
            }
        }
    }

    private function cleanDocumentAttachments(bool $isDryRun): void
    {
        $disk = Storage::disk();
        // Get all files from the attachments directory
        $allAttachments = collect($disk->allFiles('document_requests/attachments'))->filter(function ($file) {
            return ! str_starts_with(basename($file), '.');
        })->toArray();

        $dbFilesLists = DocumentRequest::withTrashed()
            ->whereNotNull('files')
            ->pluck('files')
            ->toArray();

        $referencedFiles = [];
        foreach ($dbFilesLists as $fileArray) {
            if (is_array($fileArray)) {
                foreach ($fileArray as $file) {
                    $referencedFiles[] = $file;
                }
            }
        }

        $orphans = array_diff($allAttachments, $referencedFiles);

        if (empty($orphans)) {
            $this->info('No orphaned document attachments found.');

            return;
        }

        $this->warn(count($orphans).' orphaned document attachment(s) found.');

        foreach ($orphans as $orphan) {
            $this->line("Found orphan: {$orphan}");
            if (! $isDryRun) {
                $disk->delete($orphan);
                $this->info("Deleted: {$orphan}");
            }
        }
    }
}
