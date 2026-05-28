<?php

namespace App\Modules\DocumentRequests\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReleaseDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('document_requests.manage');
    }

    public function rules(): array
    {
        return [
            'is_electronic' => ['required', 'boolean'],
            'files' => ['nullable', 'array', 'required_if:is_electronic,true'],
            'files.*' => ['file', 'mimes:pdf,jpeg,png,webp', 'max:10240'], // max 10MB
        ];
    }
}
