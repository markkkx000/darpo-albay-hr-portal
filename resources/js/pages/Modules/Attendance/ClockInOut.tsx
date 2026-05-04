import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { LogIn, LogOut, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AttendanceHistory } from '@/components/Attendance/AttendanceHistory';
import { AttendanceStatus } from '@/components/Attendance/AttendanceStatus';
import { ClockDisplay } from '@/components/Attendance/ClockDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { clockIn, clockOut } from '@/routes/attendance/index';
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
    const canManage = permissions.includes('attendance.manage');

    const { post, processing, errors } = useForm<{ attendance?: string }>();
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
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

    return (
        <>
            <Head title="Attendance Registry" />
            
            <div className="p-4 w-full flex flex-col items-center">
                <div className="w-full max-w-xl flex flex-col gap-6">
                    <div className="flex items-center justify-end">
                        {canManage && (
                            <Link href={records_index().url}>
                                <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm shadow-sm border-border/50">
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Attendance Management</span>
                                </Button>
                            </Link>
                        )}
                    </div>

                    <Card className="w-full overflow-hidden border-none shadow-2xl dark:bg-gray-900/50 dark:backdrop-blur-xl glass-panel">
                        <CardHeader className="text-center pt-8">
                            <CardTitle className="text-3xl font-extrabold tracking-tight text-highlight">Attendance Registry</CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">Keep track of your daily work hours with precision.</CardDescription>
                        </CardHeader>
                        
                        <CardContent className="flex flex-col items-center gap-8 pb-12">
                            <ClockDisplay />
                            
                            <AttendanceStatus attendance={attendance} />

                            {errors.attendance && (
                                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.attendance}
                                </div>
                            )}

                            <div className="w-full max-w-xs space-y-4">
                                {!isClockedIn && (
                                    <Button 
                                        size="lg" 
                                        className={cn(
                                            "w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]",
                                            cooldown > 0 
                                                ? "bg-muted text-muted-foreground hover:scale-100 cursor-not-allowed" 
                                                : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
                                        )}
                                        onClick={handleClockIn}
                                        disabled={isButtonDisabled}
                                    >
                                        <LogIn className="mr-2 h-5 w-5" />
                                        {processing ? 'Processing...' : 'Clock In Now'}
                                    </Button>
                                )}

                                {isClockedIn && !isClockedOut && (
                                    <Button 
                                        size="lg" 
                                        variant={cooldown > 0 ? "outline" : "warning"}
                                        className={cn(
                                            "w-full h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.02]",
                                            cooldown > 0 
                                                ? "bg-muted text-muted-foreground hover:scale-100 cursor-not-allowed border-none" 
                                                : "text-white shadow-amber-600/20 font-bold"
                                        )}
                                        onClick={handleClockOut}
                                        disabled={isButtonDisabled}
                                    >
                                        <LogOut className="mr-2 h-5 w-5" />
                                        {processing ? 'Processing...' : 'Clock Out Now'}
                                    </Button>
                                )}

                                {isClockedOut && (
                                    <Button 
                                        size="lg" 
                                        disabled 
                                        className="w-full h-14 text-lg font-bold bg-muted text-muted-foreground"
                                    >
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Done for Today
                                    </Button>
                                )}
                            </div>
                            
                            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[280px] text-center">
                                {cooldown > 0 
                                    ? (
                                        <span>
                                            Action locked for <strong className="text-foreground font-bold">{cooldown}s</strong> to prevent accidental double-clicks.
                                        </span>
                                    )
                                    : "Timestamps are recorded by the server to ensure accuracy and prevent tampering."}
                            </p>
                        </CardContent>
                    </Card>

                    <div className="w-full">
                        <AttendanceHistory history={history} />
                    </div>
                </div>
            </div>
        </>
    );
}

ClockInOut.layout = {
    breadcrumbs: [
        { title: 'Attendance Registry', href: '#' },
    ],
};
