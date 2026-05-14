<?php

namespace App\Modules\Leave\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTardinessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.manage');
    }

    public function rules(): array
    {
        return [
            'year' => ['required', 'integer'],
            'month' => ['required', 'integer', 'between:1,12'],
            'tardiness_count' => ['required', 'integer', 'min:0'],
            'undertime_count' => ['required', 'integer', 'min:0'],
        ];
    }
}
