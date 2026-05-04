<?php

namespace App\Modules\Roles\Requests;

use App\Modules\Roles\Services\RoleService;
use DomainException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('roles.manage');
    }

    public function rules(): array
    {
        $role = $this->route('role');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('roles')->ignore($role->id)],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

    protected function passedValidation(): void
    {
        $role = $this->route('role');
        $service = app(RoleService::class);

        if ($service->isProtected($role->name) && $this->name !== $role->name) {
            throw new DomainException("Core role '{$role->name}' cannot be renamed.");
        }
    }
}
