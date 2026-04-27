import { Head } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';
import { AnnouncementCard } from '@/components/Announcements/AnnouncementCard';
import { Pagination } from '@/components/Pagination';

interface Props {
    announcements: {
        data: any[];
        links: any[];
        meta: any;
    };
}

export default function Index({ announcements }: Props) {
    return (
        <>
            <Head title="Announcements" />

            <div className="p-4 w-full space-y-6">
                <div className="liquid-glass flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5">
                    <div>
                        <h1 className="liquid-glass-title text-3xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-muted-foreground text-sm mt-2">
                            Stay updated with the latest news and information from the HR and management.
                        </p>
                    </div>
                </div>

                {announcements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-4 rounded-full bg-muted">
                            <Megaphone className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold">No announcements yet</h3>
                            <p className="text-muted-foreground max-w-xs">
                                Check back later for updates and news.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
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
        { title: 'Announcements', href: '#' },
    ],
};
