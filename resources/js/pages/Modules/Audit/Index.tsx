import { Head, router } from '@inertiajs/react';
import { Download, Search, FileJson } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { DatePicker } from '@/components/date-picker';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import auditRoutes from '@/routes/audit';

interface Log {
    id: number;
    log_name: string;
    description: string;
    event: string;
    subject_type: string | null;
    subject_id: number | null;
    causer: string;
    properties: any;
    created_at: string;
    created_at_human: string;
}

interface Props {
    logs: {
        data: Log[];
        links: any[];
        from: number | null;
        to: number | null;
        total: number;
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        user_id?: string;
        event?: string;
        start_date?: string;
        end_date?: string;
    };
    events: string[];
    users: { id: number; name: string }[];
}

export default function AuditIndex({ logs, filters, events, users }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [userId, setUserId] = useState(filters.user_id || 'all');
    const [event, setEvent] = useState(filters.event || 'all');
    const [startDate, setStartDate] = useState<string | null>(
        filters.start_date || null,
    );
    const [endDate, setEndDate] = useState<string | null>(
        filters.end_date || null,
    );
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const fetchLogs = (params: any = {}) => {
        const query: any = {
            search: params.search !== undefined ? params.search : search,
            user_id: params.userId !== undefined ? params.userId : userId,
            event: params.event !== undefined ? params.event : event,
            start_date:
                params.startDate !== undefined ? params.startDate : startDate,
            end_date: params.endDate !== undefined ? params.endDate : endDate,
        };

        if (query.user_id === 'all') {
            delete query.user_id;
        }

        if (query.event === 'all') {
            delete query.event;
        }

        if (!query.search) {
            delete query.search;
        }

        if (!query.start_date) {
            delete query.start_date;
        }

        if (!query.end_date) {
            delete query.end_date;
        }

        router.get(auditRoutes.index().url, query, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (search !== (filters.search || '')) {
                // Fetch directly to avoid dependency issues with fetchLogs wrapper
                const query: any = {
                    search,
                    user_id: userId,
                    event: event,
                    start_date: startDate,
                    end_date: endDate,
                };

                if (query.user_id === 'all') {
                    delete query.user_id;
                }

                if (query.event === 'all') {
                    delete query.event;
                }

                if (!query.search) {
                    delete query.search;
                }

                if (!query.start_date) {
                    delete query.start_date;
                }

                if (!query.end_date) {
                    delete query.end_date;
                }

                router.get(auditRoutes.index().url, query, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                });
            }
        }, 500);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search, filters.search, userId, event, startDate, endDate]);

    const handleFilterChange = (key: string, value: string | null) => {
        const params: any = {};

        if (key === 'userId') {
            setUserId(value || 'all');
            params.userId = value;
        } else if (key === 'event') {
            setEvent(value || 'all');
            params.event = value;
        } else if (key === 'startDate') {
            setStartDate(value);
            params.startDate = value;
        } else if (key === 'endDate') {
            setEndDate(value);
            params.endDate = value;
        }

        fetchLogs(params);
    };

    const handleExport = () => {
        const query = new URLSearchParams();

        if (search) {
            query.append('search', search);
        }

        if (userId && userId !== 'all') {
            query.append('user_id', userId);
        }

        if (event && event !== 'all') {
            query.append('event', event);
        }

        if (startDate) {
            query.append('start_date', startDate);
        }

        if (endDate) {
            query.append('end_date', endDate);
        }

        window.location.href = `${auditRoutes.export().url}?${query.toString()}`;
    };

    const getEventColor = (evt: string) => {
        switch (evt) {
            case 'created':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'updated':
                return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'deleted':
                return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'auth':
                return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default:
                return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <>
            <Head title="System Audit" />

            <div className="w-full p-4">
                <PageHeader
                    title="System Audit Log"
                    description="View, filter, and export detailed system activity logs."
                    actions={
                        <Button
                            onClick={handleExport}
                            className="btn-specular border-none"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    }
                />

                <Card className="matte-card elev-1 mb-4 p-4">
                    <div className="flex flex-col items-end gap-4 lg:flex-row">
                        <div className="w-full lg:w-1/3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search description or user..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/6">
                            <Select
                                value={userId}
                                onValueChange={(val) =>
                                    handleFilterChange('userId', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Users
                                    </SelectItem>
                                    {users.map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={u.id.toString()}
                                        >
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full lg:w-1/6">
                            <Select
                                value={event}
                                onValueChange={(val) =>
                                    handleFilterChange('event', val)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Events" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Events
                                    </SelectItem>
                                    {events.map((e) => (
                                        <SelectItem
                                            key={e}
                                            value={e}
                                            className="capitalize"
                                        >
                                            {e}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full lg:w-[15%]">
                            <DatePicker
                                value={startDate}
                                onChange={(val) =>
                                    handleFilterChange('startDate', val)
                                }
                                placeholder="Start Date"
                            />
                        </div>
                        <div className="w-full lg:w-[15%]">
                            <DatePicker
                                value={endDate}
                                onChange={(val) =>
                                    handleFilterChange('endDate', val)
                                }
                                placeholder="End Date"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="matte-card elev-1 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border/50 bg-muted/40 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                <tr>
                                    <th className="w-[180px] px-6 py-4">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-4">Causer</th>
                                    <th className="px-6 py-4">Event</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-muted-foreground italic"
                                        >
                                            No logs found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-foreground">
                                                    {log.created_at}
                                                </div>
                                                <div className="font-mono text-[10px] tracking-tighter text-muted-foreground">
                                                    {log.created_at_human}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-foreground">
                                                {log.causer}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant="outline"
                                                    className={getEventColor(
                                                        log.event,
                                                    )}
                                                >
                                                    {log.event}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.subject_type ? (
                                                    <div className="bg-surface inline-block rounded px-2 py-1 font-mono text-xs">
                                                        {log.subject_type} #
                                                        {log.subject_id}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedLog(log)
                                                    }
                                                    className="btn-ghost-specular h-8 border-none px-3"
                                                >
                                                    <FileJson className="mr-2 h-3.5 w-3.5" />
                                                    View Raw
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-border/40 bg-muted/20 px-6 py-4">
                        <Pagination links={logs.links} meta={logs} />
                    </div>
                </Card>
            </div>

            <Dialog
                open={!!selectedLog}
                onOpenChange={() => setSelectedLog(null)}
            >
                <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
                    <DialogHeader>
                        <DialogTitle>Raw Audit Log</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto rounded-md bg-slate-950 p-4">
                        <pre className="font-mono text-xs whitespace-pre-wrap text-emerald-400">
                            {selectedLog
                                ? JSON.stringify(
                                      selectedLog.properties,
                                      null,
                                      2,
                                  )
                                : ''}
                        </pre>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

AuditIndex.layout = {
    breadcrumbs: [{ title: 'System Audit', href: auditRoutes.index().url }],
};
