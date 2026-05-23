import { UploadCloud, FileText, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
    sessionUploadedUrls: React.MutableRefObject<string[]>;
}

interface LocalFile {
    id: string;
    name: string;
    status: 'success' | 'uploading' | 'error';
    url: string;
    error?: string;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
    leaveStatuses,
    data,
    errors,
    setData,
    sessionUploadedUrls,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Initialize local uploader state from existing attachment_urls (for edit mode)
    const [localFiles, setLocalFiles] = useState<LocalFile[]>(() => {
        return (data.attachment_urls || [])
            .filter(Boolean)
            .map((url, idx) => {
                const name = url.substring(url.lastIndexOf('/') + 1) || `attachment_${idx + 1}`;

                return {
                    id: `existing-${idx}-${Math.random().toString(36).substr(2, 4)}`,
                    name: decodeURIComponent(name),
                    status: 'success',
                    url,
                };
            });
    });

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            uploadFiles(Array.from(e.target.files));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files) {
            uploadFiles(Array.from(e.dataTransfer.files));
        }
    };

    const uploadFiles = async (files: File[]) => {
        const currentCount = localFiles.filter(f => f.status !== 'error').length;

        if (currentCount + files.length > 5) {
            toast.error('You can only upload a maximum of 5 attachment files.');

            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        for (const file of files) {
            // Validate file size limit: 10MB
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File "${file.name}" exceeds the 10MB limit.`);
                continue;
            }

            // Validate allowed extensions
            const allowedExtensions = ['pdf', 'jpeg', 'jpg', 'png', 'webp'];
            const fileExt = file.name.split('.').pop()?.toLowerCase();

            if (!fileExt || !allowedExtensions.includes(fileExt)) {
                toast.error(`Unsupported format for "${file.name}". Please upload PDF, JPEG, PNG, or WebP.`);
                continue;
            }

            const tempId = Math.random().toString(36).substr(2, 9);
            const newLocalFile: LocalFile = {
                id: tempId,
                name: file.name,
                status: 'uploading',
                url: '',
            };

            setLocalFiles(prev => [...prev, newLocalFile]);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/leave/upload-attachment', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || '',
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                const resData = await response.json();

                if (!response.ok) {
                    throw new Error(resData.error || 'Upload failed');
                }

                const uploadedUrl = resData.url;

                // Save in session tracking ref for rollback if form cancelled
                sessionUploadedUrls.current.push(uploadedUrl);

                setLocalFiles(prev =>
                    prev.map(f => (f.id === tempId ? { ...f, status: 'success', url: uploadedUrl } : f))
                );

                // Update form state
                setData((prev: any) => {
                    const currentUrls = prev.attachment_urls || [];

                    return {
                        ...prev,
                        attachment_urls: [...currentUrls.filter(Boolean), uploadedUrl],
                    };
                });
            } catch (err: any) {
                console.error(err);
                const errorMsg = err.message || 'Upload failed';
                setLocalFiles(prev =>
                    prev.map(f => (f.id === tempId ? { ...f, status: 'error', error: errorMsg } : f))
                );
                toast.error(`Failed to upload "${file.name}": ${errorMsg}`);
            }
        }
    };

    const handleRemoveFile = async (id: string, url: string) => {
        if (url) {
            // Check if it's a file uploaded in this session (needs immediate S3 deletion)
            if (sessionUploadedUrls.current.includes(url)) {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                try {
                    await fetch('/leave/delete-attachment', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({ url }),
                    });
                    // Remove from session tracking ref
                    sessionUploadedUrls.current = sessionUploadedUrls.current.filter(u => u !== url);
                } catch (err) {
                    console.error('Failed to delete file from S3:', err);
                }
            }

            // Remove from parent form attachment list
            setData((prev: any) => {
                const currentUrls = prev.attachment_urls || [];

                return {
                    ...prev,
                    attachment_urls: currentUrls.filter((u: string) => u !== url),
                };
            });
        }

        // Remove from localFiles
        setLocalFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label className="text-sm font-semibold text-foreground/90">Attachments (Max 5 files)</Label>
                
                {/* Drag and Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerFileSelect}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 relative select-none ${
                        isDragging
                            ? 'border-primary bg-primary/5 scale-[1.01] shadow-md'
                            : 'border-border/60 hover:border-primary/50 hover:bg-muted/10'
                    }`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        multiple
                        className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-primary/5 text-primary rounded-full animate-pulse">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            Drag & drop files here, or <span className="text-primary hover:underline">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                            Supports PDF, JPEG, PNG, WebP (Max 10MB each)
                        </p>
                    </div>
                </div>

                {/* Uploads List */}
                {localFiles.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {localFiles.map((file) => {
                            const isPdf = file.name.toLowerCase().endsWith('.pdf');

                            return (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/60 backdrop-blur-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-md ${isPdf ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {isPdf ? (
                                                <FileText className="h-4 w-4" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate max-w-[200px] text-foreground" title={file.name}>
                                                {file.name}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {file.status === 'uploading' && (
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                        Uploading...
                                                    </span>
                                                )}
                                                {file.status === 'success' && (
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                                                    >
                                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                        View file
                                                    </a>
                                                )}
                                                {file.status === 'error' && (
                                                    <span className="text-[11px] text-destructive flex items-center gap-0.5">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {file.error || 'Failed'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFile(file.id, file.url)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
                {errors.attachment_urls && (
                    <p className="text-sm text-destructive animate-in fade-in duration-200">
                        {errors.attachment_urls}
                    </p>
                )}
            </div>
        </div>
    );
};
