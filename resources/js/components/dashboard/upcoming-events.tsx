import { Calendar } from 'lucide-react';

export function UpcomingEvents({ events }: { events: any[] }) {
    return (
        <div className="matte-card elev-2 flex min-h-[300px] flex-col">
            <div className="border-b border-border-1 p-5">
                <h3 className="text-lg font-bold">Upcoming</h3>
            </div>
            <div className="max-h-[300px] flex-1 overflow-y-auto p-5">
                {!events || events.length === 0 ? (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center opacity-50">
                        <Calendar className="mb-2 h-10 w-10" />
                        <p className="text-sm font-medium">
                            No upcoming events
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((evt: any) => (
                            <div
                                key={evt.id}
                                className="flex items-center gap-4"
                            >
                                <div className="min-w-[50px] rounded-lg border border-border-2 bg-surface-2 p-2 text-center">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                        {evt.date.split(' ')[0]}
                                    </div>
                                    <div className="text-lg leading-none font-black">
                                        {evt.date
                                            .split(' ')[1]
                                            .replace(',', '')}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                        {evt.title}
                                    </div>
                                    <div className="text-[10px] font-bold tracking-wider text-primary uppercase">
                                        {evt.type === 'holiday'
                                            ? 'Holiday'
                                            : 'Event'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
