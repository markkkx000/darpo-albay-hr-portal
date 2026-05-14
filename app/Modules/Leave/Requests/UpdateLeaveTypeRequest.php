<?php

namespace App\Modules\Leave\Requests;

use App\Modules\Leave\Models\LeaveType;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.manage');
    }

    public function rules(): array
    {
        /** @var LeaveType $leaveType */
        $leaveType = $this->route('leaveType');

        return [
            'name' => ['required', 'string', 'max:255', 'unique:leave_types,name,'.$leaveType->id],
            'abbreviation' => ['nullable', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:255'],
            'color_code' => ['nullable', 'string', 'max:50'],
            'is_cumulative' => ['nullable', 'boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
