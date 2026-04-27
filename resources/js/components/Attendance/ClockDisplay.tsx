import { useEffect, useState } from 'react';

export function ClockDisplay() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-2">
            <div className="relative">
                <div className="absolute inset-0 blur-3xl bg-green-500/10 rounded-full" />
                <div className="relative text-7xl font-black tracking-tight text-foreground sm:text-8xl tabular-nums drop-shadow-sm">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                </div>
            </div>
            <div className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] bg-muted/30 px-4 py-1 rounded-full border border-white/10">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
    );
}
