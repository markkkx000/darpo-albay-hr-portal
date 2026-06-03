<?php

namespace App\Modules\Announcements\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnnouncementUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $announcement = $this->route('announcement');

        return $this->user()->can('announcements.manage') && $announcement->status === 'draft';
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'priority' => ['required', Rule::in(['normal', 'high'])],
            'target_type' => ['required', Rule::in(['all', 'division', 'position', 'user'])],
            'target_id' => [
                'required_unless:target_type,all',
                'nullable',
                Rule::when($this->target_type === 'division', 'exists:divisions,id'),
                Rule::when($this->target_type === 'position', 'exists:positions,id'),
                Rule::when($this->target_type === 'user', 'exists:users,id'),
            ],
            'is_event' => ['boolean'],
            'event_date' => ['nullable', 'required_if:is_event,true', 'date'],
        ];
    }
}
