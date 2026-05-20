import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Required } from './utils';

interface LeaveStatus {
    id: number;
    name: string;
    [key: string]: any;
}

interface StatusSectionProps {
    leaveStatuses: LeaveStatus[];
    data: {
        leave_status_id: string;
        attachment_urls: string[];
    };
    errors: {
        leave_status_id?: string;
        attachment_urls?: string;
        [key: string]: any;
    };
    setData: (key: any, value?: any) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
    leaveStatuses,
    data,
    errors,
    setData,
}) => {
    const addAttachmentUrl = () => {
        setData('attachment_urls', [...data.attachment_urls, '']);
    };

    const removeAttachmentUrl = (index: number) => {
        const urls = [...data.attachment_urls];
        urls.splice(index, 1);
        setData('attachment_urls', urls.length > 0 ? urls : ['']);
    };

    const updateAttachmentUrl = (index: number, val: string) => {
        const urls = [...data.attachment_urls];
        urls[index] = val;
        setData('attachment_urls', urls);
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Status <Required /></Label>
                <Select value={data.leave_status_id} onValueChange={(v) => setData('leave_status_id', v)}>
                    <SelectTrigger aria-invalid={!!errors.leave_status_id}>
                        <div className="truncate text-left flex-1">
                            <SelectValue placeholder="Select Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {leaveStatuses.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.leave_status_id && <p className="text-sm text-destructive">{errors.leave_status_id}</p>}
            </div>
            <div className="space-y-3">
                <Label>Attachment/s URL</Label>
                <div className="space-y-2">
                    {data.attachment_urls.map((url: string, idx: number) => (
                        <div key={idx} className="space-y-1">
                            <div className="flex space-x-2">
                                <Input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={url}
                                    onChange={e => updateAttachmentUrl(idx, e.target.value)}
                                    className={errors[`attachment_urls.${idx}`] ? "border-destructive" : ""}
                                />
                                {data.attachment_urls.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAttachmentUrl(idx)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>
                            {errors[`attachment_urls.${idx}`] && (
                                <p className="text-[10px] font-bold text-destructive uppercase tracking-tight animate-in fade-in slide-in-from-left-1">
                                    {errors[`attachment_urls.${idx}`]}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addAttachmentUrl} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add another URL
                </Button>
                {errors.attachment_urls && <p className="text-sm text-destructive">{errors.attachment_urls}</p>}
            </div>
        </div>
    );
};
