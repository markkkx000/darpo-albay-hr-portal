<?php

namespace App\Modules\Personnel\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\ExportPersonalDataJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PersonalDataExportController extends Controller
{
    /**
     * Request an export of personal data.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Prevent spamming
        $key = 'dsar_export_'.$user->id;
        if (cache()->has($key)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'You have already requested a data export recently. Please check your email or try again later.']);

            return back();
        }

        // Lock for 1 hour
        cache()->put($key, true, now()->addHour());

        ExportPersonalDataJob::dispatch($user);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Your personal data export has been queued. You will receive an email with a download link once it is ready.']);

        return back();
    }

    /**
     * Download the exported data file.
     */
    public function download(Request $request, string $filename)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'This download link is invalid or has expired.');
        }

        $user = Auth::user();

        // Ensure the filename belongs to the authenticated user
        if ($filename !== "dsar_user_{$user->id}.json") {
            abort(403, 'Unauthorized access to this file.');
        }

        $path = "dsar/{$filename}";

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'Export file not found. It may have expired.');
        }

        return Storage::disk('local')->download($path);
    }
}
