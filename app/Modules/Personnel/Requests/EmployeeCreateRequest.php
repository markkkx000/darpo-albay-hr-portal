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
            'division_id' => ['required', 'exists:divisions,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'employment_status_id' => ['required', 'exists:employment_statuses,id'],
            'hire_date' => ['required', 'date'],
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
