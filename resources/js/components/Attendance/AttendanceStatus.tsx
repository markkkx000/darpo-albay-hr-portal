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
                <Badge variant="outline" className="px-5 py-1.5 text-sm font-semibold border-border bg-surface-2 text-foreground">
                    Available to Clock In
                </Badge>
                <p className="text-sm text-muted-foreground font-medium italic">Your workday hasn't started yet.</p>
            </div>
        );
    }

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const isCompleted = !!attendance.pm_clock_out;
    const isActive = (!!attendance.am_clock_in && !attendance.am_clock_out) || (!!attendance.pm_clock_in && !attendance.pm_clock_out);
    const statusText = isCompleted ? 'Shift Finalized' : (isActive ? 'Currently Active' : 'On Break / Idle');

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center w-full max-w-2xl px-4">
                {/* AM Clock In */}
                <div className="flex items-center gap-3">
                    <div className={cn("sqicon h-10 w-10 !rounded-[10px]", attendance.am_clock_in ? "sqicon-green" : "bg-muted/10 text-muted-foreground")}>
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AM In</span>
                        <span className="text-sm md:text-base font-extrabold text-foreground">
                            {attendance.am_clock_in ? formatTime(attendance.am_clock_in) : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* AM Clock Out */}
                <div className="flex items-center gap-3">
                    <div className={cn("sqicon h-10 w-10 !rounded-[10px]", attendance.am_clock_out ? "sqicon-yellow" : "bg-muted/10 text-muted-foreground")}>
                        <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AM Out</span>
                        <span className="text-sm md:text-base font-extrabold text-foreground">
                            {attendance.am_clock_out ? formatTime(attendance.am_clock_out) : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* PM Clock In */}
                <div className="flex items-center gap-3">
                    <div className={cn("sqicon h-10 w-10 !rounded-[10px]", attendance.pm_clock_in ? "sqicon-green" : "bg-muted/10 text-muted-foreground")}>
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PM In</span>
                        <span className="text-sm md:text-base font-extrabold text-foreground">
                            {attendance.pm_clock_in ? formatTime(attendance.pm_clock_in) : '--:-- --'}
                        </span>
                    </div>
                </div>

                {/* PM Clock Out */}
                <div className="flex items-center gap-3">
                    <div className={cn("sqicon h-10 w-10 !rounded-[10px]", attendance.pm_clock_out ? "sqicon-yellow" : "bg-muted/10 text-muted-foreground")}>
                        <LogOut className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PM Out</span>
                        <span className="text-sm md:text-base font-extrabold text-foreground">
                            {attendance.pm_clock_out ? formatTime(attendance.pm_clock_out) : '--:-- --'}
                        </span>
                    </div>
                </div>
            </div>

            <Badge 
                variant={isCompleted ? 'outline' : 'default'} 
                className={cn(
                    "px-6 py-1.5 uppercase text-xs font-black tracking-widest",
                    isCompleted 
                        ? 'bg-muted/10 text-muted-foreground border-muted-foreground/20' 
                        : (isActive 
                            ? 'bg-primary/20 text-foreground border-primary/30 shadow-[0_0_20px_rgba(56,229,77,0.3)] animate-pulse'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          )
                )}
            >
                {statusText}
            </Badge>
        </div>
    );
}
