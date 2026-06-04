import { Head, useForm, usePage, usePoll } from '@inertiajs/react';
import { User as UserIcon, Paperclip, X, Heading, Bold, Italic, List, ListOrdered, CheckSquare, Code, Link, CheckCircle2, RotateCcw } from 'lucide-react';
import type { FormEvent} from 'react';
import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { index as supportTicketsIndex, reply } from '@/routes/supporttickets';

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
    const { auth } = usePage().props as any;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
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
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
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
                setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            },
        });
    };

    return (
        <>
            <Head title={`Ticket: ${ticket.title}`} />
            <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
                <div className="flex-none p-6 pb-2 border-b">
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{ticket.title}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={ticket.status === 'closed' ? 'secondary' : 'default'}>
                                    {ticket.status}
                                </Badge>
                                <Badge variant="outline">{ticket.type}</Badge>
                                <span className="text-sm text-muted-foreground ml-2">
                                    Opened on {new Date(ticket.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {comments.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                No comments yet on this ticket thread.
                            </div>
                        ) : (
                            <div className="relative">
                                {/* Vertical line connecting timeline events */}
                                <div className="absolute left-[1.125rem] top-8 bottom-8 w-0.5 bg-border -z-10 hidden sm:block"></div>
                                <div className="space-y-6">
                                    {comments.map((comment) => {
                                        if (comment.event === 'closed' || comment.event === 'reopened') {
                                            const actor = comment.actor?.login || 'User';
                                            const isClosed = comment.event === 'closed';

                                            return (
                                                <div key={comment.id} className="flex items-center gap-3 py-2 pl-12">
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full shadow-sm shrink-0 -ml-11 sm:-ml-0 ${isClosed ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                        {isClosed ? <CheckCircle2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-semibold text-foreground mr-1">{actor}</span>
                                                        {isClosed ? 'closed this as completed' : 'reopened this'}
                                                        <span className="ml-1 opacity-75">{new Date(comment.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Skip other non-comment events
                                        if (comment.event !== 'commented' && comment.body === undefined) {
                                            return null;
                                        }

                                        let authorName = comment.user?.login || 'User';
                                        let displayBody = comment.body || '';
                                        let isFromAppUser = false;

                                        const replyMatch = displayBody.match(/^\*\*Reply from (.*?)(?: \((.*?)\))?:\*\*\s*(.*)$/s);
                                        const submitMatch = displayBody.match(/^\*\*Submitted by:\*\* (.*?)(?: \((.*?)\))?\n/);

                                        if (replyMatch) {
                                            authorName = replyMatch[1];
                                            displayBody = replyMatch[3];
                                            isFromAppUser = true;
                                        } else if (submitMatch) {
                                            authorName = submitMatch[1];
                                            isFromAppUser = true;
                                        }

                                        return (
                                            <div key={comment.id} className="flex gap-4">
                                                {isFromAppUser ? (
                                                    auth.user?.avatar ? (
                                                        <img 
                                                            src={auth.user.avatar} 
                                                            alt={authorName}
                                                            className="w-10 h-10 rounded-full bg-muted border shrink-0 object-cover z-10" 
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-muted border shrink-0 flex items-center justify-center text-muted-foreground z-10">
                                                            <UserIcon className="h-5 w-5" />
                                                        </div>
                                                    )
                                                ) : (
                                                    comment.user?.avatar_url ? (
                                                        <img 
                                                            src={comment.user.avatar_url} 
                                                            alt={authorName}
                                                            className="w-10 h-10 rounded-full bg-muted border shrink-0 object-cover z-10" 
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-muted border shrink-0 flex items-center justify-center text-muted-foreground z-10">
                                                            <UserIcon className="h-5 w-5" />
                                                        </div>
                                                    )
                                                )}
                                                <div className="flex-1 bg-background border rounded-lg overflow-hidden shadow-sm z-10">
                                                    <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{authorName}</span>
                                                            {isFromAppUser ? (
                                                                <Badge variant="secondary" className="text-[10px] h-5 py-0 px-1.5 font-medium">User</Badge>
                                                            ) : (
                                                                <Badge className="text-[10px] h-5 py-0 px-1.5 bg-primary/20 text-primary hover:bg-primary/30 border-transparent font-medium">Support Agent</Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="p-4 text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
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

                <div className="flex-none p-6 border-t bg-background">
                    <div className="max-w-3xl mx-auto">
                        <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
                            <form onSubmit={handleSubmit}>
                                <Tabs defaultValue="write" className="w-full" onValueChange={setActiveTab}>
                                    <div className="bg-muted px-4 py-2 flex items-center justify-between border-b">
                                        <TabsList className="bg-transparent border-none h-auto p-0">
                                            <TabsTrigger value="write" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-md text-sm">Write</TabsTrigger>
                                            <TabsTrigger value="preview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-md text-sm">Preview</TabsTrigger>
                                        </TabsList>
                                        
                                        {activeTab === 'write' && (
                                            <div className="flex items-center gap-1 text-muted-foreground hidden sm:flex">
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('### ')}><Heading className="h-4 w-4" /></Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('**', '**')}><Bold className="h-4 w-4" /></Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('_', '_')}><Italic className="h-4 w-4" /></Button>
                                                <div className="w-[1px] h-4 bg-border mx-1"></div>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('1. ')}><ListOrdered className="h-4 w-4" /></Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('- [ ] ')}><CheckSquare className="h-4 w-4" /></Button>
                                                <div className="w-[1px] h-4 bg-border mx-1"></div>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('`', '`')}><Code className="h-4 w-4" /></Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown('[', '](url)')}><Link className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {activeTab === 'write' && (
                                        <Textarea 
                                            ref={textareaRef}
                                            placeholder="Use Markdown to format your comment" 
                                            className="min-h-[150px] border-none focus-visible:ring-0 resize-y p-4 rounded-none shadow-none"
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            required
                                        />
                                    )}
                                    
                                    {activeTab === 'preview' && (
                                        <div className="p-4 m-0 min-h-[150px] border-none prose prose-sm max-w-none dark:prose-invert">
                                            {data.body ? (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.body}</ReactMarkdown>
                                            ) : (
                                                <span className="text-muted-foreground">Nothing to preview</span>
                                            )}
                                        </div>
                                    )}
                                </Tabs>
                                <InputError message={errors.body} className="px-4" />
                            
                            <div className="bg-muted/50 px-4 py-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors w-fit">
                                        <Paperclip className="h-4 w-4" />
                                        <span>Paste, drop, or click to add files</span>
                                        <input 
                                            type="file" 
                                            multiple 
                                            className="hidden" 
                                            accept=".jpg,.jpeg,.png,.gif,.webp"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const newFiles = Array.from(e.target.files);

                                                    if (data.attachments.length + newFiles.length > 10) {
                                                        alert('Maximum 10 images allowed.');

                                                        return;
                                                    }

                                                    setData('attachments', [...data.attachments, ...newFiles]);
                                                }

                                                // Reset input so the same file can be selected again if removed
                                                e.target.value = '';
                                            }}
                                        />
                                    </label>
                                    <p className="text-[10px] text-muted-foreground max-w-sm">Please refrain from uploading sensitive data. Allowed formats: JPG, PNG, GIF, WEBP (max 5MB each).</p>
                                    
                                    {data.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {data.attachments.map((file, index) => (
                                                <Badge key={index} variant="secondary" className="gap-1 pl-2 pr-1 h-6">
                                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const newFiles = [...data.attachments];
                                                            newFiles.splice(index, 1);
                                                            setData('attachments', newFiles);
                                                        }}
                                                        className="rounded-full hover:bg-muted p-0.5 ml-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={errors.attachments as string} className="mt-1" />
                                </div>
                                <div className="flex items-center justify-end gap-2 shrink-0">
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full sm:w-auto"
                                    >
                                        {processing ? 'Posting...' : 'Comment'}
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
        { title: 'Ticket Details', href: '#' }
    ]
};
