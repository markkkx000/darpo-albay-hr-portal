import { Head, Link, usePage } from '@inertiajs/react';
import { Megaphone, Settings } from 'lucide-react';
import { AnnouncementCard } from '@/components/Announcements/AnnouncementCard';
import Heading from '@/components/heading';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { index, manage } from '@/routes/announcements/index';

interface Props {
    announcements: {
        data: any[];
        links: any[];
        meta: any;
    };
}

export default function Index({ announcements }: Props) {
    const { auth } = usePage().props as any;
    const permissions = (auth.permissions || auth.user?.permissions || []) as string[];
    const canManage = permissions.includes('announcements.manage');

    return (
        <>
            <Head title="Announcements" />

            <div className="p-4 w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Heading 
                        title="Announcements" 
                        description="Stay updated with the latest news and information from the HR and management."
                    />
                    {canManage && (
                        <Link href={manage().url}>
                            <Button>
                                <Settings className="mr-2 h-4 w-4" />
                                Manage Announcements
                            </Button>
                        </Link>
                    )}
                </div>

                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 rounded-full bg-muted">
                            <Megaphone className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="t-headline">No announcements yet</h3>
                            <p className="text-muted-foreground max-w-xs">
                                Check back later for updates and news.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.data.map((announcement) => (
                            <AnnouncementCard key={announcement.id} announcement={announcement} />
                        ))}
                        
                        <div className="pt-4">
                            <Pagination links={announcements.links} meta={announcements.meta} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
    ],
};
