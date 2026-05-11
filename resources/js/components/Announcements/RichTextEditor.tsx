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
import { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';

interface Props {
    content: string;
    onChange: (content: string) => void;
    error?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const setLink = useCallback(() => {
        if (!editor) {
return;
}

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL', previousUrl || 'https://');

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (!editor) {
return;
}

        const url = window.prompt('Enter image URL', 'https://');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

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
                onClick={setLink}
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
                onClick={addImage}
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
                        class: 'border-l-4 border-muted-foreground/30 pl-4 italic',
                    },
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-xl my-2',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className={cn('border rounded-xl overflow-hidden', error ? 'border-destructive' : 'border-input')}>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {error && <p className="text-xs text-destructive p-2">{error}</p>}
        </div>
    );
}
