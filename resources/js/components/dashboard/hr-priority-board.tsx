import { Link } from '@inertiajs/react';
import { Activity, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';

export function HrPriorityBoard({ data, layoutId = "hr-priority-tabs" }: { data: any, layoutId?: string }) {
    const [activeTab, setActiveTab] = useState('action-items');

    return (
        <div className="matte-card elev-2 min-h-[400px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10 p-6 h-full flex flex-col">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="t-headline">Priority Board</h3>
                    <div className="w-full sm:w-auto">
                        <SlidingTabs 
                            tabs={[
                                { value: 'action-items', label: 'Action Items', active: activeTab === 'action-items' },
                                { value: 'activity-logs', label: 'Activity Logs', active: activeTab === 'activity-logs' }
                            ]}
                            layoutId={layoutId}
                            onChange={setActiveTab}
                        />
                    </div>
                </div>

                <TabsContent value="action-items" className="flex-1 mt-0">
                    {!data.action_items || data.action_items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center min-h-[250px]">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">Inbox Zero!</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[220px]">All pending leaves and document requests have been cleared.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                            {data.action_items.map((item: any) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold">{item.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.description}</div>
                                        {item.url && (
                                            <div className="mt-2">
                                                <Link href={item.url} className="inline-flex items-center justify-center rounded-md text-[11px] font-medium border border-border-2 bg-surface hover:bg-surface-2 text-foreground h-6 px-3">
                                                    {item.action_text || 'View Details'}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="activity-logs" className="flex-1 mt-0">
                    {!data.recentActivity || data.recentActivity.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center min-h-[250px]">
                            <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                            <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                            <p className="text-xs text-muted-foreground/60 max-w-[200px]">HR actions like leave approvals and onboarding will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                            {data.recentActivity.map((activity: any) => (
                                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg">
                                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                                        {activity.type === 'attendance_clock' ? (
                                            <Clock className="h-4 w-4" />
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                    </div>
                                    <span className="text-[10px] font-medium text-muted-foreground/75 whitespace-nowrap self-start mt-1">
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
