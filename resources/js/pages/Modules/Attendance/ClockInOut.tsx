import { Head, useForm, router } from '@inertiajs/react';
import { LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceHistory } from '@/components/Attendance/AttendanceHistory';
import { AttendanceStatus } from '@/components/Attendance/AttendanceStatus';
import { ClockDisplay } from '@/components/Attendance/ClockDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
                router.reload({ only: ['attendance', 'history'] });
            },
            onError: () => toast.error('Failed to clock out. Please try again.'),
        });
    };

    const isClockedIn = !!attendance;
    const isClockedOut = !!attendance?.clock_out;

    return (
        <>
            <Head title="Attendance Registry" />
            
            <div className="premium-bg-container" aria-hidden="true">
                <div className="blob-background" />
                <div className="grain-overlay" />
            </div>

            <div className="relative z-10 flex min-h-[calc(100vh-12rem)] flex-col items-center justify-start p-4 pt-8 gap-8 animate-fade-up">
                <Card className="w-full max-w-xl overflow-hidden border-none shadow-2xl glass-panel">
                    <CardHeader className="text-center">
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
                                    className="btn-gradient w-full h-14"
                                    onClick={handleClockIn}
                                    disabled={processing}
                                >
                                    <LogIn className="mr-2 h-5 w-5" />
                                    {processing ? 'Processing...' : 'Clock In Now'}
                                </Button>
                            )}

                            {isClockedIn && !isClockedOut && (
                                <Button 
                                    size="lg" 
                                    className="w-full h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-600/20 transition-all hover:scale-[1.02] rounded-xl"
                                    onClick={handleClockOut}
                                    disabled={processing}
                                >
                                    <LogOut className="mr-2 h-5 w-5" />
                                    {processing ? 'Processing...' : 'Clock Out Now'}
                                </Button>
                            )}

                            {isClockedOut && (
                                <Button 
                                    size="lg" 
                                    disabled 
                                    className="w-full h-14 text-lg font-bold bg-muted text-muted-foreground rounded-xl"
                                >
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Done for Today
                                </Button>
                            )}
                        </div>
                        
                        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[280px] text-center">
                            Timestamps are recorded by the server to ensure accuracy and prevent tampering.
                        </p>
                    </CardContent>
                </Card>

                <div className="w-full max-w-xl">
                    <AttendanceHistory history={history} />
                </div>
            </div>
        </>
    );
}

