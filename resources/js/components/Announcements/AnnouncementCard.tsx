import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, User, Calendar, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

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
        low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
        normal: 'bg-muted text-muted-foreground border-border',
        high: 'bg-destructive/10 text-destructive border-destructive/30 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse font-bold',
    };

    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    return (
        <div 
            className={cn(
                "overflow-hidden transition-all duration-300 liquid-glass-card group cursor-pointer",
                announcement.priority === 'high' ? "border-red-500/40 ring-1 ring-red-500/10" : "",
                isExpanded ? "ring-2 ring-primary/20" : "hover:translate-x-1"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            announcement.priority === 'high' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                        )}>
                            <Megaphone className="h-4 w-4" />
                        </div>
                        <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground">
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
                            {announcement.published_at ? formatDate(announcement.published_at) : 'Draft'}
                        </span>
                        <Badge variant="outline" className={cn("px-3 py-0.5 rounded-full text-[10px]", priorityColors[announcement.priority as keyof typeof priorityColors])}>
                            {announcement.priority}
                        </Badge>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-primary/10 hover:text-primary">
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
