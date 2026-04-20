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
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary font-semibold">
                <Filter className="w-4 w-4" />
                <span>Filters</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search Employee</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    updateFilters({ search });
                                }
                            }}
                            placeholder="Name..."
                            className="pl-10 h-10 bg-muted/50 border-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        {search && (
                            <button
                                onClick={() => {
 setSearch(''); updateFilters({ search: '' }); 
}}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
                    <Select
                        value={status}
                        onValueChange={(val) => {
                            setStatus(val);
                            updateFilters({ status: val });
                        }}
                    >
                        <SelectTrigger className="h-10 bg-muted/50 border-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="working">Currently Working</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="incomplete">Incomplete (Missing Out)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range From */}
                <div className="space-y-2">
                    <Label htmlFor="from_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="from_date"
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFromDate(val);
                                updateFilters({ from_date: val });
                            }}
                            className="pl-10 h-10 bg-muted/50 border-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Date Range To */}
                <div className="space-y-2">
                    <Label htmlFor="to_date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="to_date"
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                const val = e.target.value;
                                setToDate(val);
                                updateFilters({ to_date: val });
                            }}
                            className="pl-10 h-10 bg-muted/50 border-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-primary transition-colors"
                >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Reset All Filters
                </Button>
            </div>
        </div>
    );
}
