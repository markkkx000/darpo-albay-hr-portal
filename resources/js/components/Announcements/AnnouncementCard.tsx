import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, User, Calendar, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { cn, formatDate } from '@/lib/utils';

interface Props {
    announcement: {
        id: number;
        title: string;
        content: string;
        priority: string;
        published_at: string;
        author?: {
            name: string;
        };
    };
    defaultExpanded?: boolean;
}

export function AnnouncementCard({ announcement, defaultExpanded = false }: Props) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const priorityColors = {
        low: 'status-badge-unknown',
        normal: 'status-badge-permanent',
        high: 'status-badge-danger animate-pulse',
    };

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
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                announcement.published_at ? "status-badge-permanent" : "status-badge-unknown"
                            )}>
                                {announcement.published_at ? 'Published' : 'Draft'}
                            </span>
                            {announcement.published_at && (
                                <span className="ml-1 opacity-70">
                                    {formatDate(announcement.published_at)}
                                </span>
                            )}
                        </span>
                        <Badge variant="outline" className={cn("px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", priorityColors[announcement.priority as keyof typeof priorityColors])}>
                            {announcement.priority}
                        </Badge>
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
                    <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-5 border-border/50 leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    </div>
                </div>
            )}
        </div>
    );
}
