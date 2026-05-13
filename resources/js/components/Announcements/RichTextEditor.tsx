import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEditor, EditorContent } from '@tiptap/react';
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

const MenuBar = ({ editor }: { editor: any }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<'link' | 'image'>('link');
    const [url, setUrl] = useState('');

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
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
        
        setDialogOpen(false);
        setUrl('');
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
                                : 'Enter the URL for the image you want to embed.'}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleConfirm();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="btn-ghost-specular px-6">
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleConfirm} className="btn-specular px-8">
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
                    class: 'max-w-full h-auto rounded-xl my-2 border border-border/50',
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

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className={cn('border rounded-xl overflow-hidden matte-card elev-1 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/20', error ? 'border-destructive' : 'border-input')}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {error && <p className="text-xs text-destructive p-2 font-medium bg-destructive/5 border-t border-destructive/10">{error}</p>}
        </div>
    );
}
