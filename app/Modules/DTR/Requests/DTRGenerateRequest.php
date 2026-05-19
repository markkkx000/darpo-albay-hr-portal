<?php

namespace App\Modules\DTR\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DTRGenerateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        if ($user->can('dtr.manage')) {
            return true;
        }

        return (int) $this->input('user_id') === $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2000', 'max:'.(date('Y') + 5)],
            'format' => ['required', 'string', 'in:pdf,csv'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'official_hours' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'Please select an employee.',
            'user_id.exists' => 'The selected employee is invalid.',
            'month.required' => 'Please select a month.',
            'year.required' => 'Please select a year.',
            'format.required' => 'Please select an export format.',
        ];
    }
}
