import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SupportingDocsSectionProps {
    typeName: string;
    data: {
        has_attachments: boolean;
        supporting_documents: string[];
        maternity_allocation_details: string;
        commutation_requested: boolean;
        is_filed: boolean;
    };
    errors: {
        supporting_documents?: string;
    };
    setData: (key: any, value?: any) => void;
    supportingDocsOptions: string[];
}

export const SupportingDocsSection: React.FC<SupportingDocsSectionProps> = ({
    typeName,
    data,
    errors,
    setData,
    supportingDocsOptions,
}) => {
    return (
        <>
            {typeName && (
                <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="has_attachments"
                            checked={data.has_attachments}
                            onCheckedChange={(c) => setData('has_attachments', c === true)}
                        />
                        <Label htmlFor="has_attachments" className="font-semibold">Has Supporting Documents / Attachments</Label>
                    </div>

                    {data.has_attachments && (
                        <div className="pl-6 grid grid-cols-2 gap-y-2 gap-x-4 animate-in fade-in slide-in-from-left-2 duration-200">
                            {supportingDocsOptions.map(doc => (
                                <div key={doc} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`doc-${doc}`}
                                        checked={data.supporting_documents.includes(doc)}
                                        onCheckedChange={(c) => {
                                            const docs = [...data.supporting_documents];

                                            if (c) {
                                                docs.push(doc);
                                            } else {
                                                const idx = docs.indexOf(doc);

                                                if (idx > -1) {
                                                    docs.splice(idx, 1);
                                                }
                                            }

                                            setData('supporting_documents', docs);
                                        }}
                                    />
                                    <Label htmlFor={`doc-${doc}`} className="text-sm">{doc}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors.supporting_documents && <p className="text-sm text-destructive">{errors.supporting_documents}</p>}
                </div>
            )}

            {typeName.includes('maternity') && (
                <div className="space-y-2 border-t pt-4">
                    <Label>Maternity Allocation (CS Form 6a)</Label>
                    <Input
                        placeholder="e.g. Allocated 7 days to John Doe (Husband)"
                        value={data.maternity_allocation_details}
                        onChange={e => setData('maternity_allocation_details', e.target.value)}
                    />
                </div>
            )}

            <div className="flex space-x-6 py-2">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="commutation"
                        checked={data.commutation_requested}
                        onCheckedChange={(c) => setData('commutation_requested', c === true)}
                    />
                    <Label htmlFor="commutation" className="text-sm font-medium leading-none">Commutation Requested</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="is_filed"
                        checked={data.is_filed}
                        onCheckedChange={(c) => setData('is_filed', c === true)}
                    />
                    <Label htmlFor="is_filed" className="text-sm font-medium leading-none">Form is properly filed</Label>
                </div>
            </div>
        </>
    );
};
