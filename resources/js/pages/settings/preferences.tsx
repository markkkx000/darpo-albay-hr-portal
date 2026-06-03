import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { edit, update_notifications } from '@/routes/preferences';

interface NotificationPreferences {
    system: boolean;
    announcements: boolean;
    updates: boolean;
}

export default function Preferences({ notificationPreferences }: { notificationPreferences: NotificationPreferences }) {
    const { data, setData, patch, processing } = useForm({
        system: notificationPreferences.system ?? true,
        announcements: notificationPreferences.announcements ?? true,
        updates: notificationPreferences.updates ?? true,
    });

    const submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        patch(update_notifications().url, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Preferences" />

            <h1 className="sr-only">Preferences</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Notification Preferences"
                    description="Choose what you want to be notified about"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border border-border-2 p-4 matte-card elev-1">
                            <div className="space-y-0.5">
                                <div className="text-base font-semibold text-foreground">System</div>
                                <div className="text-sm text-muted-foreground">Receive critical system alerts and notifications.</div>
                            </div>
                            <Switch
                                checked={data.system}
                                onCheckedChange={(checked) => setData('system', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border-2 p-4 matte-card elev-1">
                            <div className="space-y-0.5">
                                <div className="text-base font-semibold text-foreground">Announcements</div>
                                <div className="text-sm text-muted-foreground">Receive alerts for newly posted events or announcements.</div>
                            </div>
                            <Switch
                                checked={data.announcements}
                                onCheckedChange={(checked) => setData('announcements', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border-2 p-4 matte-card elev-1">
                            <div className="space-y-0.5">
                                <div className="text-base font-semibold text-foreground">Updates</div>
                                <div className="text-sm text-muted-foreground">Receive notifications when your requests are processed or updated.</div>
                            </div>
                            <Switch
                                checked={data.updates}
                                onCheckedChange={(checked) => setData('updates', checked)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={processing} className="btn-premium">Save Preferences</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Preferences.layout = {
    breadcrumbs: [
        {
            title: 'Preferences',
            href: edit(),
        },
    ],
};
