import { Link } from '@inertiajs/react';
import { Clock, Calendar, CheckCircle2, Activity, ChevronRight, User, FileText } from 'lucide-react';
import { LatestAnnouncements } from '@/components/dashboard/latest-announcements';
import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
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
            {/* Row 1: Clock-in + Quick Links */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* 1. Live Punch-Card */}
                <div className="matte-card elev-2 overflow-hidden flex flex-col relative">
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
                        <Link href={attendance.index().url} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-surface-2 rounded-md group">
                            <span>Open Attendance</span>
                            <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 group-hover:opacity-100 transition duration-200" />
                        </Link>
                    </div>
                </div>

                {/* 2. Quick Links */}
                <div className="grid grid-cols-2 gap-2 h-full">
                    <Link href={userinfo().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full group">
                        <User className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                        <div className="text-sm font-bold">View Profile</div>
                    </Link>
                    <Link href={documentrequests.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full group">
                        <FileText className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                        <div className="text-sm font-bold">Request Docs</div>
                    </Link>
                    <Link href={leave.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full group">
                        <Calendar className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                        <div className="text-sm font-bold">Leave History</div>
                    </Link>
                    <Link href={attendance.history.index().url} className="matte-card elev-2 p-3 text-center hover:bg-muted/50 transition-all duration-200 active:scale-[0.98] focus-visible:outline-primary border border-border-2 flex flex-col items-center justify-center h-full group">
                        <Clock className="h-6 w-6 mb-2 text-primary opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-200" />
                        <div className="text-sm font-bold">Attendance History</div>
                    </Link>
                </div>
            </div>

            {/* Row 2: Action Items + Upcoming + Latest Announcements */}
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
                    </div>
                </div>

                <UpcomingEvents events={stats.calendar_events || []} />
                <LatestAnnouncements announcements={stats.latest_announcements || []} />
            </div>

            {/* Row 3: Leave Balances (last) */}
            <div className="matte-card elev-2 overflow-hidden">
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
    );
}
