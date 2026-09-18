import React from 'react';
import { DatePicker } from '@/components/date-picker';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
    [key: string]: any;
}

interface ApprovalSectionProps {
    users: User[];
    data: {
        date_received: string;
        date_approved: string;
        approved_by_id: string;
    };
    errors: {
        approved_by_id?: string;
    };
    setData: (key: string, value: any) => void;
}

export const ApprovalSection: React.FC<ApprovalSectionProps> = ({
    users,
    data,
    errors,
    setData,
}) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Date Received</Label>
                <DatePicker
                    value={data.date_received}
                    onChange={(val) => setData('date_received', val || '')}
                />
            </div>
            <div className="space-y-2">
                <Label>Date Approved</Label>
                <DatePicker
                    value={data.date_approved}
                    onChange={(val) => setData('date_approved', val || '')}
                />
            </div>
            <div className="space-y-2">
                <Label>Approved By</Label>
                <EmployeeSearch
                    users={users}
                    selectedId={data.approved_by_id}
                    onSelect={(val) =>
                        setData('approved_by_id', val === 'all' ? '' : val)
                    }
                    placeholder="Search Approver..."
                    returnValue="id"
                    aria-invalid={!!errors.approved_by_id}
                />
                {errors.approved_by_id && (
                    <p className="text-sm text-destructive">
                        {errors.approved_by_id}
                    </p>
                )}
            </div>
        </div>
    );
};
