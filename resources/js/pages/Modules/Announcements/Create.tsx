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

            <div className="p-4 w-full space-y-6">
                <Heading 
                    title="Create Announcement" 
                    description="Draft a new announcement. You can publish it once you are done."
                />

                <Card className="liquid-glass-card max-w-4xl border-none overflow-hidden">
                    <CardHeader className="border-b border-muted/20 pb-4">
                        <CardTitle>Announcement Details</CardTitle>
                    </CardHeader>
                    <CardContent>
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
