import { Head, Link } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { ArrowLeft, Calendar, User, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

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

                <Card className="border-none shadow-lg overflow-hidden bg-background">
                    <CardHeader className="bg-muted/30 pb-6 border-b border-muted/30">
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
                                    "capitalize font-normal text-xs",
                                    announcement.priority === 'high' ? 'bg-red-500/10 text-red-600 border-red-200' :
                                    announcement.priority === 'low' ? 'bg-blue-500/10 text-blue-600 border-blue-200' : 
                                    'bg-gray-500/10 text-gray-600 border-gray-200'
                                )}>
                                    {announcement.priority} Priority
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

// Need to import cn since it's used in the badge
import { cn } from '@/lib/utils';
import { index } from '@/routes/announcements';

Show.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'View Announcement', href: '#' },
    ],
};
