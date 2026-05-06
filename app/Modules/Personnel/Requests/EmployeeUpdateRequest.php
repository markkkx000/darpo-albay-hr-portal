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
            'division_id' => ['nullable', 'exists:divisions,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'employment_status_id' => ['nullable', 'exists:employment_statuses,id'],
            'hire_date' => ['nullable', 'date'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'sex' => ['nullable', 'string', 'in:Male,Female'],
            'date_of_birth' => ['nullable', 'date'],
            'years_in_service' => ['nullable', 'integer', 'min:0'],
            'plantilla_number' => ['nullable', 'string', 'max:255'],
            'gsis_bp_number' => ['nullable', 'string', 'max:255'],
            'philhealth' => ['nullable', 'string', 'max:255'],
            'hdmf_pagibig_no' => ['nullable', 'string', 'max:255'],
            'tin_number' => ['nullable', 'string', 'max:255'],
            'prc_id_no' => ['nullable', 'string', 'max:255'],
            'prc_expiration' => ['nullable', 'date'],
            'orig_date_of_appointment' => ['nullable', 'date'],
            'date_of_latest_appointment' => ['nullable', 'date'],
            'date_of_assumption' => ['nullable', 'date'],
        ];
    }
}
