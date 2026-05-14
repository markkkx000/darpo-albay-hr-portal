<?php

namespace App\Modules\Leave\Requests;

use App\Modules\Leave\Models\LeaveStatus;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.manage');
    }

    public function rules(): array
    {
        /** @var LeaveStatus $leaveStatus */
        $leaveStatus = $this->route('leaveStatus');

        return [
            'name' => ['required', 'string', 'max:255', 'unique:leave_statuses,name,'.$leaveStatus->id],
            'is_active' => ['boolean'],
        ];
    }
}
