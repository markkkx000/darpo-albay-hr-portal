import { useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import DocumentRequestsRoutes from "@/routes/documentrequests";

interface ReleaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentRequestId: number | null;
}

export function ReleaseModal({ isOpen, onClose, documentRequestId }: ReleaseModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        is_electronic: false,
        released_to: "",
        files: [] as File[],
    });

    const [fileError, setFileError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            
            // Validate size
            const hasLargeFile = selectedFiles.some(f => f.size > 10 * 1024 * 1024);

            if (hasLargeFile) {
                setFileError("One or more files exceed the 10MB limit.");

                return;
            }

            setFileError("");
            setData('files', selectedFiles);
        }
    };

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        
        if (!documentRequestId) {
return;
}

        post(DocumentRequestsRoutes.release({ documentRequest: documentRequestId }).url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Process Document Request</DialogTitle>
                        <DialogDescription>
                            Mark the requested documents as ready for pickup or send them electronically to the employee.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Electronic Release</Label>
                                <p className="text-sm text-muted-foreground">
                                    Upload soft copies (PDF/Image) to send directly.
                                </p>
                            </div>
                            <Switch
                                checked={data.is_electronic}
                                onCheckedChange={(val) => setData('is_electronic', val)}
                            />
                        </div>

                        {data.is_electronic ? (
                            <div className="grid gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                <Label htmlFor="files">Upload Documents</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={handleFileChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    PDF or Image formats only. Max 10MB per file.
                                </p>
                                {fileError && <p className="text-sm text-destructive">{fileError}</p>}
                                {errors.files && <p className="text-sm text-destructive">{errors.files}</p>}
                            </div>
                        ) : (
                            <div className="grid gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                                <p className="text-sm text-muted-foreground rounded-lg border bg-muted/30 p-4">
                                    This will mark the request as "Ready for Pickup". Once picked up, you can log the receiver's name.
                                </p>
                            </div>
                        )}
                    </div>
                    
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !!fileError}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
