import { Link } from '@inertiajs/react';
import { Clock, Calendar, CheckCircle2, Activity, ChevronRight } from 'lucide-react';
import { userinfo } from '@/routes';
import attendance from '@/routes/attendance';
import documentrequests from '@/routes/documentrequests';
import leave from '@/routes/leave';

export function EmployeeOverview({ data }: { data: any }) {
    const stats = data || {
        today_status: 'Not Clocked In',
        today_time: '--:-- --',
        leave_balances: [],
        action_items: [],
        calendar_events: [],
        latest_announcements: [],
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                {/* 1. Live Punch-Card */}
                <div className="matte-card elev-2 overflow-hidden flex flex-col relative md:col-span-1">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
                    <div className="p-5 flex-1">
                        <div className="t-caption pl-1 flex items-center gap-2 mb-2 text-primary">
                            <Clock className="h-4 w-4" /> Today's Status
                        </div>
                        <div className="pl-1">
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {stats.today_status}
                            </div>
                            <div className="text-sm font-semibold text-muted-foreground mt-1">
                                {stats.today_time}
                            </div>
                        </div>
                    </div>
                    <div className="p-3 bg-muted/20 border-t border-border-1">
                        <Link href={attendance.index().url} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-surface-2 rounded-md transition-colors group">
                            <span>Open Attendance</span>
                            <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition duration-200" />
                        </Link>
                    </div>
                </div>

                {/* 2. Visual Leave Balances */}
                <div className="matte-card elev-2 overflow-hidden md:col-span-2">
                    <div className="p-5">
                        <div className="t-caption flex items-center gap-2 mb-4 text-foreground">
                            <Activity className="h-4 w-4" /> Leave Balances
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                            {stats.leave_balances?.length > 0 ? (
                                stats.leave_balances.map((lb: any) => (
                                    <div key={lb.type} className="flex-1 min-w-[120px] bg-surface-2 p-4 rounded-xl border border-border-2">
                                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider truncate mb-2">{lb.type}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-foreground">{lb.balance}</span>
                                            <span className="text-xs text-muted-foreground">days left</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-muted-foreground py-4">No available leave balances.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* 3. Action Items */}
                <div className="matte-card elev-2 flex flex-col min-h-[300px]">
                    <div className="p-5 border-b border-border-1">
                        <h3 className="text-lg font-bold">Action Items</h3>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto max-h-[300px]">
                        {stats.action_items?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <CheckCircle2 className="h-10 w-10 mb-2" />
                                <p className="text-sm font-medium">All caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
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
                                                    <Link href={item.url} className="inline-flex items-center justify-center rounded-md text-[11px] font-medium transition-colors border border-border-2 bg-surface hover:bg-surface-2 text-foreground h-6 px-3">
                                                        {item.action_text || 'View Details'}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Calendar */}
                <div className="matte-card elev-2 flex flex-col min-h-[300px]">
                    <div className="p-5 border-b border-border-1">
                        <h3 className="text-lg font-bold">Upcoming</h3>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto max-h-[300px]">
                        {stats.calendar_events?.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <Calendar className="h-10 w-10 mb-2" />
                                <p className="text-sm font-medium">No upcoming events</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.calendar_events.map((evt: any) => (
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

                {/* 5. Latest Announcements & Quick Links */}
                <div className="flex flex-col gap-4">
                    <div className="matte-card elev-2 flex flex-col flex-1">
                        <div className="p-5 border-b border-border-1">
                            <h3 className="text-lg font-bold">Latest Announcements</h3>
                        </div>
                        <div className="p-5 overflow-y-auto max-h-[200px]">
                            {stats.latest_announcements?.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No recent announcements.</div>
                            ) : (
                                <div className="space-y-4">
                                    {stats.latest_announcements.map((ann: any) => (
                                        <div key={ann.id}>
                                            <div className="text-sm font-semibold truncate">{ann.title}</div>
                                            <div className="text-[10px] text-muted-foreground mt-0.5">Posted by {ann.author} • {ann.date}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-2">
                        <Link href={userinfo().url} className="matte-card elev-2 p-3 text-center transition-colors hover:bg-surface-2 focus-visible:outline-primary border border-border-2 block">
                            <div className="text-xs font-semibold">View Profile</div>
                        </Link>
                        <Link href={documentrequests.index().url} className="matte-card elev-2 p-3 text-center transition-colors hover:bg-surface-2 focus-visible:outline-primary border border-border-2 block">
                            <div className="text-xs font-semibold">Request Docs</div>
                        </Link>
                        <Link href={leave.index().url} className="matte-card elev-2 p-3 text-center transition-colors hover:bg-surface-2 focus-visible:outline-primary border border-border-2 block">
                            <div className="text-xs font-semibold">Leave History</div>
                        </Link>
                        <Link href={attendance.index().url} className="matte-card elev-2 p-3 text-center transition-colors hover:bg-surface-2 focus-visible:outline-primary border border-border-2 block">
                            <div className="text-xs font-semibold">Attendance</div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
