<?php

namespace App\Modules\Personnel\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeRestoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('personnel.restore');
    }

    public function rules(): array
    {
        return [
            // No specific rules needed beyond the authorization,
            // but we might want to validate the ID exists in the trashed list
            // However, this is usually handled in the controller/service findOrFail
        ];
    }
}
