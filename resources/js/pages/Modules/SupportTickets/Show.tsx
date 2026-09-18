import { Head, useForm, usePage, usePoll } from '@inertiajs/react';
import {
    User as UserIcon,
    Paperclip,
    X,
    Heading,
    Bold,
    Italic,
    List,
    ListOrdered,
    CheckSquare,
    Code,
    Link,
    CheckCircle2,
    RotateCcw,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { index as supportTicketsIndex, reply } from '@/routes/supporttickets';
import type { PageProps } from '@/types';

type Ticket = {
    id: number;
    github_issue_id: string;
    title: string;
    type: string;
    status: string;
    created_at: string;
};

type Comment = {
    id: number | string;
    body: string;
    created_at: string;
    user?: {
        login: string;
        avatar_url: string;
    };
    actor?: {
        login: string;
        avatar_url: string;
    };
    event?: string;
};

type Props = {
    ticket: Ticket;
    comments: Comment[];
};

export default function SupportTicketShow({ ticket, comments }: Props) {
    const { auth } = usePage<PageProps>().props;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            body: '',
            attachments: [] as File[],
        });

    // Only poll if the ticket is open to save API rate limits (10 seconds)
    // If closed, set a massive interval (essentially paused) since Inertia doesn't natively disable usePoll
    usePoll(ticket.status === 'open' ? 10000 : 86400000, {
        only: ['comments', 'ticket'],
    });

    const insertMarkdown = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = data.body;

        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selected + suffix + after;
        setData('body', newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                end + prefix.length,
            );
        }, 0);
    };

    const [activeTab, setActiveTab] = useState('write');

    const bottomRef = useRef<HTMLDivElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(reply.url(ticket.id), {
            onSuccess: () => {
                reset();
                clearErrors();
                setTimeout(
                    () =>
                        bottomRef.current?.scrollIntoView({
                            behavior: 'smooth',
                        }),
                    100,
                );
            },
        });
    };

    return (
        <>
            <Head title={`Ticket: ${ticket.title}`} />
            <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col">
                <div className="flex-none border-b p-6 pb-2">
                    <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {ticket.title}
                            </h1>
                            <div className="mt-2 flex items-center gap-2">
                                <Badge
                                    variant={
                                        ticket.status === 'closed'
                                            ? 'secondary'
                                            : 'default'
                                    }
                                >
                                    {ticket.status}
                                </Badge>
                                <Badge variant="outline">{ticket.type}</Badge>
                                <span className="ml-2 text-sm text-muted-foreground">
                                    Opened on{' '}
                                    {new Date(
                                        ticket.created_at,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-muted/20 p-6">
                    <div className="mx-auto max-w-3xl space-y-6">
                        {comments.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground">
                                No comments yet on this ticket thread.
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Vertical line connecting timeline events */}
                                <div className="absolute top-8 bottom-8 left-[1.125rem] -z-10 hidden w-0.5 bg-border sm:block"></div>
                                <div className="space-y-6">
                                    {comments.map((comment) => {
                                        if (
                                            comment.event === 'closed' ||
                                            comment.event === 'reopened'
                                        ) {
                                            const actor =
                                                comment.actor?.login || 'User';
                                            const isClosed =
                                                comment.event === 'closed';

                                            return (
                                                <div
                                                    key={comment.id}
                                                    className="flex items-center gap-3 py-2 pl-12"
                                                >
                                                    <div
                                                        className={`-ml-11 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm sm:-ml-0 ${isClosed ? 'border border-purple-500/20 bg-purple-500/10 text-purple-500' : 'border border-green-500/20 bg-green-500/10 text-green-500'}`}
                                                    >
                                                        {isClosed ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : (
                                                            <RotateCcw className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="mr-1 font-semibold text-foreground">
                                                            {actor}
                                                        </span>
                                                        {isClosed
                                                            ? 'closed this as completed'
                                                            : 'reopened this'}
                                                        <span className="ml-1 opacity-75">
                                                            {new Date(
                                                                comment.created_at,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Skip other non-comment events
                                        if (
                                            comment.event !== 'commented' &&
                                            comment.body === undefined
                                        ) {
                                            return null;
                                        }

                                        let authorName =
                                            comment.user?.login || 'User';
                                        let displayBody = comment.body || '';
                                        let isFromAppUser = false;

                                        const replyMatch = displayBody.match(
                                            /^\*\*Reply from (.*?)(?: \((.*?)\))?:\*\*\s*(.*)$/s,
                                        );
                                        const submitMatch = displayBody.match(
                                            /^\*\*Submitted by:\*\* (.*?)(?: \((.*?)\))?\n/,
                                        );

                                        if (replyMatch) {
                                            authorName = replyMatch[1];
                                            displayBody = replyMatch[3];
                                            isFromAppUser = true;
                                        } else if (submitMatch) {
                                            authorName = submitMatch[1];
                                            isFromAppUser = true;
                                        }

                                        return (
                                            <div
                                                key={comment.id}
                                                className="flex gap-4"
                                            >
                                                {isFromAppUser ? (
                                                    auth.user?.avatar ? (
                                                        <img
                                                            src={
                                                                auth.user.avatar
                                                            }
                                                            alt={authorName}
                                                            className="z-10 h-10 w-10 shrink-0 rounded-full border bg-muted object-cover"
                                                        />
                                                    ) : (
                                                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                                                            <UserIcon className="h-5 w-5" />
                                                        </div>
                                                    )
                                                ) : comment.user?.avatar_url ? (
                                                    <img
                                                        src={
                                                            comment.user
                                                                .avatar_url
                                                        }
                                                        alt={authorName}
                                                        className="z-10 h-10 w-10 shrink-0 rounded-full border bg-muted object-cover"
                                                    />
                                                ) : (
                                                    <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                                                        <UserIcon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div className="z-10 flex-1 overflow-hidden rounded-lg border bg-background shadow-sm">
                                                    <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">
                                                                {authorName}
                                                            </span>
                                                            {isFromAppUser ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="h-5 px-1.5 py-0 text-[10px] font-medium"
                                                                >
                                                                    User
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="h-5 border-transparent bg-primary/20 px-1.5 py-0 text-[10px] font-medium text-primary hover:bg-primary/30">
                                                                    Support
                                                                    Agent
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-muted-foreground">
                                                            {new Date(
                                                                comment.created_at,
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="prose prose-sm max-w-none p-4 text-sm leading-relaxed dark:prose-invert">
                                                        <ReactMarkdown
                                                            remarkPlugins={[
                                                                remarkGfm,
                                                            ]}
                                                        >
                                                            {displayBody}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <div className="flex-none border-t bg-background p-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                            <form onSubmit={handleSubmit}>
                                <Tabs
                                    defaultValue="write"
                                    className="w-full"
                                    onValueChange={setActiveTab}
                                >
                                    <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
                                        <TabsList className="h-auto border-none bg-transparent p-0">
                                            <TabsTrigger
                                                value="write"
                                                className="rounded-md px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                            >
                                                Write
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="preview"
                                                className="rounded-md px-4 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                            >
                                                Preview
                                            </TabsTrigger>
                                        </TabsList>

                                        {activeTab === 'write' && (
                                            <div className="flex hidden items-center gap-1 text-muted-foreground sm:flex">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('### ')
                                                    }
                                                >
                                                    <Heading className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '**',
                                                            '**',
                                                        )
                                                    }
                                                >
                                                    <Bold className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('_', '_')
                                                    }
                                                >
                                                    <Italic className="h-4 w-4" />
                                                </Button>
                                                <div className="mx-1 h-4 w-[1px] bg-border"></div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('- ')
                                                    }
                                                >
                                                    <List className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('1. ')
                                                    }
                                                >
                                                    <ListOrdered className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('- [ ] ')
                                                    }
                                                >
                                                    <CheckSquare className="h-4 w-4" />
                                                </Button>
                                                <div className="mx-1 h-4 w-[1px] bg-border"></div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown('`', '`')
                                                    }
                                                >
                                                    <Code className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        insertMarkdown(
                                                            '[',
                                                            '](url)',
                                                        )
                                                    }
                                                >
                                                    <Link className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {activeTab === 'write' && (
                                        <Textarea
                                            ref={textareaRef}
                                            placeholder="Use Markdown to format your comment"
                                            className="min-h-[150px] resize-y rounded-none border-none p-4 shadow-none focus-visible:ring-0"
                                            value={data.body}
                                            onChange={(e) =>
                                                setData('body', e.target.value)
                                            }
                                            required
                                        />
                                    )}

                                    {activeTab === 'preview' && (
                                        <div className="m-0 prose prose-sm min-h-[150px] max-w-none border-none p-4 dark:prose-invert">
                                            {data.body ? (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                >
                                                    {data.body}
                                                </ReactMarkdown>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Nothing to preview
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Tabs>
                                <InputError
                                    message={errors.body}
                                    className="px-4"
                                />

                                <div className="flex flex-col justify-between gap-4 border-t bg-muted/50 px-4 py-3 sm:flex-row sm:items-center">
                                    <div className="flex w-full flex-col gap-2 sm:w-auto">
                                        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                                            <Paperclip className="h-4 w-4" />
                                            <span>
                                                Paste, drop, or click to add
                                                files
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept=".jpg,.jpeg,.png,.gif,.webp"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const newFiles =
                                                            Array.from(
                                                                e.target.files,
                                                            );

                                                        if (
                                                            data.attachments
                                                                .length +
                                                                newFiles.length >
                                                            10
                                                        ) {
                                                            alert(
                                                                'Maximum 10 images allowed.',
                                                            );

                                                            return;
                                                        }

                                                        setData('attachments', [
                                                            ...data.attachments,
                                                            ...newFiles,
                                                        ]);
                                                    }

                                                    // Reset input so the same file can be selected again if removed
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                        <p className="max-w-sm text-[10px] text-muted-foreground">
                                            Please refrain from uploading
                                            sensitive data. Allowed formats:
                                            JPG, PNG, GIF, WEBP (max 5MB each).
                                        </p>

                                        {data.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {data.attachments.map(
                                                    (file, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="h-6 gap-1 pr-1 pl-2"
                                                        >
                                                            <span className="max-w-[150px] truncate">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    const newFiles =
                                                                        [
                                                                            ...data.attachments,
                                                                        ];
                                                                    newFiles.splice(
                                                                        index,
                                                                        1,
                                                                    );
                                                                    setData(
                                                                        'attachments',
                                                                        newFiles,
                                                                    );
                                                                }}
                                                                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                        <InputError
                                            message={
                                                errors.attachments as string
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex shrink-0 items-center justify-end gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full sm:w-auto"
                                        >
                                            {processing
                                                ? 'Posting...'
                                                : 'Comment'}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

SupportTicketShow.layout = {
    breadcrumbs: [
        { title: 'My Tickets', href: supportTicketsIndex.url() },
        { title: 'Ticket Details', href: '#' },
    ],
};
