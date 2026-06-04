<?php

namespace App\Listeners;

use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Log;

class SendFailedJobAlert
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(JobFailed $event): void
    {
        Log::channel('audit')->critical('A background job has failed permanently', [
            'connection' => $event->connectionName,
            'queue' => $event->job->getQueue(),
            'job' => $event->job->resolveName(),
            'exception' => $event->exception->getMessage(),
            'payload' => $event->job->payload(),
        ]);
    }
}
