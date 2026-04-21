<?php

namespace App\Modules\Announcements\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementPublishRequest extends FormRequest
{
    public function authorize(): bool
    {
        $announcement = $this->route('announcement');

        return $this->user()->can('announcements.manage') && $announcement->status === 'draft';
    }

    public function rules(): array
    {
        return [];
    }
}
