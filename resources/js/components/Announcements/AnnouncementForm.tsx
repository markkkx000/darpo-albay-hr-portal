import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { TargetSelector } from './TargetSelector';

interface Props {
    announcement?: any;
    divisions: any[];
    positions: any[];
    users: any[];
    submitUrl: string;
    method: 'post' | 'put';
}

export function AnnouncementForm({
    announcement,
    divisions,
    positions,
    users,
    submitUrl,
    method,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: announcement?.title || '',
        content: announcement?.content || '',
        priority: announcement?.priority || 'normal',
        target_type: announcement?.target_type || 'all',
        target_id: announcement?.target_id || null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const options = {
            onSuccess: () => {
                toast.success(announcement ? 'Announcement updated' : 'Announcement draft saved');
                router.clearHistory();
            },
        };

        if (method === 'post') {
            post(submitUrl, options);
        } else {
            put(submitUrl, options);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input 
                    value={data.title} 
                    onChange={e => setData('title', e.target.value)}
                    placeholder="Announcement title"
                    className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                        value={data.priority} 
                        onValueChange={v => setData('priority', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
                </div>
            </div>

            <TargetSelector 
                targetType={data.target_type}
                targetId={data.target_id}
                onTargetTypeChange={v => {
                    setData(d => ({ ...d, target_type: v, target_id: null }));
                }}
                onTargetIdChange={v => setData('target_id', v)}
                divisions={divisions}
                positions={positions}
                users={users}
                error={errors.target_type}
                targetIdError={errors.target_id}
            />

            <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <RichTextEditor 
                    content={data.content}
                    onChange={v => setData('content', v)}
                    error={errors.content}
                />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-muted/20">
                <Button type="submit" disabled={processing} className="btn-specular gap-2 px-8 py-6 rounded-xl shadow-lg border-none">
                    {processing ? 'Saving...' : announcement ? 'Update Draft' : 'Save Draft'}
                </Button>
            </div>
        </form>
    );
}
