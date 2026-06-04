<?php

namespace App\Http\Resources;

use App\Modules\Leave\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin LeaveRequest
 */
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
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'days_requested' => $this->days_requested,
            'date_received' => $this->date_received?->format('Y-m-d'),
            'date_approved' => $this->date_approved?->format('Y-m-d'),
            'leave_details' => $this->leave_details,
            'commutation_requested' => $this->commutation_requested,
            'is_filed' => $this->is_filed,
            'notes' => $this->notes,
            'attachment_urls' => $this->attachment_urls,
            'approved_by_official' => $this->approved_by_official,
            'specific_dates' => $this->specific_dates,
            'salary' => $this->salary,
            'date_filed' => $this->date_filed?->format('Y-m-d'),
            'days_with_pay' => $this->days_with_pay,
            'days_without_pay' => $this->days_without_pay,
            'others_pay_remarks' => $this->others_pay_remarks,
            'leave_detail_type' => $this->leave_detail_type,
            'leave_detail_remarks' => $this->leave_detail_remarks,
            'has_attachments' => $this->has_attachments,
            'supporting_documents' => $this->supporting_documents,
            'maternity_allocation_details' => $this->maternity_allocation_details,

            // Appends
            'pay_status' => $this->pay_status,

            // Timestamps
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
                    'avatar' => $this->user->avatar,
                ];
            }),
            'leave_type' => $this->whenLoaded('leaveType'),
            'leave_status' => $this->whenLoaded('leaveStatus'),
            'created_by' => $this->whenLoaded('createdBy', function () {
                return [
                    'id' => $this->createdBy->id,
                    'first_name' => $this->createdBy->first_name,
                    'last_name' => $this->createdBy->last_name,
                ];
            }),
            'approved_by' => $this->whenLoaded('approvedBy', function () {
                return [
                    'id' => $this->approvedBy->id,
                    'first_name' => $this->approvedBy->first_name,
                    'last_name' => $this->approvedBy->last_name,
                ];
            }),
        ];
    }
}
