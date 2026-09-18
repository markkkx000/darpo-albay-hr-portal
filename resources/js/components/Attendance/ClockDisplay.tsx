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
        <div className="flex flex-col items-center justify-center space-y-2 p-6">
            <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-500/10 blur-3xl" />
                <div className="relative text-7xl font-black tracking-tight text-foreground tabular-nums drop-shadow-sm sm:text-8xl">
                    {time.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                    })}
                </div>
            </div>
            <div className="rounded-full border border-white/10 bg-muted/30 px-4 py-1 text-sm font-bold tracking-[0.2em] text-muted-foreground uppercase">
                {time.toLocaleDateString([], {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                })}
            </div>
        </div>
    );
}
