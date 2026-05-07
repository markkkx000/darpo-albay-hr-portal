import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, LogIn, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clockIn, clockOut, index as attendanceIndexRoute } from '@/routes/attendance/index';
import { index as records_index } from '@/routes/attendance/manage/records/index';

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
    const { auth } = usePage().props as any;
    const permissions = (auth.permissions || auth.user?.permissions || []) as string[];
    const canManage = permissions.includes('attendance.logs.view');

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
            
            <div className="relative z-10 flex min-h-[calc(100vh-12rem)] flex-col items-center justify-start p-4 pt-4 gap-4 animate-fade-up">
                <div className="w-full flex justify-end max-w-5xl">
                    {canManage && (
                        <Link href={records_index().url}>
                            <Button variant="default">
                                <Settings className="mr-2 h-4 w-4" />
                                Attendance Management
                            </Button>
                        </Link>
                    )}
                </div>

                <Card className="w-full max-w-xl elev-3">
                    <CardHeader className="text-center">
                        <CardTitle className="t-title">Attendance Registry</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">Keep track of your daily work hours with precision.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Left Pane: Date Card — Premium Matte Surface */}
                        <div
                            className="w-full md:w-52 rounded-[2rem] p-6 flex flex-col justify-between shrink-0 overflow-hidden matte-card elev-1"
                            style={{ 
                                minHeight: '180px',
                                boxShadow: `
                                    inset 0 -80px 60px -30px rgba(21, 128, 61, 1),
                                    inset 0 -40px 30px -8px rgba(74, 222, 128, 0.5),
                                    inset 0 -20px 20px -6px rgba(255, 255, 255, 0.4),
                                    inset 0 6px 6px -2px rgba(34, 197, 94, 0.15)
                                `
                            }}
                        >
                            <div>
                                <p className="t-caption mb-1">Today</p>
                                <h2 className="t-title leading-none">{todayDate}</h2>
                            </div>
                            <div className="mt-auto pt-6">
                                <p className="text-lg font-semibold text-foreground/80">{todayDay}</p>
                                <p className="text-xs font-medium text-muted-foreground mt-0.5 tracking-wide">{historyCount} {historyCount === 1 ? 'log' : 'logs'} this week</p>
                            </div>
                        </div>

                        {/* Right Pane: History Timeline */}
                        <div className="flex-1 py-2 px-1 flex flex-col overflow-hidden">
                            <p className="t-caption mb-4">Recent History</p>

                            <div className="space-y-1 overflow-y-auto max-h-[160px] pr-2 scrollbar-thin">
                                {timelineItems.length === 0 ? (
                                    <div className="flex flex-col items-start gap-1 py-4">
                                        <p className="text-sm text-muted-foreground italic">No records yet.</p>
                                        <p className="text-[10px] text-muted-foreground/50">Your logs will appear here after clocking in.</p>
                                    </div>
                                ) : (
                                    timelineItems.map((item) => {
                                        return (
                                            <div key={item.id} className="group flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface-2 transition-colors">
                                                <div
                                                    className={cn("w-[3px] h-10 rounded-full shrink-0", item.status === 'active' ? 'bg-primary animate-pulse shadow-[0_0_8px_var(--green-glow)]' : 'bg-muted')}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <p className="text-[13px] font-semibold text-foreground/90 truncate">{item.date}</p>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 font-mono tracking-wide">{item.timeStr}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Clock Action Button — full-width, below the card */}
                <div className="w-full max-w-xl flex flex-col items-stretch gap-3">
                    {!isClockedIn ? (
                        <Button
                            onClick={handleClockIn}
                            disabled={isButtonDisabled}
                            size="lg"
                            className="w-full h-14 rounded-full text-base font-bold tracking-wide"
                        >
                            <LogIn className="mr-2 h-5 w-5" />
                            {processing ? 'Processing...' : cooldown > 0 ? `Locked (${cooldown}s)` : 'Clock In'}
                        </Button>
                    ) : !isClockedOut ? (
                        <Button
                            onClick={handleClockOut}
                            disabled={isButtonDisabled}
                            variant="warning"
                            size="lg"
                            className="w-full h-14 rounded-full text-base font-bold tracking-wide relative overflow-hidden"
                        >
                            <LogOut className="mr-2 h-5 w-5 relative z-10" />
                            <span className="relative z-10">{processing ? 'Processing...' : cooldown > 0 ? `Locked (${cooldown}s)` : 'Clock Out'}</span>
                        </Button>
                    ) : (
                        <div className="w-full h-14 rounded-full flex items-center justify-center gap-2 border border-border bg-muted/20 text-muted-foreground text-sm font-semibold tracking-wide">
                            <CheckCircle2 className="h-5 w-5" />
                            Done for Today
                        </div>
                    )}

                    {errors.attendance && (
                        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2 text-xs text-destructive font-bold uppercase tracking-widest">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {errors.attendance}
                        </div>
                    )}

                    <p className="text-center text-[10px] text-muted-foreground tracking-wider uppercase opacity-50">
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
