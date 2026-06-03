import { Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, User, Calendar, Megaphone } from 'lucide-react';
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

export function AnnouncementCard({ announcement, defaultExpanded = false }: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);


    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    return (
        <div 
            className={cn(
                "matte-card elev-2 overflow-hidden transition duration-300 group cursor-pointer",
                announcement.priority === 'high' ? "border-red-500/40 ring-1 ring-red-500/10" : "",
                isExpanded ? "border-primary/40 shadow-lg shadow-primary/5" : "hover:translate-x-1"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "sqicon p-2 rounded-xl transition-transform duration-300 group-hover:scale-110",
                            announcement.priority === 'high' 
                                ? "sqicon-red" 
                                : announcement.priority === 'low'
                                ? "sqicon-grey"
                                : "sqicon-green"
                        )}>
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <h3 className="t-headline leading-tight text-foreground">
                            {announcement.title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {announcement.author?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {announcement.published_at ? (
                                <span>{formatDate(announcement.published_at)}</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-unknown">
                                    Draft
                                </span>
                            )}
                        </span>
                        {announcement.priority === 'high' && (
                            <Badge variant="outline" className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-danger animate-pulse">
                                High Priority
                            </Badge>
                        )}
                        {announcement.is_event && announcement.event_date && (
                            <span className="flex items-center gap-1.5 ml-2">
                                <Calendar className="h-3.5 w-3.5 text-primary" />
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-info">
                                    Event Date
                                </span>
                                <span className="ml-1 opacity-90 text-primary font-bold">
                                    {formatDate(announcement.event_date)}
                                </span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="icon" className="btn-ghost-specular shrink-0 rounded-full border-none">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            
            {isExpanded && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mt-1"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    />
                    <div className="flex justify-end mt-4 pt-4 border-t border-border/40">
                        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-3">
                            <Link href={show(announcement.id).url}>
                                View
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
