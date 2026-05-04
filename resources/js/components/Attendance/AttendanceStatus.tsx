import { LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AttendanceStatusProps {
    attendance: {
        clock_in: string | null;
        clock_out: string | null;
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

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="sqicon sqicon-green h-10 w-10 !rounded-[10px]">
                        <LogIn className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clock In</span>
                        <span className="text-base font-extrabold text-foreground">{formatTime(attendance.clock_in!)}</span>
                    </div>
                </div>

                {attendance.clock_out && (
                    <div className="flex items-center gap-3">
                        <div className="sqicon sqicon-yellow h-10 w-10 !rounded-[10px]">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clock Out</span>
                            <span className="text-base font-extrabold text-foreground">{formatTime(attendance.clock_out)}</span>
                        </div>
                    </div>
                )}
            </div>

            <Badge 
                variant={attendance.clock_out ? 'outline' : 'default'} 
                className={cn(
                    "px-6 py-1.5 uppercase text-xs font-black tracking-widest",
                    attendance.clock_out 
                        ? 'bg-muted/10 text-muted-foreground border-muted-foreground/20' 
                        : 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_20px_rgba(56,229,77,0.3)] animate-pulse'
                )}
            >
                {attendance.clock_out ? 'Shift Finalized' : 'Currently Active'}
            </Badge>
        </div>
    );
}
