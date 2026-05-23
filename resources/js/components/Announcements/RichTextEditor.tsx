import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Undo,
    Link as LinkIcon,
    ImagePlus,
    Unlink,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { cn } from '@/lib/utils';

interface Props {
    content: string;
    onChange: (content: string) => void;
    error?: string;
}

const UploadPlaceholderView = (props: any) => {
    const { fileName } = props.node.attrs;
    return (
        <NodeViewWrapper className="upload-placeholder-wrapper my-4">
            <div className="upload-placeholder border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-muted/20 animate-pulse">
                <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-semibold text-muted-foreground">Uploading and optimizing {fileName}...</span>
            </div>
        </NodeViewWrapper>
    );
};

const UploadPlaceholder = Node.create({
    name: 'uploadPlaceholder',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            id: { default: null },
            fileName: { default: 'file' },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-upload-placeholder]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-upload-placeholder': '' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(UploadPlaceholderView);
    },
});

const MenuBar = ({ editor }: { editor: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'link' | 'image'>('link');
    const [url, setUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const openLinkDialog = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        setUrl(previousUrl || 'https://');
        setDialogType('link');
        setDialogOpen(true);
    }, [editor]);

    const openImageDialog = useCallback(() => {
        setUrl('https://');
        setDialogType('image');
        setDialogOpen(true);
    }, []);

    const handleConfirm = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        
        if (dialogType === 'link') {
            if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
            } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
        } else {
            if (url && url !== 'https://') {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
        
        setDialogOpen(false);
        setUrl('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB.');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/announcements/upload-asset', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to upload image');
            }

            const data = await response.json();
            editor.chain().focus().setImage({ src: data.url }).run();
            setDialogOpen(false);
            toast.success('Image uploaded and embedded successfully.');
        } catch (error: any) {
            toast.error(error.message || 'Image upload failed. Please try again.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-1 p-1 border-b bg-muted/50">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-muted-foreground/20' : ''}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-muted-foreground/20' : ''}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-muted-foreground/20 mx-1 self-center" />

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-muted-foreground/20' : ''}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-muted-foreground/20' : ''}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-muted-foreground/20' : ''}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-muted-foreground/20 mx-1 self-center" />

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openLinkDialog}
                className={editor.isActive('link') ? 'bg-muted-foreground/20' : ''}
                title="Insert Link"
            >
                <LinkIcon className="h-4 w-4" />
            </Button>
            {editor.isActive('link') && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    title="Remove Link"
                >
                    <Unlink className="h-4 w-4" />
                </Button>
            )}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openImageDialog}
                title="Insert Image"
            >
                <ImagePlus className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-muted-foreground/20 mx-1 self-center" />

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px] matte-card !fixed elev-4">
                    <DialogHeader>
                        <DialogTitle>{dialogType === 'link' ? 'Insert Link' : 'Insert Image'}</DialogTitle>
                        <DialogDescription>
                            {dialogType === 'link' 
                                ? 'Enter the URL for this link.' 
                                : 'Enter the URL or upload a file for the image.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                autoFocus
                                className="input-etched"
                                disabled={uploading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                        {dialogType === 'image' && (
                            <div className="space-y-2 pt-4 border-t border-muted/20">
                                <Label htmlFor="file">Or Upload Image File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                    className="file:text-foreground cursor-pointer"
                                />
                                {uploading && (
                                    <p className="text-xs text-muted-foreground animate-pulse">
                                        Uploading and optimizing image...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} disabled={uploading} className="btn-ghost-specular px-6">
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} disabled={uploading || (dialogType === 'image' && (!url || url === 'https://'))} className="btn-specular px-8">
                            {dialogType === 'link' ? 'Set Link' : 'Insert Image'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export function RichTextEditor({ content, onChange, error }: Props) {
    const editor = useEditor({
        extensions: [
            UploadPlaceholder,
            StarterKit.configure({
                link: false,
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-4',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal ml-4',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'italic',
                    },
                },
            }),
            Link.extend({
                inclusive: false,
            }).configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full max-h-[500px] object-contain rounded-xl my-2 border border-border/50',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none tiptap',
            },
        },
    });

    const uploadImageFile = useCallback(async (file: File) => {
        if (!editor) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error(`Image ${file.name} size must be less than 5MB.`);
            return;
        }

        const uploadId = Math.random().toString(36).substring(7);

        // Insert the placeholder node at current cursor position
        editor.chain().focus().insertContent({
            type: 'uploadPlaceholder',
            attrs: { id: uploadId, fileName: file.name }
        }).run();

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/announcements/upload-asset', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to upload image');
            }

            const data = await response.json();

            // Find the position of the placeholder node with this ID
            let foundPos = -1;
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'uploadPlaceholder' && node.attrs.id === uploadId) {
                    foundPos = pos;
                    return false; // Stop iterating
                }
            });

            if (foundPos !== -1) {
                editor.chain()
                    .focus()
                    .setTextSelection({ from: foundPos, to: foundPos + 1 })
                    .deleteSelection()
                    .setImage({ src: data.url })
                    .run();
            } else {
                editor.chain().focus().setImage({ src: data.url }).run();
            }
        } catch (error: any) {
            toast.error(error.message || `Failed to upload ${file.name}`);
            
            // Remove placeholder on error
            let foundPos = -1;
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'uploadPlaceholder' && node.attrs.id === uploadId) {
                    foundPos = pos;
                    return false;
                }
            });
            if (foundPos !== -1) {
                editor.chain()
                    .focus()
                    .setTextSelection({ from: foundPos, to: foundPos + 1 })
                    .deleteSelection()
                    .run();
            }
        }
    }, [editor]);

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        if (!editor) return;

        editor.setOptions({
            editorProps: {
                handleDrop(view, event) {
                    const files = event.dataTransfer?.files;
                    if (files && files.length > 0) {
                        const images = Array.from(files).filter(file => file.type.startsWith('image/'));
                        if (images.length > 0) {
                            event.preventDefault();
                            images.forEach(uploadImageFile);
                            return true;
                        }
                    }
                    return false;
                },
                handlePaste(view, event) {
                    const files = event.clipboardData?.files;
                    if (files && files.length > 0) {
                        const images = Array.from(files).filter(file => file.type.startsWith('image/'));
                        if (images.length > 0) {
                            event.preventDefault();
                            images.forEach(uploadImageFile);
                            return true;
                        }
                    }
                    return false;
                }
            }
        });
    }, [editor, uploadImageFile]);

    return (
        <div className={cn('border rounded-xl overflow-hidden matte-card elev-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20', error ? 'border-destructive' : 'border-input')}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {error && <p className="text-xs text-destructive p-2 font-medium bg-destructive/5 border-t border-destructive/10">{error}</p>}
        </div>
    );
}
