<?php

namespace App\Modules\Attendance\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAttendanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.logs.view');
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'clock_in' => ['required', 'date_format:Y-m-d H:i:s'],
            'clock_out' => ['nullable', 'date_format:Y-m-d H:i:s', 'after_or_equal:clock_in'],
        ];
    }
}
