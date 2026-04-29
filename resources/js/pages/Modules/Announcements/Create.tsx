import { Head } from '@inertiajs/react';
import { AnnouncementForm } from '@/components/Announcements/AnnouncementForm';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, manage, store } from '@/routes/announcements';

interface Props {
    departments: any[];
    positions: any[];
    users: any[];
}

export default function Create({ departments, positions, users }: Props) {
    return (
        <>
            <Head title="Create Announcement" />

            <div className="p-6 lg:p-10 w-full flex flex-col items-center animate-fade-up">
                <div className="w-full max-w-4xl space-y-8">
                    <Heading 
                        title="Create Announcement" 
                        description="Draft a new announcement. You can publish it once you are done."
                    />

                    <Card className="liquid-glass-card border-none overflow-hidden shadow-2xl">
                        <CardHeader className="border-b border-white/5 pb-6 px-8 pt-8">
                            <CardTitle className="text-xl font-bold tracking-tight">Announcement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <AnnouncementForm 
                                submitUrl={store().url}
                                method="post"
                                departments={departments}
                                positions={positions}
                                users={users}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'Manage', href: manage().url },
        { title: 'Create', href: '#' },
    ],
};
