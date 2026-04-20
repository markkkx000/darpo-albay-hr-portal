<?php

namespace App\Modules\Personnel\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('personnel.update');
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'employee_number' => ['nullable', 'string', Rule::unique('users', 'employee_number')->ignore($userId)],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'position_id' => ['nullable', 'exists:positions,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'employment_status_id' => ['nullable', 'exists:employment_statuses,id'],
            'hire_date' => ['nullable', 'date'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
        ];
    }
}
