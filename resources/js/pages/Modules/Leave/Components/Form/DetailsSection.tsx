import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Required } from './utils';

interface DetailsSectionProps {
    category: string;
    specify: string;
    updateDetails: (newCategory: string, newSpecify: string) => void;
    mounted: boolean;
    typeName: string;
    detailsOptions: string[];
    specifyPlaceholder: string;
    hideSpecify: boolean;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
    category,
    specify,
    updateDetails,
    mounted,
    typeName,
    detailsOptions,
    specifyPlaceholder,
    hideSpecify,
}) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Leave Details (Section 6.B) <Required /></Label>
                <Select
                    value={category}
                    onValueChange={(val) => updateDetails(val, specify)}
                    disabled={!mounted || !typeName}
                >
                    <SelectTrigger className={(!mounted || !typeName) ? "opacity-50" : ""}>
                        <div className="truncate text-left flex-1">
                            <SelectValue placeholder={!typeName ? "Select Leave Type first" : "Select details..."} />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {detailsOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Specifics / Remarks</Label>
                <Input
                    placeholder={specifyPlaceholder}
                    value={specify}
                    onChange={(e) => updateDetails(category, e.target.value)}
                    disabled={!mounted || !typeName || !category || hideSpecify}
                    className={(!mounted || !typeName || !category || hideSpecify) ? "opacity-50 bg-muted cursor-not-allowed" : ""}
                />
            </div>
        </div>
    );
};
