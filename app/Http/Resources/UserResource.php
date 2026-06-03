<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);

        $currentUser = $request->user();
        $isSelf = $currentUser && $currentUser->id === $this->id;
        $isPrivileged = $currentUser && ($currentUser->hasRole('super_admin') || $currentUser->hasRole('hr_admin'));

        if (! $isSelf && ! $isPrivileged) {
            unset($data['monthly_salary']);
            unset($data['tin_number']);
            unset($data['gsis_bp_number']);
            unset($data['philhealth']);
            unset($data['hdmf_pagibig_no']);
            unset($data['prc_id_no']);
            unset($data['lbp_account_number']);
        }

        return $data;
    }
}
