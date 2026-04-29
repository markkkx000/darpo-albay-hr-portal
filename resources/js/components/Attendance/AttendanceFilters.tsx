import { router } from '@inertiajs/react';
import { Search, X, Calendar, Filter, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

    const updateFilters = useCallback((overrides: any = {}) => {
        const query: any = {
            search: overrides.search !== undefined ? overrides.search : search,
            status: overrides.status !== undefined ? overrides.status : status,
            from_date: overrides.from_date !== undefined ? overrides.from_date : fromDate,
            to_date: overrides.to_date !== undefined ? overrides.to_date : toDate,
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
    }, [search, status, fromDate, toDate, routeName]);

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
        router.get(routeName, {}, {
            preserveState: false,
            replace: true,
        });
    };

    return (
        <div className="liquid-glass rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-foreground font-bold bg-muted/20 w-fit px-3 py-1 rounded-lg border border-white/5">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-widest">Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="space-y-2 group">
                    <Label htmlFor="search" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Search Employee</Label>
                    <div className="relative focus-glow rounded-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
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
                            className="pl-10 h-10 bg-muted/20 border-white/10 ring-offset-background focus-visible:ring-0"
                        />
                        {search && (
                            <button
                                onClick={() => {
 setSearch(''); updateFilters({ search: '' }); 
}}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Status</Label>
                    <div className="focus-glow rounded-lg">
                        <Select
                            value={status}
                            onValueChange={(val) => {
                                setStatus(val);
                                updateFilters({ status: val });
                            }}
                        >
                            <SelectTrigger className="h-10 bg-muted/20 border-white/10 focus:ring-0">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="liquid-glass border-white/10">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="working">Currently Working</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="incomplete">Incomplete (Missing Out)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Date Range From */}
                <div className="space-y-2 group">
                    <Label htmlFor="from_date" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">From Date</Label>
                    <div className="relative focus-glow rounded-lg">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                        <Input
                            id="from_date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFromDate(val);
                                updateFilters({ from_date: val });
                            }}
                            className="pl-10 h-10 bg-muted/20 border-white/10 focus:ring-0"
                        />
                    </div>
                </div>

                {/* Date Range To */}
                <div className="space-y-2 group">
                    <Label htmlFor="to_date" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">To Date</Label>
                    <div className="relative focus-glow rounded-lg">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                        <Input
                            id="to_date"
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setToDate(val);
                                updateFilters({ to_date: val });
                            }}
                            className="pl-10 h-10 bg-muted/20 border-white/10 focus:ring-0"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-white/5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all hover:bg-primary/5"
                >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset All Filters
                </Button>
            </div>
        </div>
    );
}
