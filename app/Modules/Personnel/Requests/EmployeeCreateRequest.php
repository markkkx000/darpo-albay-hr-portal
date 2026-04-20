<?php

namespace App\Modules\Personnel\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('personnel.create');
    }

    public function rules(): array
    {
        return [
            'employee_number' => ['required', 'string', 'unique:users,employee_number'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'position_id' => ['required', 'exists:positions,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'employment_status_id' => ['required', 'exists:employment_statuses,id'],
            'hire_date' => ['required', 'date'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
        ];
    }
}
