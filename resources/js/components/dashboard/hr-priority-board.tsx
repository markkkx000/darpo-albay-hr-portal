import { Link } from '@inertiajs/react';
import { Activity, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export function HrPriorityBoard({
    data,
    layoutId = 'hr-priority-tabs',
}: {
    data: any;
    layoutId?: string;
}) {
    const [activeTab, setActiveTab] = useState('action-items');

    return (
        <div className="matte-card elev-2 min-h-[400px]">
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="relative z-10 flex h-full flex-col p-6"
            >
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="t-headline">Priority Board</h3>
                    <div className="w-full sm:w-auto">
                        <SlidingTabs
                            tabs={[
                                {
                                    value: 'action-items',
                                    label: 'Action Items',
                                    active: activeTab === 'action-items',
                                },
                                {
                                    value: 'activity-logs',
                                    label: 'Activity Logs',
                                    active: activeTab === 'activity-logs',
                                },
                            ]}
                            layoutId={layoutId}
                            onChange={setActiveTab}
                        />
                    </div>
                </div>

                <TabsContent value="action-items" className="mt-0 flex-1">
                    {!data.action_items || data.action_items.length === 0 ? (
                        <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">
                                Inbox Zero!
                            </p>
                            <p className="max-w-[220px] text-xs text-muted-foreground/60">
                                All pending leaves and document requests have
                                been cleared.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-[350px] space-y-4 overflow-y-auto pr-2">
                            {data.action_items.map((item: any) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="mt-0.5">
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold">
                                            {item.title}
                                        </div>
                                        <div className="mt-0.5 text-xs leading-snug text-muted-foreground">
                                            {item.description}
                                        </div>
                                        {item.url && (
                                            <div className="mt-2">
                                                <Link
                                                    href={item.url}
                                                    className="bg-surface inline-flex h-6 items-center justify-center rounded-md border border-border-2 px-3 text-[11px] font-medium text-foreground hover:bg-surface-2"
                                                >
                                                    {item.action_text ||
                                                        'View Details'}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="activity-logs" className="mt-0 flex-1">
                    {!data.recentActivity ||
                    data.recentActivity.length === 0 ? (
                        <div className="flex min-h-[250px] flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No recent activity
                            </p>
                            <p className="max-w-[200px] text-xs text-muted-foreground/60">
                                HR actions like leave approvals and onboarding
                                will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-[350px] space-y-4 overflow-y-auto pr-2">
                            {data.recentActivity.map((activity: any) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 rounded-lg p-3"
                                >
                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                        {activity.type ===
                                        'attendance_clock' ? (
                                            <Clock className="h-4 w-4" />
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {activity.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {activity.description}
                                        </p>
                                    </div>
                                    <span className="mt-1 self-start text-[10px] font-medium whitespace-nowrap text-muted-foreground/75">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
