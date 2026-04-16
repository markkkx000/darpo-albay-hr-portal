<?php

namespace App\Modules\Attendance\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClockOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('attendance.clock');
    }

    public function rules(): array
    {
        return [];
    }
}
