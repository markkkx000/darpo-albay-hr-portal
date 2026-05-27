<?php

namespace App\Modules\DocumentRequests\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('document_requests.view') || $this->user()->can('document_requests.manage');
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'requests' => ['required', 'array', 'min:1'],
            'requests.*' => ['required', 'string'],
            'purpose' => ['required', 'string'],
            'specify_remittance' => ['nullable', 'string', \Illuminate\Validation\Rule::requiredIf(fn () => in_array('Certificate of Remittance', $this->requests ?? []))],
            'specify_documents' => ['nullable', 'string', \Illuminate\Validation\Rule::requiredIf(fn () => in_array('Certified True Copy of Documents', $this->requests ?? []))],
            'specify_other' => ['nullable', 'string', \Illuminate\Validation\Rule::requiredIf(fn () => in_array('Other', $this->requests ?? []))],
        ];
    }
}
