<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'leave_type_id' => $this->leave_type_id,
            'leave_status_id' => $this->leave_status_id,
            'created_by' => $this->created_by,
            'approved_by' => $this->approved_by,
            'date_filed' => $this->date_filed?->format('Y-m-d H:i:s'),
            'inclusive_dates' => $this->inclusive_dates,
            'total_working_days' => $this->total_working_days,
            'is_out_patient' => $this->is_out_patient,
            'details' => $this->details,
            'commutation' => $this->commutation,
            'attachments' => $this->attachments,
            'status_remarks' => $this->status_remarks,
            'approved_at' => $this->approved_at?->format('Y-m-d H:i:s'),
            'cancelled_at' => $this->cancelled_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),

            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'employee_number' => $this->user->employee_number,
                    'division' => $this->user->division,
                    'position' => $this->user->position,
                ];
            }),
            'leave_type' => $this->whenLoaded('leaveType'),
            'leave_status' => $this->whenLoaded('leaveStatus'),
            'created_by_user' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'first_name' => $this->createdBy->first_name,
                    'last_name' => $this->createdBy->last_name,
                ];
            }),
            'approved_by_user' => $this->whenLoaded('approvedBy', function () {
                return [
                    'id' => $this->approvedBy->id,
                    'first_name' => $this->approvedBy->first_name,
                    'last_name' => $this->approvedBy->last_name,
                ];
            }),
        ];
    }
}
