import { Link } from '@inertiajs/react';
import { Activity, Clock, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { SlidingTabs } from '@/components/ui/sliding-tabs';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import announcements from '@/routes/announcements';
import attendance from '@/routes/attendance';
import leave from '@/routes/leave';
import personnel from '@/routes/personnel';

export function HROverview({ data, employeeData }: { data: any, employeeData?: any }) {
    const stats = data || { total_employees: 0, pending_leaves: 0, pending_docs: 0, active_today: 0, recentActivity: [], action_items: [] };
    const [activeTab, setActiveTab] = useState('action-items');

    return (
        <>
            <div className="grid animate-fade-up auto-rows-min gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Employees"
                    value={stats.total_employees ?? 0}
                    accentColor="#2192FF"
                />
                <StatCard
                    title="Pending Leaves"
                    value={stats.pending_leaves ?? 0}
                    accentColor="#38E54D"
                />
                <StatCard
                    title="Pending Docs"
                    value={stats.pending_docs ?? 0}
                    accentColor="#F43F5E"
                />
                <StatCard
                    title="Active Today"
                    value={stats.active_today ?? 0}
                    accentColor="#84cc16"
                />
            </div>

            <div className="grid animate-fade-up-delay-1 gap-4 md:grid-cols-2 mt-4">
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
                                    layoutId="hr-priority-tabs"
                                    onChange={setActiveTab}
                                />
                            </div>
                        </div>

                        <TabsContent value="action-items" className="flex-1 mt-0">
                            {!stats.action_items || stats.action_items.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center min-h-[250px]">
                                    <CheckCircle2 className="h-10 w-10 text-muted-foreground opacity-20" />
                                    <p className="text-sm font-medium text-muted-foreground">Inbox Zero!</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[200px]">All pending leaves and document requests have been cleared.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                    {stats.action_items.map((item: any) => (
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
                            {!stats.recentActivity || stats.recentActivity.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center min-h-[250px]">
                                    <Activity className="h-10 w-10 text-muted-foreground opacity-20" />
                                    <p className="text-sm font-medium text-muted-foreground">No recent activity</p>
                                    <p className="text-xs text-muted-foreground/60 max-w-[200px]">HR actions like leave approvals and onboarding will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2">
                                    {stats.recentActivity.map((activity: any) => (
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

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-2 h-full">
                    <Link href={personnel.index().url} className="matte-card elev-2 p-3 text-center hover:bg-surface-2 focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px]">
                        <div className="text-xs font-semibold">Employee Directory</div>
                    </Link>
                    <Link href={leave.index().url} className="matte-card elev-2 p-3 text-center hover:bg-surface-2 focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px]">
                        <div className="text-xs font-semibold">Leave Management</div>
                    </Link>
                    <Link href={attendance.manage.records.index().url} className="matte-card elev-2 p-3 text-center hover:bg-surface-2 focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px]">
                        <div className="text-xs font-semibold">Attendance Records</div>
                    </Link>
                    <Link href={announcements.manage().url} className="matte-card elev-2 p-3 text-center hover:bg-surface-2 focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full min-h-[190px]">
                        <div className="text-xs font-semibold">Announcements</div>
                    </Link>
                </div>
            </div>

            {/* Row 3: Upcoming + Latest Announcements */}
            <div className="grid gap-4 md:grid-cols-2 mt-4">
                {/* Upcoming */}
                <div className="matte-card elev-2 flex flex-col min-h-[300px]">
                    <div className="p-5 border-b border-border-1">
                        <h3 className="text-lg font-bold">Upcoming</h3>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto max-h-[300px]">
                        {!employeeData?.calendar_events || employeeData.calendar_events.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[200px]">
                                <Calendar className="h-10 w-10 mb-2" />
                                <p className="text-sm font-medium">No upcoming events</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {employeeData.calendar_events.map((evt: any) => (
                                    <div key={evt.id} className="flex items-center gap-4">
                                        <div className="bg-surface-2 border border-border-2 rounded-lg p-2 text-center min-w-[50px]">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">{evt.date.split(' ')[0]}</div>
                                            <div className="text-lg font-black leading-none">{evt.date.split(' ')[1].replace(',', '')}</div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate">{evt.title}</div>
                                            <div className="text-[10px] font-bold text-primary uppercase tracking-wider">{evt.type === 'holiday' ? 'Holiday' : 'Event'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Latest Announcements */}
                <div className="matte-card elev-2 flex flex-col flex-1 min-h-[300px]">
                    <div className="p-5 border-b border-border-1">
                        <h3 className="text-lg font-bold">Latest Announcements</h3>
                    </div>
                    <div className="p-5 overflow-y-auto max-h-[300px]">
                        {!employeeData?.latest_announcements || employeeData.latest_announcements.length === 0 ? (
                            <div className="text-sm text-muted-foreground min-h-[200px] flex items-center justify-center">No recent announcements.</div>
                        ) : (
                            <div className="space-y-4">
                                {employeeData.latest_announcements.map((ann: any) => (
                                    <div key={ann.id}>
                                        <div className="text-sm font-semibold truncate">{ann.title}</div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5">Posted by {ann.author} • {ann.date}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
