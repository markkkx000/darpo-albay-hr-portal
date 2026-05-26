import { Head } from '@inertiajs/react';
import { AnnouncementForm } from '@/components/Announcements/AnnouncementForm';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, manage, store } from '@/routes/announcements';

interface Props {
    divisions: any[];
    positions: any[];
    users: any[];
}

export default function Create({ divisions, positions, users }: Props) {
    return (
        <>
            <Head title="Create Announcement" />

            <div className="p-6 lg:p-10 w-full flex flex-col items-center">
                <div className="w-full max-w-4xl space-y-8">
                    <Heading 
                        title="Create Announcement" 
                        description="Draft a new announcement. You can publish it once you are done."
                    />

                    <Card className="matte-card elev-2 border-none overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-6 px-8 pt-8">
                            <CardTitle className="text-xl font-bold tracking-tight">Announcement Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <AnnouncementForm 
                                submitUrl={store().url}
                                method="post"
                                divisions={divisions}
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
