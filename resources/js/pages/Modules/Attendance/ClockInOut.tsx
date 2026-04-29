import { Head, useForm, router } from '@inertiajs/react';
import { LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AttendanceStatus } from '@/components/Attendance/AttendanceStatus';
import { cn } from '@/lib/utils';
import { index as attendanceIndexRoute } from '@/routes/attendance';
import { clockIn, clockOut } from '@/routes/attendance';

interface Attendance {
    id: number;
    user_id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
}

interface Props {
    attendance: Attendance | null;
    history: Attendance[];
}

export default function ClockInOut({ attendance, history = [] }: Props) {
    const { post, processing, errors } = useForm<{ attendance?: string }>();
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) {
return;
}

        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    const startCooldown = () => setCooldown(30);

    const handleClockIn = () => {
        post(clockIn().url, {
            onSuccess: () => {
                toast.success('Successfully clocked in for today!');
                startCooldown();
                router.reload({ only: ['attendance', 'history'] });
            },
            onError: () => toast.error('Failed to clock in. Please try again.'),
        });
    };

    const handleClockOut = () => {
        post(clockOut().url, {
            onSuccess: () => {
                toast.success('Successfully clocked out. Have a great day!');
                startCooldown();
                router.reload({ only: ['attendance', 'history'] });
            },
            onError: () => toast.error('Failed to clock out. Please try again.'),
        });
    };

    const isClockedIn = !!attendance;
    const isClockedOut = !!attendance?.clock_out;
    const isButtonDisabled = processing || cooldown > 0;

    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const historyCount = history.length;

    const timelineItems = history.slice(0, 5).map(record => ({
        id: record.id,
        date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' }),
        timeStr: `${new Date(record.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}`,
        status: record.clock_out ? 'complete' : 'active'
    }));

    return (
        <>
            <Head title="Attendance Registry" />
            

            
            <div className="relative z-10 p-6 w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-5 animate-fade-up">
                

                
                {/* Main Widget */}
                <div className="w-full max-w-xl liquid-glass-card p-6 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                    
                    {/* Left Pane: Date Card — Figma spec gradient + inner glows */}
                    <div
                        className="w-full md:w-52 rounded-[2rem] p-6 flex flex-col justify-between shrink-0 overflow-hidden border border-black/5 dark:border-white/5 shadow-sm"
                        style={{
                            background: 'var(--stat-card-bg)',
                            boxShadow: `
                                inset 0 -80px 60px -30px rgba(34, 197, 94, 0.4),
                                inset 0 -40px 30px -8px rgba(132, 204, 22, 0.2),
                                inset 0 -20px 20px 0px rgba(255, 255, 255, 0.2),
                                inset 0 0 6px -2px rgba(56, 229, 77, 0.1)
                            `,
                            minHeight: '180px',
                        }}
                    >
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/40 dark:text-white/40 mb-1">Today</p>
                            <h2 className="text-4xl font-extrabold text-foreground dark:text-white tracking-tight leading-none">{todayDate}</h2>
                        </div>
                        <div className="mt-auto pt-6">
                            <p className="text-lg font-semibold text-foreground/80 dark:text-white/80">{todayDay}</p>
                            <p className="text-xs font-medium text-foreground/40 dark:text-white/40 mt-0.5 tracking-wide">{historyCount} {historyCount === 1 ? 'log' : 'logs'} this week</p>
                        </div>
                    </div>

                    {/* Right Pane: History Timeline */}
                    <div className="flex-1 py-4 px-3 flex flex-col overflow-hidden">
                        <p className="text-[10px] font-black tracking-[0.25em] text-foreground/30 dark:text-white/30 uppercase mb-4">Recent History</p>

                        <div className="space-y-1 overflow-y-auto">
                            {timelineItems.length === 0 ? (
                                <div className="flex flex-col items-start gap-1 py-4">
                                    <p className="text-sm text-foreground/30 dark:text-white/30 italic">No records yet.</p>
                                    <p className="text-[10px] text-foreground/20 dark:text-white/20">Your logs will appear here after clocking in.</p>
                                </div>
                            ) : (
                                timelineItems.map((item, idx) => {
                                    const palette = ['#2192FF', '#9CFF2E', '#a855f7', '#FDFF00', '#38E54D'];
                                    const barColor = item.status === 'active' ? '#38E54D' : palette[idx % palette.length];

                                    return (
                                        <div key={item.id} className="group flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                                            <div
                                                className={cn("w-[3px] h-10 rounded-full shrink-0", item.status === 'active' ? 'animate-pulse' : '')}
                                                style={{
                                                    background: barColor,
                                                    boxShadow: item.status === 'active' ? `0 0 10px ${barColor}` : 'none'
                                                }}
                                            />
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-[13px] font-semibold text-foreground/90 dark:text-white/90 truncate">{item.date}</p>
                                                <p className="text-[11px] text-foreground/40 dark:text-white/40 mt-0.5 font-mono tracking-wide">{item.timeStr}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Clock Action Button — full-width, below the card */}
                <div className="w-full max-w-xl flex flex-col items-stretch gap-3">
                    {!isClockedIn ? (
                        <Button
                            onClick={handleClockIn}
                            disabled={isButtonDisabled}
                            className={cn(
                                "w-full h-14 rounded-2xl text-base font-bold tracking-wide shadow-xl transition-all duration-200",
                                isButtonDisabled
                                    ? "btn-locked"
                                    : "btn-gradient hover:scale-[1.01] shadow-[0_8px_32px_rgba(33,146,255,0.3)]"
                            )}
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            {processing ? 'Processing...' : cooldown > 0 ? `Locked (${cooldown}s)` : 'Clock In'}
                        </Button>
                    ) : !isClockedOut ? (
                        <Button
                            onClick={handleClockOut}
                            disabled={isButtonDisabled}
                            className={cn(
                                "w-full h-14 rounded-2xl text-base font-bold tracking-wide shadow-xl transition-all duration-200 relative overflow-hidden",
                                isButtonDisabled
                                    ? "btn-locked"
                                    : "btn-gradient-amber hover:scale-[1.01] shadow-[0_8px_32px_rgba(245,158,11,0.35)]"
                            )}
                        >
                            {!isButtonDisabled && <span className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl" />}
                            <LogOut className="mr-2 h-5 w-5 relative z-10" />
                            <span className="relative z-10">{processing ? 'Processing...' : cooldown > 0 ? `Locked (${cooldown}s)` : 'Clock Out'}</span>
                        </Button>
                    ) : (
                        <div className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 border border-border bg-muted/20 text-muted-foreground text-sm font-semibold tracking-wide dark:border-white/10 dark:bg-white/5 dark:text-white/40">
                            <CheckCircle2 className="h-5 w-5" />
                            Done for Today
                        </div>
                    )}

                    {errors.attendance && (
                        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400 font-bold uppercase tracking-widest backdrop-blur-md">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.attendance}
                        </div>
                    )}

                    <p className="text-center text-[10px] text-foreground/25 dark:text-white/20 tracking-wider">
                        Timestamps are server-recorded and tamper-proof.
                    </p>
                </div>
            </div>
        </>
    );
}

ClockInOut.layout = {
    breadcrumbs: [
        {
            title: 'Attendance',
            href: attendanceIndexRoute().url,
        },
        {
            title: 'Registry',
            href: '#',
        },
    ],
};


