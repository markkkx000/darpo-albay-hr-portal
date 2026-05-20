import React from 'react';
import { DatePicker } from '@/components/date-picker';
import { EmployeeSearch } from '@/components/EmployeeSearch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Required } from './utils';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    employee_number: string | null;
    [key: string]: any;
}

interface EmployeeSectionProps {
    users: User[];
    data: {
        user_id: string;
        date_filed: string;
        salary: string;
    };
    errors: {
        user_id?: string;
        date_filed?: string;
        salary?: string;
    };
    setData: (key: string, value: any) => void;
}

export const EmployeeSection: React.FC<EmployeeSectionProps> = ({
    users,
    data,
    errors,
    setData,
}) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Employee <Required /></Label>
                <EmployeeSearch
                    users={users}
                    selectedId={data.user_id}
                    onSelect={(val) => setData('user_id', val === 'all' ? '' : val)}
                    placeholder="Search Employee..."
                    returnValue="id"
                    aria-invalid={!!errors.user_id}
                />
                {errors.user_id && <p className="text-sm text-destructive">{errors.user_id}</p>}
            </div>
            <div className="space-y-2">
                <Label>Date Filed</Label>
                <DatePicker
                    value={data.date_filed}
                    onChange={val => setData('date_filed', val || '')}
                />
                {errors.date_filed && <p className="text-sm text-destructive">{errors.date_filed}</p>}
            </div>
            <div className="space-y-2">
                <Label>Monthly Salary</Label>
                <Input
                    type="text"
                    placeholder="0.00"
                    value={data.salary}
                    onChange={e => {
                        const val = e.target.value.replace(/,/g, '');

                        if (val === '' || /^\d*\.?\d*$/.test(val)) {
                            setData('salary', val);
                        }
                    }}
                />
                {errors.salary && <p className="text-sm text-destructive">{errors.salary}</p>}
            </div>
        </div>
    );
};
