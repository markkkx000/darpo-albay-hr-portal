import { X } from 'lucide-react';
import React, { useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { Required, parseLocalDate } from './utils';

interface DateSectionProps {
    dateMode: 'range' | 'specific';
    toggleDateMode: (mode: 'range' | 'specific') => void;
    data: {
        start_date: string;
        end_date: string;
        days_requested: string;
        specific_dates: string[];
    };
    errors: {
        start_date?: string;
        end_date?: string;
        days_requested?: string;
        specific_dates?: string;
        dates?: string;
    };
    setData: (key: any, value?: any) => void;
}

export const DateSection: React.FC<DateSectionProps> = ({
    dateMode,
    toggleDateMode,
    data,
    errors,
    setData,
}) => {
    const [specificDateInput, setSpecificDateInput] = useState('');

    const addSpecificDate = () => {
        if (specificDateInput && !data.specific_dates.includes(specificDateInput)) {
            setData('specific_dates', [...data.specific_dates, specificDateInput].sort());
            setSpecificDateInput('');
        }
    };

    const removeSpecificDate = (dateToRemove: string) => {
        setData('specific_dates', data.specific_dates.filter((d: string) => d !== dateToRemove));
    };

    return (
        <div className="space-y-4 border-y py-4 my-4">
            <div className="flex items-center justify-between">
                <Label className="text-base">Date Selection</Label>
                <SlidingTabs
                    layoutId="datemode-active"
                    tabs={[
                        { value: 'range', label: 'Date Range', active: dateMode === 'range' },
                        { value: 'specific', label: 'Specific Dates', active: dateMode === 'specific' }
                    ]}
                    onChange={(val) => toggleDateMode(val as 'range' | 'specific')}
                />
            </div>

            {dateMode === 'range' ? (
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date <Required /></Label>
                        <DatePicker
                            value={data.start_date}
                            onChange={val => setData('start_date', val || '')}
                            aria-invalid={!!errors.start_date}
                        />
                        {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
                        {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>End Date <Required /></Label>
                        <DatePicker
                            value={data.end_date}
                            onChange={val => setData('end_date', val || '')}
                            aria-invalid={!!errors.end_date}
                        />
                        {errors.end_date && <p className="text-sm text-destructive">{errors.end_date}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Days Requested <Required /></Label>
                        <Input
                            type="number"
                            step="any"
                            min="0"
                            value={data.days_requested}
                            onChange={e => setData('days_requested', e.target.value)}
                            aria-invalid={!!errors.days_requested}
                        />
                        {errors.days_requested && <p className="text-sm text-destructive">{errors.days_requested}</p>}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Add Specific Date</Label>
                            <div className="flex space-x-2">
                                <DatePicker
                                    value={specificDateInput}
                                    onChange={val => setSpecificDateInput(val || '')}
                                />
                                <Button type="button" variant="secondary" onClick={addSpecificDate}>
                                    Add Date
                                </Button>
                            </div>
                            {errors.specific_dates && <p className="text-sm text-destructive">{errors.specific_dates}</p>}
                            {errors.dates && <p className="text-sm text-destructive">{errors.dates}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Days Requested <Required /></Label>
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                value={data.days_requested}
                                onChange={e => setData('days_requested', e.target.value)}
                                aria-invalid={!!errors.days_requested}
                            />
                            {errors.days_requested && <p className="text-sm text-destructive">{errors.days_requested}</p>}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.specific_dates.map((d: string) => (
                            <div key={d} className="badge-premium group">
                                <span>{parseLocalDate(d)?.toLocaleDateString('en-GB', { timeZone: 'Asia/Manila' }) ?? d}</span>
                                <button
                                    type="button"
                                    onClick={() => removeSpecificDate(d)}
                                    className="text-black/50 hover:text-black transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        {data.specific_dates.length === 0 && (
                            <p className="text-sm text-muted-foreground italic mt-2">No dates added yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
