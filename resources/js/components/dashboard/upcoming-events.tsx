import { Calendar } from 'lucide-react';

export function UpcomingEvents({ events }: { events: any[] }) {
    return (
        <div className="matte-card elev-2 flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-border-1">
                <h3 className="text-lg font-bold">Upcoming</h3>
            </div>
            <div className="flex-1 p-5 overflow-y-auto max-h-[300px]">
                {!events || events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 min-h-[200px]">
                        <Calendar className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium">No upcoming events</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((evt: any) => (
                            <div key={evt.id} className="flex items-center gap-4">
                                <div className="bg-surface-2 border border-border-2 rounded-lg p-2 text-center min-w-[50px]">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{evt.date.split(' ')[0]}</div>
                                    <div className="text-lg font-black leading-none">{evt.date.split(' ')[1].replace(',', '')}</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold truncate">{evt.title}</div>
                                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider">{evt.type === 'holiday' ? 'Holiday' : 'Event'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
