<?php

namespace App\Modules\DocumentRequests\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentRequestService
{
    /**
     * Store multiple uploaded files for a document request.
     *
     * @param  array<UploadedFile>  $files
     * @return array<string> The stored file paths
     */
    public function storeAttachments(array $files): array
    {
        $paths = [];
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                // Store using default storage disk (e.g. S3)
                $paths[] = $file->store('document_requests/attachments');
            }
        }

        return $paths;
    }

    /**
     * Delete attachments for a document request.
     */
    public function deleteAttachments(array $paths): void
    {
        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
