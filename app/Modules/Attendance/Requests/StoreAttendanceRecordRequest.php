<?php

namespace App\Modules\Attendance\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.logs.view');
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'date' => ['required', 'date'],
            'am_clock_in' => ['nullable', 'date_format:Y-m-d H:i:s'],
            'am_clock_out' => ['nullable', 'date_format:Y-m-d H:i:s', 'after_or_equal:am_clock_in'],
            'pm_clock_in' => ['nullable', 'date_format:Y-m-d H:i:s', 'after_or_equal:am_clock_out'],
            'pm_clock_out' => ['nullable', 'date_format:Y-m-d H:i:s', 'after_or_equal:pm_clock_in'],
        ];
    }
}
