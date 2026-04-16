import { Calendar, LogIn, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
    id: number;
    date: string;
    clock_in: string;
    clock_out: string | null;
}

interface AttendanceHistoryProps {
    history: AttendanceRecord[];
}

export function AttendanceHistory({ history }: AttendanceHistoryProps) {
    const formatTime = (time: string) => {
        return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric', weekday: 'short' });
    };

    if (history.length === 0) {
        return (
            <Card className="w-full border-dashed bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="h-10 w-10 text-gray-300 dark:text-gray-700 mb-2" />
                    <p className="text-gray-500">No attendance history found for the last 7 days.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full border-none shadow-xl bg-white/50 backdrop-blur-sm dark:bg-gray-950/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Recent Activity
                </CardTitle>
                <CardDescription>Your attendance records for the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 dark:bg-gray-900/50 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Date</th>
                                <th className="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Clock In</th>
                                <th className="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800">Clock Out</th>
                                <th className="px-4 py-3 font-bold border-b border-gray-100 dark:border-gray-800 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record) => (
                                <tr key={record.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                                    <td className="px-4 py-4 font-medium whitespace-nowrap">
                                        {formatDate(record.date)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <LogIn className="h-3 w-3 text-green-500" />
                                            {formatTime(record.clock_in)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {record.clock_out ? (
                                            <div className="flex items-center gap-2">
                                                <LogOut className="h-3 w-3 text-amber-500" />
                                                {formatTime(record.clock_out)}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Not clocked out</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Badge 
                                            variant={record.clock_out ? 'secondary' : 'default'}
                                            className={cn(
                                                "text-[10px] px-2 py-0 uppercase tracking-wider font-bold",
                                                !record.clock_out && "bg-green-600 hover:bg-green-700 animate-pulse text-white"
                                            )}
                                        >
                                            {record.clock_out ? 'Completed' : 'Working'}
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
