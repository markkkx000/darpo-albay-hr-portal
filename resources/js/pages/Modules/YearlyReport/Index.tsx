import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { index as yearlyreportIndexRoute, exportMethod as yearlyreportExportRoute } from '@/routes/yearlyreport';

interface ResultItem {
    emp_id: number;
    name: string;
    employee_number: string | null;
    division: string;
    milestone: number;
    type: 'loyalty' | 'salary';
    date: string;
}

interface PaginatedData<T> {
    data: T[];
    links: any[];
    current_page: number;
    from: number;
    last_page: number;
    to: number;
    total: number;
}

interface Props {
    results: PaginatedData<ResultItem>;
    year: number;
    filter: string;
}

export default function YearlyReport({ results, year, filter }: Props) {
    const [selectedYear, setSelectedYear] = useState(year.toString());
    const [selectedFilter, setSelectedFilter] = useState(filter);

    const handleFilterChange = (newYear: string, newFilter: string) => {
        router.get(yearlyreportIndexRoute().url, {
            year: newYear,
            filter: newFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleExport = () => {
        window.location.href = yearlyreportExportRoute({ query: { year: selectedYear, filter: selectedFilter } }).url;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);

    return (
        <>
            <Head title="Yearly Report" />
            
            <div className="p-4 w-full">
                <PageHeader
                    title="Yearly Report"
                    description="View and export loyalty and salary milestones for the year."
                    actions={
                        <Button onClick={handleExport} variant="ghost" className="btn-specular gap-2 px-6 border-none">
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 matte-card elev-2 px-4 py-4 rounded-2xl mb-6">
                    <div className="md:col-span-3">
                        <Select 
                            value={selectedYear} 
                            onValueChange={(val) => {
                                setSelectedYear(val);
                                handleFilterChange(val, selectedFilter);
                            }}
                        >
                            <SelectTrigger className="input-etched w-full">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3">
                        <Select 
                            value={selectedFilter} 
                            onValueChange={(val) => {
                                setSelectedFilter(val);
                                handleFilterChange(selectedYear, val);
                            }}
                        >
                            <SelectTrigger className="input-etched w-full">
                                <SelectValue placeholder="Filter By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Milestones</SelectItem>
                                <SelectItem value="loyalty">Loyalty Only</SelectItem>
                                <SelectItem value="salary">Salary Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="matte-card elev-2 rounded-2xl overflow-hidden border border-border/40">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[10px] text-muted-foreground uppercase bg-muted/40 font-bold tracking-widest border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 w-[15%]">Date</th>
                                    <th className="px-6 py-4 w-[30%]">Employee Name</th>
                                    <th className="px-6 py-4 w-[30%]">Division</th>
                                    <th className="px-6 py-4 text-center w-[15%]">Milestone</th>
                                    <th className="px-6 py-4 text-right w-[10%]">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {results.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 h-32 text-center text-muted-foreground">
                                            No milestones found for the selected year and filter.
                                        </td>
                                    </tr>
                                ) : (
                                    results.data.map((item, idx) => (
                                        <tr key={`${item.emp_id}-${idx}`} className="group hover:bg-primary/5 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                {formatDate(item.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{item.employee_number || 'NO-ID'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-sm font-medium">
                                                {item.division}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-baseline gap-1 bg-surface-2 px-3 py-1 rounded-xl border border-border/30">
                                                        <span className="font-black text-foreground">{item.milestone}</span>
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Years</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge 
                                                    variant="outline" 
                                                    className={item.type === 'salary' 
                                                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1" 
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1"
                                                    }
                                                >
                                                    {item.type === 'salary' ? 'Salary' : 'Loyalty'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4">
                    <Pagination links={results.links} meta={results} />
                </div>
            </div>
        </>
    );
}

YearlyReport.layout = {
    breadcrumbs: [
        { title: 'Yearly Report', href: '/yearlyreport' }
    ]
};
