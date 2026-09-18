import { router } from '@inertiajs/react';
import { Search, X, Filter, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FilterProps {
    filters: {
        search?: string;
        status?: string;
        from_date?: string;
        to_date?: string;
    };
    routeName: string;
}

export function AttendanceFilters({ filters, routeName }: FilterProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');

    const updateFilters = useCallback(
        (overrides: any = {}) => {
            const query: any = {
                search:
                    overrides.search !== undefined ? overrides.search : search,
                status:
                    overrides.status !== undefined ? overrides.status : status,
                from_date:
                    overrides.from_date !== undefined
                        ? overrides.from_date
                        : fromDate,
                to_date:
                    overrides.to_date !== undefined
                        ? overrides.to_date
                        : toDate,
            };

            // Remove defaults/empty values from query
            if (!query.search) {
                delete query.search;
            }

            if (query.status === 'all') {
                delete query.status;
            }

            if (!query.from_date) {
                delete query.from_date;
            }

            if (!query.to_date) {
                delete query.to_date;
            }

            router.get(routeName, query, {
                preserveState: true,
                replace: true,
            });
        },
        [search, status, fromDate, toDate, routeName],
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                updateFilters({ search });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, filters.search, updateFilters]);

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        setFromDate('');
        setToDate('');
        router.get(
            routeName,
            {},
            {
                preserveState: false,
                replace: true,
            },
        );
    };

    return (
        <div className="matte-card elev-2 space-y-6 p-6">
            <div className="flex w-fit items-center gap-2 rounded-xl border border-white/5 bg-muted/20 px-3 py-1 font-bold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-xs tracking-widest uppercase">
                    Filters
                </span>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Search */}
                <div className="group space-y-2.5">
                    <Label
                        htmlFor="search"
                        className="ml-0.5 text-[10px] font-bold tracking-[0.15em] text-muted-foreground/80 uppercase"
                    >
                        Search Employee
                    </Label>
                    <div className="focus-glow relative rounded-2xl">
                        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateFilters({ search });
                                }
                            }}
                            placeholder="Type name..."
                            className="input-etched !pl-11"
                        />
                        {search && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    updateFilters({ search: '' });
                                }}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-destructive"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Dropdown */}
                <div className="group space-y-2.5">
                    <Label className="ml-0.5 text-[10px] font-bold tracking-[0.15em] text-muted-foreground/80 uppercase">
                        Status
                    </Label>
                    <div className="focus-glow rounded-2xl">
                        <Select
                            value={status}
                            onValueChange={(val) => {
                                setStatus(val);
                                updateFilters({ status: val });
                            }}
                        >
                            <SelectTrigger className="input-etched h-11">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="matte-card elev-3 border-white/10">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="incomplete">
                                    Incomplete / Missing Logs
                                </SelectItem>
                                <SelectItem value="half_day">
                                    Half Day
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date Range From */}
                <div className="group space-y-2.5">
                    <Label
                        htmlFor="from_date"
                        className="ml-0.5 text-[10px] font-bold tracking-[0.15em] text-muted-foreground/80 uppercase"
                    >
                        From Date
                    </Label>
                    <div className="focus-glow relative rounded-2xl">
                        <DatePicker
                            id="from_date"
                            value={fromDate}
                            onChange={(val) => {
                                setFromDate(val || '');
                                updateFilters({ from_date: val || '' });
                            }}
                        />
                    </div>
                </div>

                {/* Date Range To */}
                <div className="group space-y-2.5">
                    <Label
                        htmlFor="to_date"
                        className="ml-0.5 text-[10px] font-bold tracking-[0.15em] text-muted-foreground/80 uppercase"
                    >
                        To Date
                    </Label>
                    <div className="focus-glow relative rounded-2xl">
                        <DatePicker
                            id="to_date"
                            value={toDate}
                            onChange={(val) => {
                                setToDate(val || '');
                                updateFilters({ to_date: val || '' });
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase transition hover:bg-primary/5 hover:text-primary"
                >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Reset All Filters
                </Button>
            </div>
        </div>
    );
}
