import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResultItem {
    emp_id: number;
    name: string;
    employee_number: string | null;
    division: string;
    milestone: number;
    type: 'loyalty' | 'salary';
    date: string;
}

interface Props {
    results: ResultItem[];
    year: number;
    filter: string;
}

export default function YearlyReport({ results, year, filter }: Props) {
    const [selectedYear, setSelectedYear] = useState(year.toString());
    const [selectedFilter, setSelectedFilter] = useState(filter);

    const handleFilterChange = (newYear: string, newFilter: string) => {
        router.get('/yearlyreport', {
            year: newYear,
            filter: newFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleExport = () => {
        window.location.href = `/yearlyreport/export?year=${selectedYear}&filter=${selectedFilter}`;
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
                        <Table>
                            <TableHeader className="bg-surface-2/50 backdrop-blur-sm">
                                <TableRow className="hover:bg-transparent border-border/40">
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground w-[15%]">Date</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground w-[30%]">Employee Name</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground w-[30%]">Division</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground text-center w-[15%]">Milestone</TableHead>
                                    <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground text-right w-[10%]">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            No milestones found for the selected year and filter.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    results.map((item, idx) => (
                                        <TableRow key={`${item.emp_id}-${idx}`} className="group hover:bg-primary/5 border-border/20 transition-colors">
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {formatDate(item.date)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.name}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">{item.employee_number || 'NO-ID'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-medium">
                                                {item.division}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-baseline gap-1 bg-surface-2 px-3 py-1 rounded-xl border border-border/30">
                                                        <span className="font-black text-foreground">{item.milestone}</span>
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Years</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge 
                                                    variant="outline" 
                                                    className={item.type === 'salary' 
                                                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1" 
                                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1"
                                                    }
                                                >
                                                    {item.type === 'salary' ? 'Salary' : 'Loyalty'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
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
