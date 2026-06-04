<?php

namespace App\Http\Resources;

use App\Modules\DocumentRequests\Models\DocumentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin DocumentRequest
 */
class DocumentRequestResource extends JsonResource
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
            'requested_by' => $this->requested_by,
            'requests' => $this->requests,
            'purpose' => $this->purpose,
            'specify_remittance' => $this->specify_remittance,
            'specify_documents' => $this->specify_documents,
            'specify_other' => $this->specify_other,
            'status' => $this->status,
            'status_reason' => $this->status_reason,
            'received_by' => $this->received_by,
            'released_to' => $this->released_to,
            'released_at' => $this->released_at?->format('Y-m-d H:i:s'),
            'is_electronic' => $this->is_electronic,
            'files' => $this->files,
            'file_urls' => $this->file_urls,
            'acknowledged_at' => $this->acknowledged_at?->format('Y-m-d H:i:s'),
            'acknowledged_ip' => $this->acknowledged_ip,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'employee_number' => $this->user->employee_number,
                ];
            }),
            'requester' => $this->whenLoaded('requester', function () {
                return [
                    'id' => $this->requester->id,
                    'first_name' => $this->requester->first_name,
                    'last_name' => $this->requester->last_name,
                ];
            }),
            'receiver' => $this->whenLoaded('receiver', function () {
                return [
                    'id' => $this->receiver->id,
                    'first_name' => $this->receiver->first_name,
                    'last_name' => $this->receiver->last_name,
                ];
            }),
        ];
    }
}
