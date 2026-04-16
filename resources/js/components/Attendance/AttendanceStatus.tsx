import { LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
                <Badge variant="secondary" className="px-4 py-1 text-sm font-medium">
                    Not Clocked In
                </Badge>
                <p className="text-sm text-gray-500">Waiting for your first clock-in for today.</p>
            </div>
        );
    }

    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clock In</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(attendance.clock_in!)}</span>
                    </div>
                </div>

                {attendance.clock_out && (
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clock Out</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(attendance.clock_out)}</span>
                        </div>
                    </div>
                )}
            </div>

            <Badge 
                variant={attendance.clock_out ? 'outline' : 'default'} 
                className={attendance.clock_out ? 'bg-gray-50 text-gray-600' : 'bg-green-600 hover:bg-green-700 text-white animate-pulse'}
            >
                {attendance.clock_out ? 'Shift Completed' : 'Shift In Progress'}
            </Badge>
        </div>
    );
}
