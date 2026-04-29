<?php

namespace App\Modules\Leave\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.encode');
    }

    protected function prepareForValidation()
    {
        if ($this->has('specific_dates') && is_array($this->specific_dates) && count($this->specific_dates) > 0) {
            $dates = collect($this->specific_dates)->sort()->values();
            $this->merge([
                'start_date' => $dates->first(),
                'end_date' => $dates->last(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'leave_status_id' => ['required', 'exists:leave_statuses,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'days_requested' => ['required', 'numeric', 'min:0'],
            'date_received' => ['nullable', 'date'],
            'date_approved' => ['nullable', 'date'],
            'approved_by_id' => ['nullable', 'exists:users,id'],
            'leave_details' => ['nullable', 'string', 'max:255'],
            'commutation_requested' => ['boolean'],
            'is_filed' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'specific_dates' => ['nullable', 'array'],
            'specific_dates.*' => ['date'],
        ];
    }
}
