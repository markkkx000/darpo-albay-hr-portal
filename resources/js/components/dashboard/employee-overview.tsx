import { Link } from '@inertiajs/react';
import {
    Clock,
    Calendar,
    CheckCircle2,
    Activity,
    ChevronRight,
    User,
    FileText,
} from 'lucide-react';
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
                <div className="matte-card elev-2 relative flex flex-col overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary/80" />
                    <div className="flex-1 p-5">
                        <div className="t-caption mb-2 flex items-center gap-2 pl-1 text-primary">
                            <Clock className="h-4 w-4" /> Today's Status
                        </div>
                        <div className="pl-1">
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {stats.today_status}
                            </div>
                            <div className="mt-1 text-sm font-semibold text-muted-foreground">
                                {stats.today_time}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border-1 bg-muted/20 p-3">
                        <Link
                            href={attendance.index().url}
                            className="group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-2"
                        >
                            <span>Open Attendance</span>
                            <ChevronRight className="h-4 w-4 opacity-50 transition duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
                        </Link>
                    </div>
                </div>

                {/* 2. Quick Links */}
                <div className="grid h-full grid-cols-2 gap-2">
                    <Link
                        href={userinfo().url}
                        className="matte-card elev-2 group flex h-full flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <User className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                        <div className="text-sm font-bold">View Profile</div>
                    </Link>
                    <Link
                        href={documentrequests.index().url}
                        className="matte-card elev-2 group flex h-full flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <FileText className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                        <div className="text-sm font-bold">Request Docs</div>
                    </Link>
                    <Link
                        href={leave.index().url}
                        className="matte-card elev-2 group flex h-full flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <Calendar className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                        <div className="text-sm font-bold">Leave History</div>
                    </Link>
                    <Link
                        href={attendance.history.index().url}
                        className="matte-card elev-2 group flex h-full flex-col items-center justify-center border border-border-2 p-3 text-center transition-all duration-200 hover:bg-muted/50 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        <Clock className="mb-2 h-6 w-6 text-primary opacity-70 transition-all duration-200 group-hover:scale-110 group-hover:opacity-100" />
                        <div className="text-sm font-bold">
                            Attendance History
                        </div>
                    </Link>
                </div>
            </div>

            {/* Row 2: Action Items + Upcoming + Latest Announcements */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* 3. Action Items */}
                <div className="matte-card elev-2 flex min-h-[300px] flex-col">
                    <div className="border-b border-border-1 p-5">
                        <h3 className="text-lg font-bold">Action Items</h3>
                    </div>
                    <div className="max-h-[300px] flex-1 overflow-y-auto p-5">
                        {stats.action_items?.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                                <CheckCircle2 className="mb-2 h-10 w-10" />
                                <p className="text-sm font-medium">
                                    All caught up!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {stats.action_items.map((item: any) => (
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
                    </div>
                </div>

                <UpcomingEvents events={stats.calendar_events || []} />
                <LatestAnnouncements
                    announcements={stats.latest_announcements || []}
                />
            </div>

            {/* Row 3: Leave Balances (last) */}
            <div className="matte-card elev-2 overflow-hidden">
                <div className="p-5">
                    <div className="t-caption mb-4 flex items-center gap-2 text-foreground">
                        <Activity className="h-4 w-4" /> Leave Balances
                    </div>
                    <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
                        {stats.leave_balances?.length > 0 ? (
                            stats.leave_balances.map((lb: any) => (
                                <div
                                    key={lb.type}
                                    className="min-w-[120px] flex-1 rounded-xl border border-border-2 bg-surface-2 p-4"
                                >
                                    <div className="mb-2 truncate text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        {lb.type}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-foreground">
                                            {lb.balance}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            days left
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-sm text-muted-foreground">
                                No available leave balances.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
