import { Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import {
    ChevronDown,
    ChevronUp,
    User,
    Calendar,
    Megaphone,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn, formatDate } from '@/lib/utils';
import { show } from '@/routes/announcements';

interface Props {
    announcement: {
        id: number;
        title: string;
        content: string;
        priority: string;
        published_at: string;
        is_event?: boolean;
        event_date?: string;
        author?: {
            name: string;
        };
    };
    defaultExpanded?: boolean;
}

export function AnnouncementCard({
    announcement,
    defaultExpanded = false,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    return (
        <div
            className={cn(
                'matte-card elev-2 group cursor-pointer overflow-hidden transition duration-300',
                announcement.priority === 'high'
                    ? 'border-red-500/40 ring-1 ring-red-500/10'
                    : '',
                isExpanded
                    ? 'border-primary/40 shadow-lg shadow-primary/5'
                    : 'hover:translate-x-1',
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="flex items-start justify-between gap-4 p-5">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'sqicon rounded-xl p-2 transition-transform duration-300 group-hover:scale-110',
                                announcement.priority === 'high'
                                    ? 'sqicon-red'
                                    : announcement.priority === 'low'
                                      ? 'sqicon-grey'
                                      : 'sqicon-green',
                            )}
                        >
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <h3 className="t-headline leading-tight text-foreground">
                            {announcement.title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {announcement.author?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {announcement.published_at ? (
                                <span>
                                    {formatDate(announcement.published_at)}
                                </span>
                            ) : (
                                <span className="status-badge-unknown rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    Draft
                                </span>
                            )}
                        </span>
                        {announcement.priority === 'high' && (
                            <Badge
                                variant="outline"
                                className="status-badge-danger animate-pulse rounded-full px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                            >
                                High Priority
                            </Badge>
                        )}
                        {announcement.is_event && announcement.event_date && (
                            <span className="ml-2 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span className="status-badge-info rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                    Event Date
                                </span>
                                <span className="ml-1 font-bold text-primary opacity-90">
                                    {formatDate(announcement.event_date)}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="btn-ghost-specular shrink-0 rounded-full border-none"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="animate-in px-5 pb-5 duration-300 fade-in slide-in-from-top-2">
                    <div
                        className="prose prose-sm mt-1 max-w-none text-muted-foreground dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                    <div className="mt-4 flex justify-end border-t border-border/40 pt-4">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-muted-foreground hover:text-foreground"
                        >
                            <Link href={show(announcement.id).url}>View</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
