import { Head } from '@inertiajs/react';
import { AnnouncementForm } from '@/components/Announcements/AnnouncementForm';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, manage, update } from '@/routes/announcements';

interface Props {
    announcement: any;
    departments: any[];
    positions: any[];
    users: any[];
}

export default function Edit({ announcement, departments, positions, users }: Props) {
    return (
        <>
            <Head title={`Edit: ${announcement.title}`} />

            <div className="p-4 w-full space-y-6">
                <Heading 
                    title="Edit Announcement" 
                    description="Update your announcement draft."
                />

                <Card className="max-w-4xl border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Announcement Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementForm 
                            announcement={announcement}
                            submitUrl={update(announcement.id).url}
                            method="put"
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

Edit.layout = {
    breadcrumbs: [
        { title: 'Announcements', href: index().url },
        { title: 'Manage', href: manage().url },
        { title: 'Edit', href: '#' },
    ],
};
