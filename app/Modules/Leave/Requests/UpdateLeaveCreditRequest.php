<?php

namespace App\Modules\Leave\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLeaveCreditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.credits.manage');
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'year' => ['required', 'integer'],
            'balance' => ['required', 'numeric', 'min:0'],
            'used' => ['required', 'numeric', 'min:0'],
        ];
    }
}
