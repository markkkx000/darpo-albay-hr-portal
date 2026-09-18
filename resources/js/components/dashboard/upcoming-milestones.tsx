import { CalendarClock, Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Milestone {
    emp_id: number;
    name: string;
    employee_number: string | null;
    division: string;
    milestone: number;
    type: 'loyalty' | 'salary';
    date: string;
}

export function UpcomingMilestones({
    milestones = [],
}: {
    milestones: Milestone[];
}) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Card className="matte-card elev-2 relative flex h-full flex-col overflow-hidden">
            <CardHeader className="relative z-10 border-b border-border/40 pb-3">
                <CardTitle className="flex items-center justify-between text-base font-bold">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                            <CalendarClock className="h-4 w-4" />
                        </div>
                        Upcoming Milestones (Next 30 Days)
                    </div>
                    {milestones.length > 0 && (
                        <Badge
                            variant="secondary"
                            className="border-none bg-primary/20 px-2.5 text-xs text-primary"
                        >
                            {milestones.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex-1 p-0">
                {milestones.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
                            <CalendarClock className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            No upcoming milestones
                        </p>
                        <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                            There are no loyalty or salary milestones in the
                            next 30 days.
                        </p>
                    </div>
                ) : (
                    <div className="custom-scrollbar max-h-[320px] divide-y divide-border/30 overflow-y-auto">
                        {milestones.map((milestone, idx) => (
                            <div
                                key={`${milestone.emp_id}-${idx}`}
                                className="group flex items-start gap-3 p-4 transition-colors hover:bg-surface-2/50"
                            >
                                <div className="mt-0.5">
                                    {milestone.type === 'loyalty' ? (
                                        <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500 transition-colors group-hover:bg-amber-500/20">
                                            <Award className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500 transition-colors group-hover:bg-blue-500/20">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex items-center justify-between gap-2">
                                        <p className="truncate text-sm font-bold text-foreground">
                                            {milestone.name}
                                        </p>
                                        <span className="text-xs font-medium whitespace-nowrap text-muted-foreground">
                                            {formatDate(milestone.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-border/50 text-[10px] font-semibold tracking-wider uppercase"
                                        >
                                            {milestone.milestone} Years
                                        </Badge>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {milestone.type === 'loyalty'
                                                ? 'Loyalty Award'
                                                : 'Step Increment'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
