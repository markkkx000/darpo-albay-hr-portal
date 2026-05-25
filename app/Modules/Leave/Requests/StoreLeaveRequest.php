<?php

namespace App\Modules\Leave\Requests;

use App\Modules\Leave\Models\LeaveType;
use Illuminate\Foundation\Http\FormRequest;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('leave.manage');
    }

    protected function prepareForValidation()
    {
        if ($this->has('specific_dates') && is_array($this->specific_dates) && count($this->specific_dates) > 0) {
            $dates = collect($this->specific_dates)->sort()->values();
            $this->merge([
                'start_date' => $dates->first(),
                'end_date' => $dates->last(),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'leave_status_id' => ['required', 'exists:leave_statuses,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'days_requested' => ['required', 'numeric', 'min:0'],
            'date_received' => ['nullable', 'date'],
            'date_approved' => ['nullable', 'date'],
            'approved_by_id' => ['nullable', 'exists:users,id'],
            'leave_details' => ['nullable', 'string', 'max:255'],
            'commutation_requested' => ['boolean'],
            'is_filed' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'attachment_urls' => ['nullable', 'array'],
            'attachment_urls.*' => ['nullable', 'url'],
            'specific_dates' => ['nullable', 'array'],
            'specific_dates.*' => ['date'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'date_filed' => ['nullable', 'date'],
            'days_with_pay' => ['required', 'numeric', 'min:0'],
            'days_without_pay' => ['required', 'numeric', 'min:0'],
            'others_pay_remarks' => ['nullable', 'string', 'max:255'],
            'approved_by_official' => ['nullable', 'string', 'max:255'],
            'leave_detail_type' => ['nullable', 'string', 'max:255'],
            'leave_detail_remarks' => ['nullable', 'string'],

            'has_attachments' => ['boolean'],
            'supporting_documents' => ['nullable', 'array'],
            'maternity_allocation_details' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $data = $this->all();
            $hasAttachments = $this->boolean('has_attachments');
            $supportingDocs = $this->input('supporting_documents', []);
            $leaveTypeId = $this->input('leave_type_id');
            $daysRequested = $this->input('days_requested');
            $daysWithPay = $this->input('days_with_pay', 0);
            $daysWithoutPay = $this->input('days_without_pay', 0);

            $leaveType = LeaveType::find($leaveTypeId);
            $typeName = $leaveType?->name;

            if ($hasAttachments && empty($supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Supporting documents must be selected if "Has Attachments" is checked.');
            }

            if ($typeName === 'Sick Leave') {
                if ($daysRequested > 5 && ! in_array('Medical Certificate', $supportingDocs)) {
                    $validator->errors()->add('supporting_documents', 'Medical Certificate is required for sick leave exceeding 5 days.');
                }
            }

            if ($typeName === 'Maternity Leave' && ! in_array('Proof of Pregnancy/Delivery', $supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Proof of Pregnancy/Delivery is required for maternity leave.');
            }

            if ($typeName === 'Paternity Leave') {
                if (! in_array('Proof of Pregnancy/Delivery', $supportingDocs) || ! in_array('Marriage Contract', $supportingDocs)) {
                    $validator->errors()->add('supporting_documents', 'Proof of Pregnancy/Delivery and Marriage Contract are required for paternity leave.');
                }
            }

            if ($typeName === 'Solo Parent Leave' && ! in_array('Solo Parent Identification Card', $supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Solo Parent Identification Card is required.');
            }

            if ($typeName === 'Special Leave Benefits for Women' && ! in_array('Medical Certificate (Gynecological Surgery)', $supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Medical Certificate (Gynecological Surgery) is required.');
            }

            if ($typeName === '10-Day VAWC Leave' && ! in_array('Protection Order', $supportingDocs) && ! in_array('Police Report', $supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Protection Order or Police Report is required for VAWC leave.');
            }

            if ($daysRequested >= 30 && ! in_array('Clearance Form (CS Form 7)', $supportingDocs)) {
                $validator->errors()->add('supporting_documents', 'Clearance Form (CS Form 7) is required for leaves of 30 days or more.');
            }

            if (($daysWithPay + $daysWithoutPay) > $daysRequested) {
                $validator->errors()->add('days_with_pay', 'The sum of days with pay and days without pay cannot exceed the total days requested.');
            }
        });
    }
}
