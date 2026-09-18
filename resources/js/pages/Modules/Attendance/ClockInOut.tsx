import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarCheck,
    CheckCircle2,
    LogIn,
    LogOut,
    Settings,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { index as historyRoute } from '@/routes/attendance/history/index';
import { clockIn, clockOut } from '@/routes/attendance/index';
import { index as records_index } from '@/routes/attendance/manage/records/index';
import type { PageProps } from '@/types';

interface Attendance {
    id: number;
    user_id: number;
    date: string;
    am_clock_in: string | null;
    am_clock_out: string | null;
    pm_clock_in: string | null;
    pm_clock_out: string | null;
}

interface Props {
    attendance: Attendance | null;
    history: Attendance[];
}

export default function ClockInOut({ attendance, history = [] }: Props) {
    const { auth } = usePage<PageProps>().props;
    const permissions = (auth.permissions ||
        auth.user?.permissions ||
        []) as string[];
    const canManage = permissions.includes('attendance.logs.view');

    const { post, processing, errors } = useForm<{ attendance?: string }>();
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleClockIn = () => {
        post(clockIn().url, {
            onSuccess: () => {
                toast.success('Successfully clocked in for today!');
                router.reload({ only: ['attendance', 'history'] });
            },
            onError: () => toast.error('Failed to clock in. Please try again.'),
        });
    };

    const handleClockOut = () => {
        post(clockOut().url, {
            onSuccess: () => {
                toast.success('Successfully clocked out. Have a great day!');
                setShowConfirmModal(false);
                router.reload({ only: ['attendance', 'history'] });
            },
            onError: () => {
                toast.error('Failed to clock out. Please try again.');
                setShowConfirmModal(false);
            },
        });
    };

    /**
     * Determine the next clock action based on the last-filled slot.
     * Half-day patterns (only AM in+out, or only PM in+out, or PM-only in progress)
     * are valid and not considered incomplete.
     *
     * Truly broken (incomplete): am_out without am_in, pm_out without pm_in,
     * or jumping from am_in straight to pm_in (skipping am_out).
     */
    const { server_time } = usePage<PageProps & { server_time: string }>()
        .props;

    let currentAction:
        | 'am_in'
        | 'am_out'
        | 'pm_in'
        | 'pm_out'
        | 'done'
        | 'half_day_am'
        | 'half_day_pm' = 'am_in';
    let isSkipped = false;

    if (!attendance) {
        // If no logs, check if server time is past 13:00 to skip AM
        const currentHour = new Date(server_time).getHours();

        if (currentHour >= 13) {
            currentAction = 'pm_in';
        } else {
            currentAction = 'am_in';
        }
    } else {
        const { am_clock_in, am_clock_out, pm_clock_in, pm_clock_out } =
            attendance;
        const currentHour = new Date(server_time).getHours();

        isSkipped =
            (!am_clock_in && !!am_clock_out) || // am out without am in
            (!pm_clock_in && !!pm_clock_out) || // pm out without pm in
            (!!am_clock_in && !am_clock_out && !!pm_clock_in); // jumped am_in → pm_in, skipped am_out

        if (pm_clock_out) {
            if (!am_clock_in && !am_clock_out) {
                currentAction = 'half_day_pm';
            } else if (isSkipped) {
                currentAction = 'half_day_pm';
            } else {
                currentAction = 'done';
            }
        } else if (pm_clock_in) {
            currentAction = 'pm_out';
        } else if (am_clock_out) {
            currentAction = 'half_day_am';
        } else if (am_clock_in) {
            if (currentHour >= 13) {
                currentAction = 'pm_in';
            } else {
                currentAction = 'am_out';
            }
        } else {
            if (currentHour >= 13) {
                currentAction = 'pm_in';
            } else {
                currentAction = 'am_in';
            }
        }
    }

    const modalDescription =
        currentAction === 'am_out'
            ? 'Are you sure you want to clock out for the morning session? You can clock in again for the afternoon session later.'
            : 'Are you sure you want to clock out for the afternoon session? This will complete your attendance for today.';

    const todayDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const todayDay = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
    });
    const historyCount = history.length;
    const timelineItems = history.slice(0, 5).map((record) => {
        const formatTime = (timeStr: string | null) => {
            if (!timeStr) {
                return '--:--';
            }

            return new Date(timeStr).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });
        };
        const morningStr = `${formatTime(record.am_clock_in)} - ${formatTime(record.am_clock_out)}`;
        const afternoonStr = `${formatTime(record.pm_clock_in)} - ${formatTime(record.pm_clock_out)}`;

        return {
            id: record.id,
            date: new Date(record.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: 'long',
            }),
            morningStr,
            afternoonStr,
            status: (() => {
                const { am_clock_in, am_clock_out, pm_clock_in, pm_clock_out } =
                    record;

                // Truly broken sequences
                const isSkipped =
                    (!am_clock_in && !!am_clock_out) ||
                    (!pm_clock_in && !!pm_clock_out) ||
                    (!!am_clock_in && !am_clock_out && !!pm_clock_in);

                if (isSkipped) {
                    return 'incomplete';
                }

                if (
                    am_clock_in &&
                    am_clock_out &&
                    pm_clock_in &&
                    pm_clock_out
                ) {
                    return 'complete';
                }

                // Single-session complete = half day
                if (
                    !am_clock_in &&
                    !am_clock_out &&
                    pm_clock_in &&
                    pm_clock_out
                ) {
                    return 'half_day';
                }

                if (
                    am_clock_in &&
                    am_clock_out &&
                    !pm_clock_in &&
                    !pm_clock_out
                ) {
                    return 'half_day';
                }

                return 'active';
            })(),
        };
    });

    return (
        <>
            <Head title="Attendance Registry" />

            <div className="relative z-10 flex min-h-[calc(100vh-12rem)] flex-col items-center justify-start gap-4 p-4 pt-4">
                <div className="relative w-full max-w-xl">
                    {canManage && (
                        <Link
                            href={records_index().url}
                            className="absolute top-4 left-[calc(100%-3.5rem)] z-20"
                        >
                            <Button
                                variant="ghost"
                                className="group btn-ghost-specular flex h-10 w-10 items-center justify-start overflow-hidden rounded-full border-none bg-background/98 p-0 shadow-md btn-expand-pill hover:w-64"
                            >
                                <div className="flex h-full w-[38px] shrink-0 items-center justify-center">
                                    <Settings className="h-5 w-5 btn-expand-pill-icon group-hover:rotate-180" />
                                </div>
                                <span className="ml-1 text-xs font-bold tracking-wider whitespace-nowrap uppercase opacity-0 btn-expand-pill-label group-hover:opacity-100">
                                    Attendance Management
                                </span>
                            </Button>
                        </Link>
                    )}

                    <div className="matte-card elev-3 w-full">
                        <div className="flex flex-col space-y-1.5 p-6 text-center">
                            <h3 className="t-title leading-none tracking-tight">
                                Attendance Registry
                            </h3>
                            <p className="text-sm font-medium text-muted-foreground">
                                Keep track of your daily work hours with
                                precision.
                            </p>
                        </div>

                        <div className="flex flex-col gap-6 p-6 pt-0 md:flex-row">
                            {/* Left Pane: Date Card — Premium Matte Surface */}
                            <div
                                className="matte-card elev-1 flex w-full shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] p-6 md:w-52"
                                style={{
                                    minHeight: '180px',
                                    boxShadow: `
                                    inset 0 -80px 60px -30px rgba(21, 128, 61, 1),
                                    inset 0 -40px 30px -8px rgba(74, 222, 128, 0.5),
                                    inset 0 -20px 20px -6px rgba(255, 255, 255, 0.4),
                                    inset 0 6px 6px -2px rgba(34, 197, 94, 0.15)
                                `,
                                }}
                            >
                                <div>
                                    <p className="t-caption mb-1">Today</p>
                                    <h2 className="t-title leading-none">
                                        {todayDate}
                                    </h2>
                                </div>
                                <div className="mt-auto pt-6">
                                    <p className="text-lg font-semibold text-foreground/80">
                                        {todayDay}
                                    </p>
                                    <p className="mt-0.5 text-xs font-medium tracking-wide text-muted-foreground">
                                        {historyCount}{' '}
                                        {historyCount === 1 ? 'log' : 'logs'}{' '}
                                        this week
                                    </p>
                                </div>
                            </div>

                            {/* Right Pane: History Timeline */}
                            <div className="flex flex-1 flex-col overflow-hidden px-1 py-2">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="t-caption">Recent History</p>
                                    <Link
                                        href={historyRoute().url}
                                        className="rounded-full px-2 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase hover:bg-muted hover:text-foreground"
                                    >
                                        View All
                                    </Link>
                                </div>

                                <div className="scrollbar-thin max-h-[200px] space-y-1 overflow-y-auto pr-2">
                                    {timelineItems.length === 0 ? (
                                        <div className="flex flex-col items-start gap-1 py-4">
                                            <p className="text-sm text-muted-foreground italic">
                                                No records yet.
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/50">
                                                Your logs will appear here after
                                                clocking in.
                                            </p>
                                        </div>
                                    ) : (
                                        timelineItems.map((item) => {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface-2"
                                                >
                                                    <div
                                                        className={cn(
                                                            'spring-physics my-1 w-[3px] shrink-0 self-stretch rounded-full',
                                                            item.status ===
                                                                'active'
                                                                ? 'animate-pulse bg-primary shadow-[0_0_8px_var(--green-glow)]'
                                                                : item.status ===
                                                                    'incomplete'
                                                                  ? 'bg-amber-500'
                                                                  : item.status ===
                                                                      'half_day'
                                                                    ? 'bg-sky-400'
                                                                    : 'bg-muted',
                                                        )}
                                                    />
                                                    <div className="flex min-w-0 flex-1 flex-col">
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <p className="text-[13px] font-semibold text-foreground/90">
                                                                {item.date}
                                                            </p>
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[8px] font-bold tracking-widest uppercase shadow-sm ${
                                                                    item.status ===
                                                                    'complete'
                                                                        ? 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'
                                                                        : item.status ===
                                                                            'incomplete'
                                                                          ? 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                                          : item.status ===
                                                                              'half_day'
                                                                            ? 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                            : 'border-primary/20 bg-primary/10 text-primary'
                                                                }`}
                                                            >
                                                                {item.status.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 space-y-0.5 font-mono text-[11px] tracking-wide text-muted-foreground tabular-nums">
                                                            <div className="flex items-center">
                                                                <span className="w-20 font-sans text-[10px] font-medium tracking-wider text-muted-foreground/70 uppercase">
                                                                    Morning:
                                                                </span>
                                                                <span>
                                                                    {
                                                                        item.morningStr
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-20 font-sans text-[10px] font-medium tracking-wider text-muted-foreground/70 uppercase">
                                                                    Afternoon:
                                                                </span>
                                                                <span>
                                                                    {
                                                                        item.afternoonStr
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clock Action Button — full-width, below the card */}
                <div className="flex w-full max-w-xl flex-col items-stretch gap-3">
                    {currentAction === 'am_in' && (
                        <Button
                            onClick={handleClockIn}
                            disabled={processing}
                            size="lg"
                            className="h-14 w-full rounded-full text-base font-bold tracking-wide"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            {processing ? 'Processing...' : 'Clock In (AM)'}
                        </Button>
                    )}
                    {currentAction === 'am_out' && (
                        <Button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={processing}
                            variant="warning"
                            size="lg"
                            className="relative h-14 w-full overflow-hidden rounded-full text-base font-bold tracking-wide"
                        >
                            <LogOut className="relative z-10 mr-2 h-5 w-5" />
                            <span className="relative z-10">
                                {processing
                                    ? 'Processing...'
                                    : 'Clock Out (AM)'}
                            </span>
                        </Button>
                    )}

                    {currentAction === 'pm_in' && (
                        <Button
                            onClick={handleClockIn}
                            disabled={processing}
                            size="lg"
                            className="h-14 w-full rounded-full text-base font-bold tracking-wide"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            {processing ? 'Processing...' : 'Clock In (PM)'}
                        </Button>
                    )}

                    {currentAction === 'pm_out' && (
                        <Button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={processing}
                            variant="warning"
                            size="lg"
                            className="relative h-14 w-full overflow-hidden rounded-full text-base font-bold tracking-wide"
                        >
                            <LogOut className="relative z-10 mr-2 h-5 w-5" />
                            <span className="relative z-10">
                                {processing
                                    ? 'Processing...'
                                    : 'Clock Out (PM)'}
                            </span>
                        </Button>
                    )}
                    {currentAction === 'done' && (
                        <div className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-border bg-muted/20 text-sm font-semibold tracking-wide text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5" />
                            Done for Today
                        </div>
                    )}
                    {currentAction === 'half_day_pm' && (
                        <div className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 text-sm font-semibold tracking-wide text-sky-600 dark:text-sky-400">
                            <CalendarCheck className="h-5 w-5" />
                            Half Day (PM) — Done
                        </div>
                    )}
                    {currentAction === 'half_day_am' && (
                        <>
                            <Button
                                onClick={handleClockIn}
                                disabled={processing}
                                variant="ghost"
                                size="lg"
                                className="btn-ghost-specular h-14 w-full rounded-full border-none text-base font-bold tracking-wide text-muted-foreground"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                {processing
                                    ? 'Processing...'
                                    : 'Clock In for PM Session'}
                            </Button>
                            <div className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 text-sm font-semibold tracking-wide text-sky-600 dark:text-sky-400">
                                <CalendarCheck className="h-5 w-5" />
                                Half Day (AM) — Done
                            </div>
                        </>
                    )}
                    {isSkipped && (
                        <div className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
                                    Record Incomplete
                                </span>
                                <span className="mt-0.5 text-xs text-muted-foreground">
                                    Today's record has missing time slots.
                                    Please contact HR to correct the entry.
                                </span>
                            </div>
                        </div>
                    )}

                    {errors.attendance && (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-bold tracking-widest text-destructive uppercase">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.attendance}
                        </div>
                    )}

                    <p className="text-center text-[10px] tracking-wider text-muted-foreground uppercase opacity-50">
                        Timestamps are server-recorded and tamper-proof.
                    </p>
                </div>

                <Dialog
                    open={showConfirmModal}
                    onOpenChange={setShowConfirmModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Clock Out?</DialogTitle>
                            <DialogDescription>
                                {modalDescription}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setShowConfirmModal(false)}
                                className="btn-ghost-specular border-none px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="ghost-destructive"
                                onClick={handleClockOut}
                                disabled={processing}
                                className="btn-ghost-danger-specular border-none px-6"
                            >
                                {processing
                                    ? 'Processing...'
                                    : 'Confirm Clock Out'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

ClockInOut.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: '#',
        },
    ],
};
