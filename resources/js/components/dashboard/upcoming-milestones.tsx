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

export function UpcomingMilestones({ milestones = [] }: { milestones: Milestone[] }) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Card className="matte-card elev-2 h-full flex flex-col relative overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40 relative z-10">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                            <CalendarClock className="w-4 h-4" />
                        </div>
                        Upcoming Milestones (Next 30 Days)
                    </div>
                    {milestones.length > 0 && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-xs px-2.5">
                            {milestones.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative z-10">
                {milestones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-3">
                            <CalendarClock className="h-5 w-5 text-muted-foreground opacity-50" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No upcoming milestones</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            There are no loyalty or salary milestones in the next 30 days.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/30 max-h-[320px] overflow-y-auto custom-scrollbar">
                        {milestones.map((milestone, idx) => (
                            <div 
                                key={`${milestone.emp_id}-${idx}`} 
                                className="p-4 flex items-start gap-3 hover:bg-surface-2/50 transition-colors group"
                            >
                                <div className="mt-0.5">
                                    {milestone.type === 'loyalty' ? (
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                                            <Award className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p className="text-sm font-bold text-foreground truncate">
                                            {milestone.name}
                                        </p>
                                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                            {formatDate(milestone.date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-semibold tracking-wider border-border/50 uppercase">
                                            {milestone.milestone} Years
                                        </Badge>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {milestone.type === 'loyalty' ? 'Loyalty Award' : 'Step Increment'}
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
