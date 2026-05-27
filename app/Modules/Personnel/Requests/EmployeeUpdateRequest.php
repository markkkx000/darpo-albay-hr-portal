<?php

namespace App\Modules\Personnel\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('personnel.manage');
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'employee_number' => ['nullable', 'string', Rule::unique('users', 'employee_number')->ignore($userId)],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'positions' => ['nullable', 'array'],
            'positions.*.id' => ['nullable'],
            'positions.*.name' => ['nullable', 'string', 'max:255'],
            'positions.*.is_primary' => ['boolean'],
            'division_id' => ['nullable', 'exists:divisions,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'appointment_status_id' => ['nullable', 'exists:appointment_statuses,id'],
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
            'date_of_separation' => ['nullable', 'date'],
            'date_hired_government' => ['nullable', 'date'],
            'present_address' => ['nullable', 'string'],
            'civil_status' => ['nullable', 'string', 'in:Single,Married,Widowed,Divorced,Separated'],
            'eligibility' => ['nullable', 'string', 'max:255'],
            'fund_code' => ['nullable', 'string', 'max:255'],
            'func_activity_code' => ['nullable', 'string', 'max:255'],
            'item_number' => ['nullable', 'string', 'max:255'],
            'office_per_appointment' => ['nullable', 'string', 'max:255'],
            'plantilla_position' => ['nullable', 'string', 'max:255'],
            'lbp_account_number' => ['nullable', 'string', 'max:255'],
            'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'salary_grade' => ['nullable', 'integer', 'min:1', 'max:33'],
            'salary_step' => ['nullable', 'integer', 'min:1', 'max:8'],
            'monthly_salary' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
