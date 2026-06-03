import { useForm } from '@inertiajs/react';
import { UploadCloud, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { store as supportTicketsStore } from '@/routes/supporttickets';

type Props = {
    children: ReactNode;
};

export function SupportTicketModal({ children }: Props) {
    const [open, setOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm({
        type: 'Bug',
        title: '',
        description: '',
        urlContext: typeof window !== 'undefined' ? window.location.href : '',
        browserContext: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        attachments: [] as File[],
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleFiles = (files: File[]) => {
        // Filter and limit to max 10 images, 5MB max
        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024;

            return isValidType && isValidSize;
        });
        setData('attachments', [...data.attachments, ...validFiles].slice(0, 10));
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            handleFiles(Array.from(e.clipboardData.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...data.attachments];
        newFiles.splice(index, 1);
        setData('attachments', newFiles);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        // Update contextual data right before submit
        transform((data) => ({
            ...data,
            urlContext: window.location.href,
        }));
        
        post(supportTicketsStore.url(), {
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);

            if (!newOpen) {
                reset();
                clearErrors();
            }
        }}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border/50">
                <form onSubmit={handleSubmit} onPaste={handlePaste} className="flex flex-col max-h-[90vh]">
                    <div className="p-6 pb-4 border-b border-border/40 bg-muted/20">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Help & Support</DialogTitle>
                            <DialogDescription className="text-sm">
                                Submit a ticket directly to our development and support team.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-3">
                            <Label htmlFor="type">Type</Label>
                            <Select 
                                value={data.type} 
                                onValueChange={(value) => setData('type', value)}
                            >
                                <SelectTrigger className="bg-background/50 focus:bg-background">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bug">Bug Report</SelectItem>
                                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                                    <SelectItem value="Question">General Question</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Brief summary of the issue"
                                className="bg-background/50 focus-visible:bg-background"
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => {
                                    setData('description', e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                className="min-h-[120px] resize-none overflow-hidden bg-background/50 focus-visible:bg-background"
                                placeholder="Detailed description of your issue or request..."
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Attachments (Optional)</Label>
                                <span className="text-xs text-muted-foreground">Max 10 images. 5MB each.</span>
                            </div>
                            
                            <div 
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer",
                                    dragActive ? "border-primary bg-primary/5" : "border-border/60 hover:border-border hover:bg-muted/30"
                                )}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className={cn("w-8 h-8 mb-1 transition-colors", dragActive ? "text-primary" : "text-muted-foreground")} />
                                <p className="text-sm font-medium">Click to upload, drag and drop, or paste images</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
handleFiles(Array.from(e.target.files));
}

                                    e.target.value = ''; // Reset
                                }}
                            />

                            {data.attachments.length > 0 && (
                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-3">
                                    {data.attachments.map((file, i) => (
                                        <div key={i} className="group relative flex items-center gap-3 p-2 rounded-md border border-border/60 bg-muted/30 pr-8">
                                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-background flex items-center justify-center border border-border/40">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate" title={file.name}>{file.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
 e.stopPropagation(); removeFile(i); 
}}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all border border-border/50"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <InputError message={errors.attachments} />
                        </div>
                    </div>

                    <div className="p-4 border-t border-border/40 bg-muted/20 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                            className="bg-background shadow-sm hover:bg-accent"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
