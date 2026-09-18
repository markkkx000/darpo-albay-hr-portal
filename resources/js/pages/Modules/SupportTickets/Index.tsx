import { Head, Link, useForm } from '@inertiajs/react';
import { CircleDot, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { useState, useMemo } from 'react';
import { DatePicker } from '@/components/date-picker';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { show, refresh } from '@/routes/supporttickets';

type Ticket = {
    id: number;
    github_issue_id: string;
    title: string;
    type: string;
    status: string;
    created_at: string;
};

type Props = {
    tickets: Ticket[];
};

export default function SupportTicketsIndex({ tickets }: Props) {
    const [filter, setFilter] = useState<'open' | 'closed'>('open');
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState<string | null>(null);
    const [dateTo, setDateTo] = useState<string | null>(null);

    const { post, processing } = useForm();
    const uniqueTypes = useMemo(
        () => Array.from(new Set(tickets.map((t) => t.type))),
        [tickets],
    );

    const baseFilteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            if (
                searchQuery &&
                !t.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }

            if (typeFilter !== 'all' && t.type !== typeFilter) {
                return false;
            }

            if (dateFrom || dateTo) {
                const ticketDate = new Date(t.created_at).getTime();

                if (dateFrom) {
                    const from = new Date(dateFrom).getTime();

                    if (ticketDate < from) {
                        return false;
                    }
                }

                if (dateTo) {
                    const to = new Date(dateTo);
                    to.setHours(23, 59, 59, 999);

                    if (ticketDate > to.getTime()) {
                        return false;
                    }
                }
            }

            return true;
        });
    }, [tickets, searchQuery, typeFilter, dateFrom, dateTo]);

    const openCount = baseFilteredTickets.filter(
        (t) => t.status === 'open',
    ).length;
    const closedCount = baseFilteredTickets.filter(
        (t) => t.status === 'closed',
    ).length;

    const finalFilteredTickets = baseFilteredTickets.filter(
        (t) => t.status === filter,
    );

    return (
        <>
            <Head title="My Tickets" />
            <div className="flex flex-col gap-6 p-6">
                <PageHeader
                    title="My Tickets"
                    description="View and track your support requests."
                    actions={
                        <Button
                            variant="ghost"
                            className="btn-ghost-specular border-none"
                            onClick={() => post(refresh.url())}
                            disabled={processing}
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`}
                            />
                            Refresh Status
                        </Button>
                    }
                />

                {/* Filters Toolbar */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tickets..."
                            className="bg-background pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <Select
                            value={typeFilter}
                            onValueChange={setTypeFilter}
                        >
                            <SelectTrigger className="w-full bg-background sm:w-[140px]">
                                <SelectValue placeholder="Label" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Labels</SelectItem>
                                {uniqueTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="w-full sm:w-[140px]">
                            <DatePicker
                                placeholder="From Date"
                                value={dateFrom}
                                onChange={setDateFrom}
                            />
                        </div>
                        <div className="w-full sm:w-[140px]">
                            <DatePicker
                                placeholder="To Date"
                                value={dateTo}
                                onChange={setDateTo}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-6 border-b bg-muted/50 p-4">
                        <button
                            onClick={() => setFilter('open')}
                            className={`flex items-center gap-2 text-sm transition-colors ${filter === 'open' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CircleDot
                                className={`h-4 w-4 ${filter === 'open' ? 'text-foreground' : ''}`}
                            />
                            {openCount} Open
                        </button>
                        <button
                            onClick={() => setFilter('closed')}
                            className={`flex items-center gap-2 text-sm transition-colors ${filter === 'closed' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <CheckCircle2
                                className={`h-4 w-4 ${filter === 'closed' ? 'text-foreground' : ''}`}
                            />
                            {closedCount} Closed
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex flex-col">
                        {finalFilteredTickets.length === 0 ? (
                            <div className="bg-transparent p-12 text-center">
                                <h3 className="text-lg font-medium">
                                    No tickets found
                                </h3>
                                <p className="mt-1 text-muted-foreground">
                                    No {filter} support tickets match your
                                    filters.
                                </p>
                            </div>
                        ) : (
                            finalFilteredTickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex gap-3 border-b p-4 transition-colors last:border-0 hover:bg-muted/50"
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {ticket.status === 'open' ? (
                                            <CircleDot className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 text-purple-500" />
                                        )}
                                    </div>
                                    <div className="flex min-w-0 flex-col">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={show.url(ticket.id)}
                                                className="text-base leading-tight font-semibold text-foreground transition-colors hover:text-primary"
                                            >
                                                {ticket.title}
                                            </Link>
                                            <Badge
                                                variant="outline"
                                                className="h-5 rounded-full px-1.5 text-xs font-normal"
                                            >
                                                {ticket.type}
                                            </Badge>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                            {ticket.github_issue_id && (
                                                <span>
                                                    #{ticket.github_issue_id}
                                                </span>
                                            )}
                                            {ticket.github_issue_id && (
                                                <span>•</span>
                                            )}
                                            <span>
                                                opened on{' '}
                                                {new Date(
                                                    ticket.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

SupportTicketsIndex.layout = {
    breadcrumbs: [{ title: 'My Tickets', href: '#' }],
};
