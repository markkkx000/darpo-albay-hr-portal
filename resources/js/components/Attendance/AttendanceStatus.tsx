import { LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttendanceStatusProps {
    attendance: {
        am_clock_in: string | null;
        am_clock_out: string | null;
        pm_clock_in: string | null;
        pm_clock_out: string | null;
    } | null;
}

export function AttendanceStatus({ attendance }: AttendanceStatusProps) {
    if (!attendance) {
        return (
            <div className="flex flex-col items-center gap-2">
                <Badge
                    variant="outline"
                    className="border-border bg-surface-2 px-5 py-1.5 text-sm font-semibold text-foreground"
                >
                    Available to Clock In
                </Badge>
                <p className="text-sm font-medium text-muted-foreground italic">
                    Your workday hasn't started yet.
                </p>
            </div>
        );
    }

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const isCompleted = !!attendance.pm_clock_out;
    const isActive =
        (!!attendance.am_clock_in && !attendance.am_clock_out) ||
        (!!attendance.pm_clock_in && !attendance.pm_clock_out);
    const statusText = isCompleted
        ? 'Shift Finalized'
        : isActive
          ? 'Currently Active'
          : 'On Break / Idle';

    return (
        <div className="flex w-full flex-col items-center gap-6">
            <div className="grid w-full max-w-2xl grid-cols-2 justify-center gap-6 px-4 md:grid-cols-4">
                {/* AM Clock In */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'sqicon h-10 w-10 !rounded-[10px]',
                            attendance.am_clock_in
                                ? 'sqicon-green'
                                : 'bg-muted/10 text-muted-foreground',
                        )}
                    >
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            AM In
                        </span>
                        <span className="text-sm font-extrabold text-foreground md:text-base">
                            {attendance.am_clock_in
                                ? formatTime(attendance.am_clock_in)
                                : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* AM Clock Out */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'sqicon h-10 w-10 !rounded-[10px]',
                            attendance.am_clock_out
                                ? 'sqicon-yellow'
                                : 'bg-muted/10 text-muted-foreground',
                        )}
                    >
                        <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            AM Out
                        </span>
                        <span className="text-sm font-extrabold text-foreground md:text-base">
                            {attendance.am_clock_out
                                ? formatTime(attendance.am_clock_out)
                                : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* PM Clock In */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'sqicon h-10 w-10 !rounded-[10px]',
                            attendance.pm_clock_in
                                ? 'sqicon-green'
                                : 'bg-muted/10 text-muted-foreground',
                        )}
                    >
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            PM In
                        </span>
                        <span className="text-sm font-extrabold text-foreground md:text-base">
                            {attendance.pm_clock_in
                                ? formatTime(attendance.pm_clock_in)
                                : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* PM Clock Out */}
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'sqicon h-10 w-10 !rounded-[10px]',
                            attendance.pm_clock_out
                                ? 'sqicon-yellow'
                                : 'bg-muted/10 text-muted-foreground',
                        )}
                    >
                        <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            PM Out
                        </span>
                        <span className="text-sm font-extrabold text-foreground md:text-base">
                            {attendance.pm_clock_out
                                ? formatTime(attendance.pm_clock_out)
                                : '--:-- --'}
                        </span>
                    </div>
                </div>
            </div>

            <Badge
                variant={isCompleted ? 'outline' : 'default'}
                className={cn(
                    'px-6 py-1.5 text-xs font-black tracking-widest uppercase',
                    isCompleted
                        ? 'border-muted-foreground/20 bg-muted/10 text-muted-foreground'
                        : isActive
                          ? 'animate-pulse border-primary/30 bg-primary/20 text-foreground shadow-[0_0_20px_rgba(56,229,77,0.3)]'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-600',
                )}
            >
                {statusText}
            </Badge>
        </div>
    );
}
