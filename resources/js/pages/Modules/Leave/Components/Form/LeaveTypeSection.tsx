import React from 'react';
import { CreditPreview } from '@/components/Leave/CreditPreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Required } from './utils';

interface LeaveType {
    id: number;
    name: string;
    color?: string;
    [key: string]: any;
}

interface LeaveTypeSectionProps {
    leaveTypes: LeaveType[];
    data: {
        user_id: string;
        leave_type_id: string;
        days_with_pay: string;
        days_without_pay: string;
        others_pay_remarks: string;
    };
    errors: {
        leave_type_id?: string;
        days_with_pay?: string;
        days_without_pay?: string;
    };
    setData: (key: string, value: any) => void;
    handleLeaveTypeChange: (v: string) => void;
    isEdit: boolean;
    available: number;
    requested: number;
    remaining: number;
    typeName: string;
    selectedLeaveType: LeaveType | undefined;
}

export const LeaveTypeSection: React.FC<LeaveTypeSectionProps> = ({
    leaveTypes,
    data,
    errors,
    setData,
    handleLeaveTypeChange,
    isEdit,
    available,
    requested,
    remaining,
    typeName,
    selectedLeaveType,
}) => {
    return (
        <>
            <div className="grid grid-cols-2 gap-4 border-t pt-6">
                <div className="space-y-2">
                    <Label>Leave Type <Required /></Label>
                    <Select value={data.leave_type_id} onValueChange={handleLeaveTypeChange}>
                        <SelectTrigger aria-invalid={!!errors.leave_type_id}>
                            <div className="truncate text-left flex-1">
                                <SelectValue placeholder="Select Leave Type" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {leaveTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.leave_type_id && <p className="text-sm text-destructive">{errors.leave_type_id}</p>}
                </div>
                <div className="space-y-4">
                    <Label>Approved For (Credits) <Required /></Label>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex items-center gap-3">
                            <Input
                                className="w-24 h-9"
                                type="number"
                                step="any"
                                value={data.days_with_pay}
                                onChange={e => setData('days_with_pay', e.target.value)}
                            />
                            <span className="text-sm">days with pay</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input
                                className="w-24 h-9"
                                type="number"
                                step="any"
                                value={data.days_without_pay}
                                onChange={e => setData('days_without_pay', e.target.value)}
                            />
                            <span className="text-sm">days without pay</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-3">
                            <Input
                                className="flex-1 h-9"
                                type="text"
                                placeholder="Others (Specify)"
                                value={data.others_pay_remarks}
                                onChange={e => setData('others_pay_remarks', e.target.value)}
                            />
                        </div>
                    </div>
                    {(errors.days_with_pay || errors.days_without_pay) && (
                        <p className="text-sm text-destructive">
                            {errors.days_with_pay || errors.days_without_pay}
                        </p>
                    )}
                </div>
            </div>

            {!isEdit && data.user_id && data.leave_type_id && selectedLeaveType?.is_cumulative && (
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <CreditPreview
                        available={available}
                        requested={requested}
                        remaining={remaining}
                        leaveTypeName={typeName}
                        accentColor={selectedLeaveType?.color ?? '#3B82F6'}
                    />
                </div>
            )}
        </>
    );
};
