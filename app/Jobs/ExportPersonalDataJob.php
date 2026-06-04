<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\PersonalDataExportReady;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class ExportPersonalDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(public User $user)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Gather the user's data
        $data = [
            'personal_information' => $this->user->only([
                'employee_number', 'first_name', 'middle_name', 'last_name', 'email', 'contact_number', 'address', 'sex', 'date_of_birth'
            ]),
            'employment_information' => [
                'division' => $this->user->division?->name,
                'unit' => $this->user->unit?->name,
                'appointment_status' => $this->user->appointmentStatus?->name,
                'hire_date' => $this->user->hire_date?->format('Y-m-d'),
                'years_in_service' => $this->user->years_in_service,
                'plantilla_number' => $this->user->plantilla_number,
                'orig_date_of_appointment' => $this->user->orig_date_of_appointment?->format('Y-m-d'),
                'date_of_latest_appointment' => $this->user->date_of_latest_appointment?->format('Y-m-d'),
                'date_of_assumption' => $this->user->date_of_assumption?->format('Y-m-d'),
                'date_hired_government' => $this->user->date_hired_government?->format('Y-m-d'),
            ],
            'leaves' => $this->user->leaveRequests()
                ->with(['leaveType', 'leaveStatus'])
                ->get()
                ->map(fn($leave) => [
                    'type' => $leave->leaveType?->name,
                    'status' => $leave->leaveStatus?->name,
                    'date_filed' => $leave->date_filed?->format('Y-m-d H:i:s'),
                    'inclusive_dates' => $leave->inclusive_dates,
                    'total_working_days' => $leave->total_working_days,
                ]),
            'document_requests' => \App\Modules\DocumentRequests\Models\DocumentRequest::where('user_id', $this->user->id)
                ->get()
                ->map(fn($req) => [
                    'requests' => $req->requests,
                    'purpose' => $req->purpose,
                    'status' => $req->status,
                    'created_at' => $req->created_at->format('Y-m-d H:i:s'),
                ]),
            'meta' => [
                'exported_at' => now()->format('Y-m-d H:i:s'),
                'format' => 'JSON',
                'version' => '1.0',
            ]
        ];

        // Format and store as JSON
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        
        $filename = "dsar_user_{$this->user->id}.json";
        $path = "dsar/{$filename}";

        Storage::disk('local')->put($path, $json);

        // Generate signed URL valid for 24 hours
        $url = URL::temporarySignedRoute(
            'dsar.download', 
            now()->addHours(24), 
            ['filename' => $filename]
        );

        // Notify user
        $this->user->notify(new PersonalDataExportReady($url));
    }
}
