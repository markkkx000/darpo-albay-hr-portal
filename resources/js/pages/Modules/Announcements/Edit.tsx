import { Head } from '@inertiajs/react';
import { AnnouncementForm } from '@/components/Announcements/AnnouncementForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, manage, update } from '@/routes/announcements';

interface Props {
    announcement: any;
    divisions: any[];
    positions: any[];
    users: any[];
}

export default function Edit({
    announcement,
    divisions,
    positions,
    users,
}: Props) {
    return (
        <>
            <Head title={`Edit: ${announcement.title}`} />

            <div className="w-full space-y-6 p-4">
                <div className="matte-card elev-1 flex flex-col justify-between gap-4 rounded-2xl px-6 py-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="t-headline">Edit Announcement</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Update your announcement draft.
                        </p>
                    </div>
                </div>

                <Card className="matte-card elev-2 max-w-4xl border-none">
                    <CardHeader>
                        <CardTitle>Announcement Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementForm
                            announcement={announcement}
                            submitUrl={update(announcement.id).url}
                            method="put"
                            divisions={divisions}
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
