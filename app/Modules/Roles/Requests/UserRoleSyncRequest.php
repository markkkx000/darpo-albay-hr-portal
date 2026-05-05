<?php

namespace App\Modules\Roles\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRoleSyncRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.manage');
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'exists:roles,name'],
        ];
    }
}
