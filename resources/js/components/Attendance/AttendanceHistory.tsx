import { Calendar, LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    id: number;
    date: string;
    am_clock_in: string | null;
    am_clock_out: string | null;
    pm_clock_in: string | null;
    pm_clock_out: string | null;
}

interface AttendanceHistoryProps {
    history: AttendanceRecord[];
}

export function AttendanceHistory({ history }: AttendanceHistoryProps) {
    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            weekday: 'short',
        });
    };

    if (history.length === 0) {
        return (
            <Card className="w-full border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="mb-2 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-muted-foreground">
                        No attendance history found for the last 7 days.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="matte-card elev-2 w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Recent Activity
                </CardTitle>
                <CardDescription>
                    Your attendance records for the last 7 days.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-xl border border-border-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-2 text-xs text-muted-foreground uppercase">
                            <tr>
                                <th className="border-b border-border-1 px-4 py-3 font-bold">
                                    Date
                                </th>
                                <th className="border-b border-border-1 px-4 py-3 font-bold">
                                    AM In
                                </th>
                                <th className="border-b border-border-1 px-4 py-3 font-bold">
                                    AM Out
                                </th>
                                <th className="border-b border-border-1 px-4 py-3 font-bold">
                                    PM In
                                </th>
                                <th className="border-b border-border-1 px-4 py-3 font-bold">
                                    PM Out
                                </th>
                                <th className="border-b border-border-1 px-4 py-3 text-right font-bold">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-border-1 transition-colors hover:bg-surface-3"
                                >
                                    <td className="px-4 py-4 font-medium whitespace-nowrap">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="px-4 py-4">
                                        {record.am_clock_in ? (
                                            <div className="flex items-center gap-2">
                                                <LogIn className="h-3 w-3 text-green-500" />
                                                {formatTime(record.am_clock_in)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                --:--
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {record.am_clock_out ? (
                                            <div className="flex items-center gap-2">
                                                <LogOut className="h-3 w-3 text-amber-500" />
                                                {formatTime(
                                                    record.am_clock_out,
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                --:--
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {record.pm_clock_in ? (
                                            <div className="flex items-center gap-2">
                                                <LogIn className="h-3 w-3 text-green-500" />
                                                {formatTime(record.pm_clock_in)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                --:--
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {record.pm_clock_out ? (
                                            <div className="flex items-center gap-2">
                                                <LogOut className="h-3 w-3 text-amber-500" />
                                                {formatTime(
                                                    record.pm_clock_out,
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                --:--
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Badge
                                            variant={
                                                record.pm_clock_out
                                                    ? 'secondary'
                                                    : 'default'
                                            }
                                            className={cn(
                                                'px-2 py-0 text-[10px] font-bold tracking-wider uppercase',
                                                !record.pm_clock_out &&
                                                    'animate-pulse border-primary/30 bg-primary/20 text-primary hover:bg-primary/30',
                                            )}
                                        >
                                            {record.pm_clock_out
                                                ? 'Completed'
                                                : 'Working'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
