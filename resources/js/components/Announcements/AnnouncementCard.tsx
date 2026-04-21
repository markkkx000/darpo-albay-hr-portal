import DOMPurify from 'dompurify';
import { ChevronDown, ChevronUp, User, Calendar, Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        normal: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    return (
        <Card className="overflow-hidden border-none shadow-md bg-background hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-4 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-primary" />
                            <CardTitle className="text-xl font-bold leading-tight">
                                {announcement.title}
                            </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {announcement.author?.name || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {announcement.published_at ? formatDate(announcement.published_at) : 'Draft'}
                            </span>
                            <Badge variant="outline" className={cn("capitalize font-normal", priorityColors[announcement.priority as keyof typeof priorityColors])}>
                                {announcement.priority}
                            </Badge>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                </div>
            </CardHeader>
            
            {isExpanded && (
                <CardContent className="p-4 pt-0 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="prose prose-sm dark:prose-invert max-w-none border-t pt-4 border-muted/50">
                        <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
