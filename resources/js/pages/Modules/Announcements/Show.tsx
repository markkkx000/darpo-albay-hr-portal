import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, User, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatDate } from '@/lib/utils';
import { index } from '@/routes/announcements';

interface Props {
    announcement: any;
}

export default function Show({ announcement }: Props) {
    const sanitizedContent = DOMPurify.sanitize(announcement.content);

    return (
        <>
            <Head title={announcement.title} />

            <div className="p-4 w-full max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2">
                    <Link href={index().url}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Announcements
                        </Button>
                    </Link>
                </div>

                <Card className="matte-card elev-2 border-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 pb-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Megaphone className="h-5 w-5" />
                                <span>Announcement</span>
                            </div>
                            
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {announcement.title}
                            </CardTitle>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span>{announcement.author?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <span>
                                        {announcement.published_at 
                                            ? formatDate(announcement.published_at, { dateStyle: 'long', timeStyle: 'short' }) 
                                            : 'Draft - Created on ' + formatDate(announcement.created_at, { dateStyle: 'long' })
                                        }
                                    </span>
                                </div>
                                <Badge variant="outline" className={cn(
                                    "uppercase font-bold text-[10px] px-3 py-1 rounded-full border tracking-wider transition-all",
                                    announcement.priority === 'high'
                                        ? 'bg-red-500/10 text-red-500 border-red-500/50 dark:text-red-400 dark:border-red-500/30 animate-pulse ring-1 ring-red-500/20'
                                        : announcement.priority === 'low'
                                        ? 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400 dark:border-green-500/20'
                                        : 'bg-muted text-muted-foreground border-border dark:bg-muted/50 dark:text-muted-foreground dark:border-border/50'
                                )}>
                                    {announcement.priority}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Show.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'View Announcement', href: '#' },
    ],
};
