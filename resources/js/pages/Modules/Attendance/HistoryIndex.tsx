import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { index as historyRoute } from '@/routes/attendance/history/index';
import { index as attendanceIndexRoute } from '@/routes/attendance/index';

interface AttendanceRecord {
    id: number;
    date: string;
    am_clock_in: string | null;
    am_clock_out: string | null;
    pm_clock_in: string | null;
    pm_clock_out: string | null;
}

interface Props {
    records: AttendanceRecord[];
    month: number;
    year: number;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function getStatus(record: AttendanceRecord) {
    const { am_clock_in, am_clock_out, pm_clock_in, pm_clock_out } = record;
    const isSkipped =
        (!am_clock_in && !!am_clock_out)
        || (!pm_clock_in && !!pm_clock_out)
        || (!!am_clock_in && !am_clock_out && !!pm_clock_in);

    if (isSkipped) {
return 'incomplete';
}

    if (am_clock_in && am_clock_out && pm_clock_in && pm_clock_out) {
return 'complete';
}

    if (!am_clock_in && !am_clock_out && pm_clock_in && pm_clock_out) {
return 'half_day';
}

    if (am_clock_in && am_clock_out && !pm_clock_in && !pm_clock_out) {
return 'half_day';
}

    if (am_clock_in || pm_clock_in) {
return 'active';
}

    return 'empty';
}

function formatTime(timeStr: string | null) {
    if (!timeStr) {
return '--:--';
}

    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        complete: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
        half_day: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
        incomplete: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
        active: 'bg-primary/10 border-primary/20 text-primary',
        empty: 'bg-muted/40 border-border/40 text-muted-foreground',
    };
    const label: Record<string, string> = {
        complete: 'Complete',
        half_day: 'Half Day',
        incomplete: 'Incomplete',
        active: 'Active',
        empty: 'No Record',
    };

    return (
        <span className={cn(
            'px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase border shadow-sm',
            classes[status] ?? classes.empty,
        )}>
            {label[status] ?? status}
        </span>
    );
}

function TimeCell({ time, type }: { time: string | null; type: 'in' | 'out' }) {
    if (!time) {
return <span className="text-xs text-muted-foreground/50 font-mono">--:--</span>;
}

    return (
        <div className="flex items-center gap-1.5">
            {type === 'in'
                ? <LogIn className="h-3 w-3 text-green-500 shrink-0" />
                : <LogOut className="h-3 w-3 text-amber-500 shrink-0" />
            }
            <span className="font-mono tabular-nums text-xs">{formatTime(time)}</span>
        </div>
    );
}

export default function HistoryIndex({ records, month, year }: Props) {
    const navigate = (m: number, y: number) => {
        router.get(historyRoute({ query: { month: m, year: y } }).url, {}, { preserveState: true });
    };

    const prevMonth = () => {
        if (month === 1) {
navigate(12, year - 1);
} else {
navigate(month - 1, year);
}
    };

    const nextMonth = () => {
        const now = new Date();
        const isCurrentOrFuture = year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);

        if (isCurrentOrFuture) {
return;
}

        if (month === 12) {
navigate(1, year + 1);
} else {
navigate(month + 1, year);
}
    };

    const now = new Date();
    const isCurrent = year === now.getFullYear() && month === now.getMonth() + 1;

    const totalDays = records.length;
    const completeDays = records.filter(r => getStatus(r) === 'complete').length;
    const halfDays = records.filter(r => getStatus(r) === 'half_day').length;
    const incompleteDays = records.filter(r => getStatus(r) === 'incomplete').length;

    return (
        <>
            <Head title={`Attendance History — ${MONTHS[month - 1]} ${year}`} />

            <div className="p-4 w-full max-w-3xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href={attendanceIndexRoute().url}
                        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="t-title text-lg leading-none">Attendance History</h1>
                        <p className="text-xs text-muted-foreground mt-0.5">Your personal attendance records</p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="matte-card elev-1 p-4 flex items-center justify-between gap-4">
                    <button
                        onClick={prevMonth}
                        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="text-center">
                        <p className="text-base font-bold">{MONTHS[month - 1]}</p>
                        <p className="text-xs text-muted-foreground">{year}</p>
                    </div>

                    <button
                        onClick={nextMonth}
                        disabled={isCurrent}
                        className={cn(
                            'flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground',
                            isCurrent
                                ? 'opacity-30 cursor-not-allowed'
                                : 'hover:bg-muted hover:text-foreground',
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Summary Pills */}
                {totalDays > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { label: 'Days Logged', value: totalDays, color: 'text-foreground' },
                            { label: 'Complete', value: completeDays, color: 'text-green-500' },
                            { label: 'Half Days', value: halfDays, color: 'text-sky-500' },
                            { label: 'Incomplete', value: incompleteDays, color: 'text-amber-500' },
                        ].map(stat => (
                            <div key={stat.label} className="matte-card elev-1 p-3 text-center">
                                <p className={cn('text-xl font-bold', stat.color)}>{stat.value}</p>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Records */}
                <div className="matte-card elev-1 overflow-hidden">
                    {records.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Calendar className="h-10 w-10 text-muted-foreground/20" />
                            <p className="text-sm text-muted-foreground italic">No records for {MONTHS[month - 1]} {year}.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-surface-2">
                                    <tr>
                                        <th className="px-4 py-3 font-bold border-b border-border-1">Date</th>
                                        <th className="px-4 py-3 font-bold border-b border-border-1">AM In</th>
                                        <th className="px-4 py-3 font-bold border-b border-border-1">AM Out</th>
                                        <th className="px-4 py-3 font-bold border-b border-border-1">PM In</th>
                                        <th className="px-4 py-3 font-bold border-b border-border-1">PM Out</th>
                                        <th className="px-4 py-3 font-bold border-b border-border-1 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {records.map((record) => {
                                        const status = getStatus(record);
                                        const dateObj = new Date(record.date + 'T00:00:00');
                                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                                        return (
                                            <tr key={record.id} className={cn(
                                                'hover:bg-surface-2',
                                                isWeekend && 'bg-muted/10',
                                            )}>
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-[13px]">
                                                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className={cn(
                                                            'text-[10px] font-medium uppercase tracking-wide',
                                                            isWeekend ? 'text-muted-foreground/50' : 'text-muted-foreground',
                                                        )}>
                                                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3"><TimeCell time={record.am_clock_in} type="in" /></td>
                                                <td className="px-4 py-3"><TimeCell time={record.am_clock_out} type="out" /></td>
                                                <td className="px-4 py-3"><TimeCell time={record.pm_clock_in} type="in" /></td>
                                                <td className="px-4 py-3"><TimeCell time={record.pm_clock_out} type="out" /></td>
                                                <td className="px-4 py-3 text-right">
                                                    <StatusBadge status={status} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

HistoryIndex.layout = {
    breadcrumbs: [
        { title: 'Attendance', href: attendanceIndexRoute().url },
        { title: 'History', href: '#' },
    ],
};
