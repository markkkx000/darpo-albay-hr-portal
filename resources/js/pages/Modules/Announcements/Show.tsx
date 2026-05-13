import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, User, Megaphone } from 'lucide-react';
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
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "sqicon p-2 rounded-xl",
                                    announcement.priority === 'high' ? "sqicon-red shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "sqicon-green"
                                )}>
                                    <Megaphone className="h-4 w-4" />
                                </div>
                                <span className="text-primary font-bold uppercase tracking-widest text-xs">Announcement</span>
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
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        announcement.published_at ? "status-badge-permanent" : "status-badge-unknown"
                                    )}>
                                        {announcement.published_at ? 'Published' : 'Draft'}
                                    </span>
                                    {announcement.published_at && (
                                        <span className="opacity-70">
                                            {formatDate(announcement.published_at, { dateStyle: 'long' })}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "uppercase font-bold text-[10px] px-3 py-1 rounded-full tracking-wider transition-all shadow-sm",
                                    announcement.priority === 'high'
                                        ? 'status-badge-danger animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                        : announcement.priority === 'low'
                                            ? 'status-badge-unknown'
                                            : 'status-badge-permanent'
                                )}>
                                    {announcement.priority}
                                </span>
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
